import { describe, it, expect } from '@jest/globals';
import { calculateScore } from '../scorer.js';

// scorer.js is a pure function — no mocking required.

describe('calculateScore', () => {
  // ── Edge cases ──────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('returns score 100 when checks array is empty', () => {
      expect(calculateScore([])).toEqual({
        overall_score: 100,
        applicable_count: 0,
        passed_count: 0,
        failed_count: 0,
        critical_count: 0,
      });
    });

    it('returns score 100 when all checks have pass:null (not applicable)', () => {
      const checks = [
        { pass: null, severity: 'high' },
        { pass: null, severity: 'low' },
      ];
      expect(calculateScore(checks)).toEqual({
        overall_score: 100,
        applicable_count: 0,
        passed_count: 0,
        failed_count: 0,
        critical_count: 0,
      });
    });
  });

  // ── All pass / all fail ─────────────────────────────────────────────────────
  describe('all pass or all fail', () => {
    it('returns score 100 when all checks pass', () => {
      const checks = [
        { pass: true, severity: 'high' },
        { pass: true, severity: 'medium' },
        { pass: true, severity: 'low' },
      ];
      const result = calculateScore(checks);
      expect(result.overall_score).toBe(100);
      expect(result.passed_count).toBe(3);
      expect(result.failed_count).toBe(0);
      expect(result.critical_count).toBe(0);
    });

    it('returns score 0 when all checks fail', () => {
      const checks = [
        { pass: false, severity: 'high' },
        { pass: false, severity: 'medium' },
      ];
      const result = calculateScore(checks);
      expect(result.overall_score).toBe(0);
      expect(result.passed_count).toBe(0);
      expect(result.failed_count).toBe(2);
    });
  });

  // ── Mixed results ───────────────────────────────────────────────────────────
  describe('mixed results', () => {
    it('calculates 50% score correctly', () => {
      const checks = [
        { pass: true, severity: 'medium' },
        { pass: false, severity: 'medium' },
      ];
      expect(calculateScore(checks).overall_score).toBe(50);
    });

    it('calculates 75% score correctly', () => {
      const checks = [
        { pass: true, severity: 'low' },
        { pass: true, severity: 'low' },
        { pass: true, severity: 'low' },
        { pass: false, severity: 'medium' },
      ];
      expect(calculateScore(checks).overall_score).toBe(75);
    });

    it('calculates 33% score and rounds correctly', () => {
      const checks = [
        { pass: true, severity: 'low' },
        { pass: false, severity: 'medium' },
        { pass: false, severity: 'high' },
      ];
      // 1/3 = 33.33... → rounds to 33
      expect(calculateScore(checks).overall_score).toBe(33);
    });

    it('ignores null-pass checks in percentage calculation', () => {
      const checks = [
        { pass: true, severity: 'low' },
        { pass: null, severity: 'high' },  // not applicable, ignored
        { pass: false, severity: 'medium' },
      ];
      // 1 out of 2 applicable = 50
      const result = calculateScore(checks);
      expect(result.overall_score).toBe(50);
      expect(result.applicable_count).toBe(2);
    });
  });

  // ── Critical count (high-severity failures) ─────────────────────────────────
  describe('critical_count', () => {
    it('counts only high-severity failures as critical', () => {
      const checks = [
        { pass: false, severity: 'high' },
        { pass: false, severity: 'high' },
        { pass: false, severity: 'medium' },
        { pass: false, severity: 'low' },
        { pass: true, severity: 'high' },  // passed, not critical
      ];
      expect(calculateScore(checks).critical_count).toBe(2);
    });

    it('critical_count is 0 when no high-severity failures', () => {
      const checks = [
        { pass: false, severity: 'medium' },
        { pass: false, severity: 'low' },
      ];
      expect(calculateScore(checks).critical_count).toBe(0);
    });

    it('critical_count is 0 when all high-severity checks pass', () => {
      const checks = [
        { pass: true, severity: 'high' },
        { pass: true, severity: 'high' },
      ];
      expect(calculateScore(checks).critical_count).toBe(0);
    });
  });

  // ── Count accuracy ──────────────────────────────────────────────────────────
  describe('counts', () => {
    it('returns correct applicable, passed, and failed counts', () => {
      const checks = [
        { pass: true, severity: 'low' },
        { pass: true, severity: 'high' },
        { pass: false, severity: 'medium' },
        { pass: null, severity: 'high' },
      ];
      const result = calculateScore(checks);
      expect(result.applicable_count).toBe(3);
      expect(result.passed_count).toBe(2);
      expect(result.failed_count).toBe(1);
    });
  });
});
