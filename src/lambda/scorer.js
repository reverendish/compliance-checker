export function calculateScore(allChecks) {
  const applicable = allChecks.filter(c => c.pass !== null);
  if (applicable.length === 0) {
    return { overall_score: 100, applicable_count: 0, passed_count: 0, failed_count: 0, critical_count: 0 };
  }
  const passed = applicable.filter(c => c.pass === true).length;
  const failed = applicable.filter(c => c.pass === false).length;
  const critical = applicable.filter(c => c.pass === false && c.severity === 'high').length;
  return {
    overall_score: Math.round((passed / applicable.length) * 100),
    applicable_count: applicable.length,
    passed_count: passed,
    failed_count: failed,
    critical_count: critical
  };
}
