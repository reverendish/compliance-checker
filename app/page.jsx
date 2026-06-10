"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";

const EXAMPLES = [
  { label: 'Moonpig',      url: 'https://www.moonpig.com' },
  { label: 'Monzo',        url: 'https://monzo.com' },
  { label: 'Purplebricks', url: 'https://www.purplebricks.co.uk' },
];

const SEVERITY = {
  high:   { label: "High",   cls: "sevHigh"   },
  medium: { label: "Medium", cls: "sevMedium" },
  low:    { label: "Low",    cls: "sevLow"    },
};

const GROUP_META = {
  data_protection:  { icon: "🔒", label: "Data Protection & Privacy" },
  security_company: { icon: "🏢", label: "Security & Company Info" },
  consumer_law:     { icon: "⚖️",  label: "Consumer Law" },
  marketing:        { icon: "📣", label: "Marketing & Advertising" },
  accessibility:    { icon: "♿", label: "Accessibility" },
  sector_specific:  { icon: "🏷️",  label: "Sector-Specific" },
};

function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#1a7a4a" : pct >= 40 ? "#b45309" : "#b91c1c";
  return (
    <svg width="112" height="112" style={{ flexShrink: 0 }}>
      <circle cx="56" cy="56" r={r} fill="none" stroke="#e2e0db" strokeWidth="7" />
      <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 56 56)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="56" y="52" textAnchor="middle" fontSize="26" fontWeight="600" fill={color} fontFamily="-apple-system, sans-serif">{Math.round(pct)}</text>
      <text x="56" y="68" textAnchor="middle" fontSize="11" fill="#6b6860"   fontFamily="-apple-system, sans-serif">/ 100</text>
    </svg>
  );
}

function CheckRow({ check, delay }) {
  const pass = check.pass;
  let statusCls, statusIcon, borderColor;
  if (pass === true)       { statusCls = "statusPass"; statusIcon = "✓"; borderColor = "#1a7a4a"; }
  else if (pass === false) { statusCls = "statusFail"; statusIcon = "✗"; borderColor = "#b91c1c"; }
  else                     { statusCls = "statusNa";   statusIcon = "—"; borderColor = "#d1d5db"; }

  const sev = SEVERITY[check.severity] || SEVERITY.low;

  return (
    <div className={`${styles.checkRow} fade-up`} style={{ borderLeftColor: borderColor, animationDelay: `${delay}ms` }}>
      <div className={`${styles.statusDot} ${styles[statusCls]}`}>{statusIcon}</div>
      <div className={styles.checkBody}>
        <div className={styles.checkHeader}>
          <span className={styles.checkLabel}>{check.label}</span>
          <span className={styles.lawTag}>{check.law}</span>
        </div>
        <p className={styles.checkExplanation}>{check.explanation}</p>
      </div>
      <span className={`${styles.sevBadge} ${styles[sev.cls]}`}>{sev.label}</span>
    </div>
  );
}

function GroupSection({ groupId, checks, isLoading, isError, errorMessage }) {
  const meta  = GROUP_META[groupId] || { icon: "•", label: groupId };
  const passed = checks.filter(c => c.pass === true).length;
  const failed = checks.filter(c => c.pass === false).length;
  const na     = checks.filter(c => c.pass === null).length;

  return (
    <div className={styles.groupSection}>
      <div className={styles.groupHeader}>
        <span className={styles.groupIcon}>{meta.icon}</span>
        <span className={styles.groupLabel}>{meta.label}</span>
        {isLoading && <span className={styles.groupSpinner} />}
        {!isLoading && !isError && checks.length > 0 && (
          <div className={styles.groupCounts}>
            {failed > 0 && <span className={styles.gcFail}>{failed} failed</span>}
            {passed > 0 && <span className={styles.gcPass}>{passed} passed</span>}
            {na > 0     && <span className={styles.gcNa}>{na} n/a</span>}
          </div>
        )}
        {isError && <span className={styles.groupErrorBadge}>error</span>}
      </div>

      {isError && (
        <p className={styles.groupErrorMsg}>⚠ {errorMessage}</p>
      )}

      {checks.length > 0 && (
        <div className={styles.checkList}>
          {checks.map((c, i) => <CheckRow key={c.id} check={c} delay={i * 35} />)}
        </div>
      )}
    </div>
  );
}

const GROUP_ORDER = ["data_protection", "security_company", "consumer_law", "marketing", "accessibility", "sector_specific"];

export default function ComplianceChecker() {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta]       = useState(null);          // { site_name, total_checks, js_shell, … }
  const [groups, setGroups]   = useState({});            // { groupId: { checks, done, error } }
  const [score, setScore]     = useState(null);          // { overall_score, critical_count }
  const [error, setError]     = useState(null);
  const abortRef = useRef(null);

  const reset = () => {
    abortRef.current?.abort();
    setMeta(null); setGroups({}); setScore(null); setError(null); setUrl("");
  };

  const audit = async (target) => {
    let u = (target || url).trim();
    if (!u) return;
    if (!u.startsWith("http")) u = "https://" + u;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setMeta(null);
    setScore(null);
    if (target) setUrl(u);

    // Groups are initialised when the 'classified' chunk arrives with batch_ids
    setGroups({});

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_AUDIT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (!line.trim()) continue;
          let chunk;
          try { chunk = JSON.parse(line); } catch { continue; }

          if (chunk.type === "meta") {
            setMeta(chunk);
          } else if (chunk.type === "classified") {
            setMeta(prev => ({ ...prev, sector: chunk.sector, sector_name: chunk.sector_name, batch_ids: chunk.batch_ids }));
            // Initialise exactly the groups that will run
            if (chunk.batch_ids?.length) {
              const initial = {};
              chunk.batch_ids.forEach(id => { initial[id] = { checks: [], done: false, error: null }; });
              setGroups(initial);
            }
          } else if (chunk.type === "group") {
            setGroups(prev => ({
              ...prev,
              [chunk.group_id]: { checks: chunk.checks, done: true, error: null },
            }));
          } else if (chunk.type === "group_error") {
            setGroups(prev => ({
              ...prev,
              [chunk.group_id]: { checks: [], done: true, error: chunk.message },
            }));
          } else if (chunk.type === "done") {
            setScore({ overall_score: chunk.overall_score, critical_count: chunk.critical_count });
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allChecks    = Object.values(groups).flatMap(g => g.checks);
  const totalPassed  = allChecks.filter(c => c.pass === true).length;
  const totalFailed  = allChecks.filter(c => c.pass === false).length;
  const totalNa      = allChecks.filter(c => c.pass === null).length;
  const groupsDone   = Object.values(groups).filter(g => g.done).length;
  const groupsTotal  = Object.keys(groups).length;
  const hasAnyResult = allChecks.length > 0 || groupsDone > 0;

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <a href="https://ishsitotombe.co.uk" className={styles.navBrand}>ish.</a>
        <a href="https://ishsitotombe.co.uk/#contact" className={styles.navCta}>Get in touch</a>
      </nav>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <span className={styles.tag}>Free tool · UK compliance</span>
          <h1 className={styles.heading}>Website compliance checker</h1>
          <p className={styles.subheading}>
            Full UK legal audit — GDPR, PECR, Companies Act, Consumer Rights Act, and more.
            Up to 260 checks across 21 industry categories. Results in under a minute.
          </p>
        </div>

        {/* Input */}
        <div className={styles.inputCard}>
          <div className={styles.inputRow}>
            <span className={styles.inputIcon}>↗</span>
            <input
              type="url"
              className={styles.input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && audit()}
              placeholder="https://yourbusiness.co.uk"
              disabled={loading}
            />
            <button
              className={styles.auditBtn}
              onClick={() => audit()}
              disabled={loading || !url.trim()}
            >
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : "Run audit"}
            </button>
          </div>

          {!hasAnyResult && !loading && (
            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Try an example:</span>
              {EXAMPLES.map(ex => (
                <button key={ex.url} className={styles.exampleBtn} onClick={() => audit(ex.url)}>
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results area */}
        {(loading || hasAnyResult) && (
          <div className={styles.results}>

            {/* Score header */}
            <div className={styles.scoreCard}>
              {score ? (
                <ScoreRing score={score.overall_score} />
              ) : (
                <div className={styles.scoreRingPlaceholder} />
              )}

              <div className={styles.scoreInfo}>
                <p className={styles.siteName}>{meta?.site_name || url}</p>
                {meta?.sector_name && (
                  <span className={styles.sectorBadge}>{meta.sector_name}</span>
                )}

                {score ? (
                  <div className={styles.scoreCounts}>
                    <span className={styles.countPass}>{totalPassed} passed</span>
                    <span className={styles.countFail}>{totalFailed} failed</span>
                    {totalNa > 0 && <span className={styles.countNa}>{totalNa} n/a</span>}
                    {score.critical_count > 0 && (
                      <span className={styles.critBadge}>{score.critical_count} critical</span>
                    )}
                  </div>
                ) : (
                  <p className={styles.progressLabel}>
                    {groupsDone} of {groupsTotal || '…'} categories checked
                    {meta?.total_checks ? ` · ${allChecks.length} / ${meta.total_checks} checks` : ""}
                  </p>
                )}
              </div>

              {hasAnyResult && (
                <button className={styles.resetBtn} onClick={reset}>New audit</button>
              )}
            </div>

            {/* Warnings */}
            {meta?.js_shell && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⚠</span>
                <p>{meta.js_shell_reason}</p>
              </div>
            )}
            {meta?.fetch_warning && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⚠</span>
                <p>{meta.fetch_warning}</p>
              </div>
            )}

            {/* Group sections */}
            <div className={styles.groupList}>
              {GROUP_ORDER.map(groupId => {
                const g = groups[groupId];
                if (!g) return null;
                return (
                  <GroupSection
                    key={groupId}
                    groupId={groupId}
                    checks={g.checks}
                    isLoading={!g.done}
                    isError={!!g.error}
                    errorMessage={g.error}
                  />
                );
              })}
            </div>

            {/* Footer CTA — only once all done */}
            {score && (
              <div className={`${styles.footer} fade-up`}>
                <div className={styles.footerDisclaimer}>
                  <strong>Limitations:</strong> This scans publicly visible HTML only — it cannot execute JavaScript, verify actual cookie behaviour, or inspect backend systems. Results are indicative, not legal advice.
                </div>
                <div className={styles.footerCta}>
                  <p>Issues found on <strong>{meta?.site_name}</strong>? I can fix them.</p>
                  <a href="https://ishsitotombe.co.uk/#contact" className={styles.ctaBtn} target="_blank" rel="noopener noreferrer">
                    Get in touch →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
