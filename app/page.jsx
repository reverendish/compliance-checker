"use client";

import { useState } from "react";
import styles from "./page.module.css";

const EXAMPLES = [
  { label: "Savills",      url: "https://www.savills.co.uk" },
  { label: "Foxtons",      url: "https://www.foxtons.co.uk" },
  { label: "Purplebricks", url: "https://www.purplebricks.co.uk" },
];

const SEVERITY = {
  high:   { label: "High risk",   cls: "sevHigh"   },
  medium: { label: "Medium risk", cls: "sevMedium"  },
  low:    { label: "Low risk",    cls: "sevLow"     },
};

const LOADING_STEPS = [
  "Fetching page…",
  "Checking cookie consent…",
  "Scanning legal disclosures…",
  "Auditing company information…",
  "Calculating compliance score…",
];

function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#1a7a4a" : pct >= 40 ? "#b45309" : "#b91c1c";

  return (
    <svg width="112" height="112" style={{ flexShrink: 0 }}>
      <circle cx="56" cy="56" r={r} fill="none" stroke="#e2e0db" strokeWidth="7" />
      <circle
        cx="56" cy="56" r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 56 56)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="56" y="52" textAnchor="middle" fontSize="26" fontWeight="600" fill={color} fontFamily="-apple-system, sans-serif">
        {Math.round(pct)}
      </text>
      <text x="56" y="68" textAnchor="middle" fontSize="11" fill="#6b6860" fontFamily="-apple-system, sans-serif">
        / 100
      </text>
    </svg>
  );
}

function CheckCard({ check, delay }) {
  const pass = check.pass;
  const sev = SEVERITY[check.severity] || SEVERITY.low;

  let statusCls, statusIcon, borderColor;
  if (pass === true)  { statusCls = "statusPass"; statusIcon = "✓"; borderColor = "#1a7a4a"; }
  else if (pass === false) { statusCls = "statusFail"; statusIcon = "✗"; borderColor = "#b91c1c"; }
  else                { statusCls = "statusNa";   statusIcon = "—"; borderColor = "#d1d5db"; }

  return (
    <div
      className={`${styles.checkCard} fade-up`}
      style={{ borderLeftColor: borderColor, animationDelay: `${delay}ms` }}
    >
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

export default function ComplianceChecker() {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError]     = useState(null);

  const audit = async (target) => {
    let u = (target || url).trim();
    if (!u) return;
    if (!u.startsWith("http")) u = "https://" + u;

    setLoading(true);
    setError(null);
    setResults(null);
    setStepIdx(0);
    if (target) setUrl(u);

    let i = 0;
    const iv = setInterval(() => { i = (i + 1) % LOADING_STEPS.length; setStepIdx(i); }, 2400);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  };

  const reset = () => { setResults(null); setUrl(""); setError(null); };

  const passed   = results?.checks.filter(c => c.pass === true).length  ?? 0;
  const failed   = results?.checks.filter(c => c.pass === false).length ?? 0;
  const na       = results?.checks.filter(c => c.pass === null).length  ?? 0;

  return (
    <main className={styles.main}>
      {/* Nav */}
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
            Instant audit against GDPR, PECR, and consumer law.
            Paste any UK website URL — results in under a minute.
          </p>
        </div>

        {/* Input card */}
        <div className={styles.inputCard}>
          <div className={styles.inputRow}>
            <span className={styles.inputIcon}>↗</span>
            <input
              type="url"
              className={styles.input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && audit()}
              placeholder="https://yourestatevagent.co.uk"
              disabled={loading}
            />
            <button
              className={styles.auditBtn}
              onClick={() => audit()}
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                "Run audit"
              )}
            </button>
          </div>

          {/* Examples */}
          {!results && !loading && (
            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Estate agent examples:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex.url}
                  className={styles.exampleBtn}
                  onClick={() => audit(ex.url)}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingStep}>{LOADING_STEPS[stepIdx]}</p>
            <p className={styles.loadingNote}>Fetching and analysing — usually 20–40 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className={`${styles.results} fade-up`}>
            {/* Score header */}
            <div className={styles.scoreCard}>
              <ScoreRing score={results.overall_score} />

              <div className={styles.scoreInfo}>
                <p className={styles.siteName}>{results.site_name}</p>
                <div className={styles.scoreCounts}>
                  <span className={styles.countPass}>{passed} passed</span>
                  <span className={styles.countFail}>{failed} failed</span>
                  {na > 0 && <span className={styles.countNa}>{na} n/a</span>}
                  {results.critical_count > 0 && (
                    <span className={styles.critBadge}>
                      {results.critical_count} critical
                    </span>
                  )}
                </div>
              </div>

              <button className={styles.resetBtn} onClick={reset}>New audit</button>
            </div>

            {/* JS-shell / fetch warnings */}
            {(results._warning || results._fetchWarning) && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⚠</span>
                <p>{results._warning || results._fetchWarning}</p>
              </div>
            )}

            {/* Check cards */}
            <div className={styles.checks}>
              {results.checks.map((check, i) => (
                <CheckCard key={check.id} check={check} delay={i * 45} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className={styles.footer}>
              <div className={styles.footerDisclaimer}>
                <strong>Limitations:</strong> This scans publicly visible content only —
                it cannot execute JavaScript, verify actual cookie behaviour, or
                inspect backend systems. This is not legal advice.
              </div>
              <div className={styles.footerCta}>
                <p>Issues found on <strong>{results.site_name}</strong>? I can fix them.</p>
                <a
                  href="https://ishsitotombe.co.uk/#contact"
                  className={styles.ctaBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get in touch →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
