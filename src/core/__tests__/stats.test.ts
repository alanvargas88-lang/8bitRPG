/**
 * Unit tests for stat calculation formulas
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMaxHP,
  calculateMaxMP,
  clampStat,
  createBaseStats,
  addStats,
} from '../stats.js';
import {
  MAX_STAT,
  MAX_HP,
  MAX_MP,
  CYBORG_MAX_MP,
  BASE_HP,
  HP_PER_CON,
  BASE_MP,
  MP_PER_MAG,
} from '../constants.js';

describe('calculateMaxHP', () => {
  it('should calculate HP correctly at base CON', () => {
    // HP max = 100 + (CON * 50)
    expect(calculateMaxHP(0)).toBe(BASE_HP); // 100
    expect(calculateMaxHP(10)).toBe(BASE_HP + 10 * HP_PER_CON); // 600
    expect(calculateMaxHP(50)).toBe(BASE_HP + 50 * HP_PER_CON); // 2600
  });

  it('should cap HP at 9999', () => {
    // At CON 200, HP would be 100 + 200*50 = 10100, but should cap at 9999
    expect(calculateMaxHP(200)).toBe(MAX_HP);
    expect(calculateMaxHP(250)).toBe(MAX_HP);
  });

  it('should handle the example from spec', () => {
    // Example: Level 10 Warrior would have CON based HP
    // With CON 10 (base): HP = 100 + 10*50 = 600
    expect(calculateMaxHP(10)).toBe(600);
  });
});

describe('calculateMaxMP', () => {
  it('should calculate MP correctly for normal races', () => {
    // MP max = 100 + (MAG * 50)
    expect(calculateMaxMP(0, 'Human')).toBe(BASE_MP);
    expect(calculateMaxMP(10, 'Human')).toBe(BASE_MP + 10 * MP_PER_MAG); // 600
    expect(calculateMaxMP(50, 'Esper')).toBe(BASE_MP + 50 * MP_PER_MAG); // 2600
  });

  it('should cap MP at 9999 for normal races', () => {
    expect(calculateMaxMP(200, 'Human')).toBe(MAX_MP);
    expect(calculateMaxMP(200, 'Esper')).toBe(MAX_MP);
  });

  it('should cap Cyborg MP at 50', () => {
    // Cyborgs have MP capped at 50 (effective MAG max 50)
    expect(calculateMaxMP(0, 'Cyborg')).toBeLessThanOrEqual(CYBORG_MAX_MP);
    expect(calculateMaxMP(100, 'Cyborg')).toBe(CYBORG_MAX_MP);
    expect(calculateMaxMP(200, 'Cyborg')).toBe(CYBORG_MAX_MP);
  });
});

describe('clampStat', () => {
  it('should clamp stats to valid range', () => {
    expect(clampStat(0)).toBe(0);
    expect(clampStat(100)).toBe(100);
    expect(clampStat(200)).toBe(MAX_STAT);
    expect(clampStat(250)).toBe(MAX_STAT);
    expect(clampStat(-10)).toBe(0);
  });

  it('should floor decimal values', () => {
    expect(clampStat(10.5)).toBe(10);
    expect(clampStat(99.9)).toBe(99);
  });
});

describe('createBaseStats', () => {
  it('should create stats with given values', () => {
    const stats = createBaseStats(10, 15, 20, 12, 8);
    expect(stats.STR).toBe(10);
    expect(stats.AGI).toBe(15);
    expect(stats.MAG).toBe(20);
    expect(stats.DEF).toBe(12);
    expect(stats.CON).toBe(8);
  });

  it('should clamp values to max stat', () => {
    const stats = createBaseStats(250, 250, 250, 250, 250);
    expect(stats.STR).toBe(MAX_STAT);
    expect(stats.AGI).toBe(MAX_STAT);
    expect(stats.MAG).toBe(MAX_STAT);
    expect(stats.DEF).toBe(MAX_STAT);
    expect(stats.CON).toBe(MAX_STAT);
  });
});

describe('addStats', () => {
  it('should add stats together', () => {
    const base = createBaseStats(10, 10, 10, 10, 10);
    const bonus = { STR: 5, AGI: 3 };
    const result = addStats(base, bonus);

    expect(result.STR).toBe(15);
    expect(result.AGI).toBe(13);
    expect(result.MAG).toBe(10);
    expect(result.DEF).toBe(10);
    expect(result.CON).toBe(10);
  });

  it('should clamp results to max stat', () => {
    const base = createBaseStats(190, 10, 10, 10, 10);
    const bonus = { STR: 50 };
    const result = addStats(base, bonus);

    expect(result.STR).toBe(MAX_STAT);
  });
});
