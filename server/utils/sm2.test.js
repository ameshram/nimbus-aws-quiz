import { describe, it, expect } from 'vitest';
import { computeSm2 } from './sm2.js';

describe('computeSm2', () => {
  it('does NOT produce NaN when easeFactor arrives as a string (the DECIMAL bug)', () => {
    // Sequelize returns DECIMAL(3,2) columns as strings. Before the fix,
    // "2.50" + 0.1 concatenated to "2.50.1" and Math.max(1.3, NaN) => NaN.
    const out = computeSm2({ easeFactor: '2.50', interval: 6, repetitions: 2, isCorrect: true });
    expect(Number.isFinite(out.easeFactor)).toBe(true);
    expect(out.easeFactor).toBe(2.6);
  });

  it('stays finite across many consecutive string-input updates', () => {
    let state = { easeFactor: '2.50', interval: '0', repetitions: '0' };
    for (let i = 0; i < 10; i++) {
      state = computeSm2({ ...state, isCorrect: true });
      expect(Number.isFinite(state.easeFactor)).toBe(true);
      expect(Number.isFinite(state.interval)).toBe(true);
      expect(Number.isFinite(state.repetitions)).toBe(true);
    }
    // ease factor keeps climbing by 0.1 per correct answer
    expect(state.easeFactor).toBeGreaterThan(2.5);
  });

  it('applies the SM-2 interval schedule on correct answers', () => {
    const r1 = computeSm2({ easeFactor: 2.5, interval: 0, repetitions: 0, isCorrect: true });
    expect(r1).toMatchObject({ repetitions: 1, interval: 1 });

    const r2 = computeSm2({ easeFactor: r1.easeFactor, interval: r1.interval, repetitions: r1.repetitions, isCorrect: true });
    expect(r2).toMatchObject({ repetitions: 2, interval: 6 });

    const r3 = computeSm2({ easeFactor: r2.easeFactor, interval: r2.interval, repetitions: r2.repetitions, isCorrect: true });
    expect(r3.repetitions).toBe(3);
    expect(r3.interval).toBe(Math.round(6 * r2.easeFactor)); // interval * easeFactor
  });

  it('resets repetitions/interval and lowers ease factor on a wrong answer', () => {
    const out = computeSm2({ easeFactor: '2.50', interval: 15, repetitions: 5, isCorrect: false });
    expect(out.repetitions).toBe(0);
    expect(out.interval).toBe(1);
    expect(out.easeFactor).toBe(2.3); // 2.5 - 0.2
  });

  it('never lets the ease factor fall below the 1.3 floor', () => {
    let ef = 1.3;
    for (let i = 0; i < 5; i++) {
      ef = computeSm2({ easeFactor: ef, interval: 1, repetitions: 0, isCorrect: false }).easeFactor;
      expect(ef).toBeGreaterThanOrEqual(1.3);
    }
  });

  it('heals a row already corrupted to NaN/null by an earlier run', () => {
    const out = computeSm2({ easeFactor: NaN, interval: null, repetitions: undefined, isCorrect: true });
    expect(Number.isFinite(out.easeFactor)).toBe(true);
    expect(out.repetitions).toBe(1);
    expect(out.interval).toBe(1);
  });
});
