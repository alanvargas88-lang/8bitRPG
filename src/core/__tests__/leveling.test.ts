/**
 * Unit tests for leveling and EXP system
 */

import { describe, it, expect } from 'vitest';
import {
  generateExpTable,
  getExpTable,
  getExpForLevel,
  getExpToNextLevel,
  calculateLevelFromExp,
  calculateEnemyExpReward,
  getEffectiveGrowth,
  calculateStatGains,
  canLevelUp,
  getExpProgressPercent,
  getExpRemaining,
} from '../leveling.js';
import {
  MAX_LEVEL,
  EXP_PER_ENEMY_LEVEL,
  DUNGEON_EXP_MULTIPLIER,
} from '../constants.js';
import type { Character, Enemy } from '../types.js';

describe('generateExpTable', () => {
  it('should generate table with correct number of levels', () => {
    const table = generateExpTable();
    expect(table.length).toBe(MAX_LEVEL);
  });

  it('should start at level 1 with 0 EXP', () => {
    const table = generateExpTable();
    expect(table[0].level).toBe(1);
    expect(table[0].totalExp).toBe(0);
  });

  it('should have approximately 100 EXP for level 2', () => {
    const table = generateExpTable();
    expect(table[1].level).toBe(2);
    expect(table[1].expFromPrevious).toBe(100);
  });

  it('should have increasing EXP requirements', () => {
    const table = generateExpTable();
    for (let i = 2; i < table.length; i++) {
      expect(table[i].totalExp).toBeGreaterThan(table[i - 1].totalExp);
    }
  });
});

describe('getExpForLevel', () => {
  it('should return 0 for level 1', () => {
    expect(getExpForLevel(1)).toBe(0);
  });

  it('should return correct EXP for level 2', () => {
    expect(getExpForLevel(2)).toBe(100);
  });

  it('should handle levels below 1', () => {
    expect(getExpForLevel(0)).toBe(0);
    expect(getExpForLevel(-1)).toBe(0);
  });

  it('should handle levels above max', () => {
    const maxExp = getExpForLevel(MAX_LEVEL);
    expect(getExpForLevel(MAX_LEVEL + 1)).toBe(maxExp);
  });
});

describe('getExpToNextLevel', () => {
  it('should return EXP needed for next level', () => {
    expect(getExpToNextLevel(1)).toBe(100); // Level 2 requires 100
  });

  it('should return 0 at max level', () => {
    expect(getExpToNextLevel(MAX_LEVEL)).toBe(0);
  });
});

describe('calculateLevelFromExp', () => {
  it('should return level 1 for 0 EXP', () => {
    expect(calculateLevelFromExp(0)).toBe(1);
  });

  it('should return level 2 for 100 EXP', () => {
    expect(calculateLevelFromExp(100)).toBe(2);
  });

  it('should return level 1 for 99 EXP', () => {
    expect(calculateLevelFromExp(99)).toBe(1);
  });

  it('should handle large EXP values', () => {
    // Get actual max EXP from table and verify it gives max level
    const maxExp = getExpForLevel(MAX_LEVEL);
    expect(calculateLevelFromExp(maxExp)).toBe(MAX_LEVEL);
    expect(calculateLevelFromExp(maxExp + 100000)).toBe(MAX_LEVEL);
  });
});

describe('calculateEnemyExpReward', () => {
  it('should calculate base EXP from enemy level', () => {
    const enemy: Partial<Enemy> = { level: 10 };

    // Run multiple times to account for variance
    const rewards: number[] = [];
    for (let i = 0; i < 100; i++) {
      rewards.push(calculateEnemyExpReward(enemy as Enemy, false));
    }

    const avgReward = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const expectedBase = 10 * EXP_PER_ENEMY_LEVEL;

    // Should be within ±10% of base
    expect(avgReward).toBeGreaterThan(expectedBase * 0.85);
    expect(avgReward).toBeLessThan(expectedBase * 1.15);
  });

  it('should double EXP for dungeon battles', () => {
    const enemy: Partial<Enemy> = { level: 10 };

    const normalRewards: number[] = [];
    const dungeonRewards: number[] = [];

    for (let i = 0; i < 100; i++) {
      normalRewards.push(calculateEnemyExpReward(enemy as Enemy, false));
      dungeonRewards.push(calculateEnemyExpReward(enemy as Enemy, true));
    }

    const avgNormal = normalRewards.reduce((a, b) => a + b, 0) / normalRewards.length;
    const avgDungeon = dungeonRewards.reduce((a, b) => a + b, 0) / dungeonRewards.length;

    // Dungeon should be approximately 2x
    expect(avgDungeon / avgNormal).toBeGreaterThan(1.8);
    expect(avgDungeon / avgNormal).toBeLessThan(2.2);
  });
});

describe('getEffectiveGrowth', () => {
  it('should return class growth for Human', () => {
    const growth = getEffectiveGrowth('Human', 'Warrior');
    expect(growth.STR).toBe(3);
    expect(growth.AGI).toBe(3);
  });

  it('should combine race and class growth for Esper', () => {
    const growth = getEffectiveGrowth('Esper', 'Mage');
    // Esper: +0.5 STR, +3 MAG/AGI, +1 DEF, +0.5 CON
    // Mage: +3 MAG, +1 others
    expect(growth.MAG).toBe(3 + 3); // 6
    expect(growth.AGI).toBe(3 + 1); // 4
  });

  it('should return zero growth for Cyborg', () => {
    const growth = getEffectiveGrowth('Cyborg', 'Warrior');
    expect(growth.STR).toBe(0);
    expect(growth.AGI).toBe(0);
    expect(growth.MAG).toBe(0);
  });

  it('should return subtype growth for Fae', () => {
    const growth = getEffectiveGrowth('Fae', 'Warrior', 'Wolf');
    // Wolf: +3 AGI, +1.5 STR per level
    expect(growth.AGI).toBe(3);
    expect(growth.STR).toBe(1.5);
  });
});

describe('calculateStatGains', () => {
  it('should calculate gains for single level', () => {
    const growth = { STR: 3, AGI: 2, MAG: 1, DEF: 1, CON: 1 };
    const gains = calculateStatGains(growth, 1);

    expect(gains.STR).toBe(3);
    expect(gains.AGI).toBe(2);
    expect(gains.MAG).toBe(1);
  });

  it('should calculate gains for multiple levels', () => {
    const growth = { STR: 3, AGI: 2, MAG: 1, DEF: 1, CON: 1 };
    const gains = calculateStatGains(growth, 5);

    expect(gains.STR).toBe(15);
    expect(gains.AGI).toBe(10);
    expect(gains.MAG).toBe(5);
  });

  it('should floor fractional growth', () => {
    const growth = { STR: 0.5, AGI: 1.5, MAG: 2.5, DEF: 0, CON: 0 };
    const gains = calculateStatGains(growth, 3);

    expect(gains.STR).toBe(1); // 0.5 * 3 = 1.5 -> 1
    expect(gains.AGI).toBe(4); // 1.5 * 3 = 4.5 -> 4
    expect(gains.MAG).toBe(7); // 2.5 * 3 = 7.5 -> 7
  });
});

describe('canLevelUp', () => {
  it('should return true when EXP is sufficient', () => {
    const character: Partial<Character> = {
      level: 1,
      exp: 100, // Level 2 requires 100
    };
    expect(canLevelUp(character as Character)).toBe(true);
  });

  it('should return false when EXP is insufficient', () => {
    const character: Partial<Character> = {
      level: 1,
      exp: 99,
    };
    expect(canLevelUp(character as Character)).toBe(false);
  });

  it('should return false at max level', () => {
    const character: Partial<Character> = {
      level: MAX_LEVEL,
      exp: 999999,
    };
    expect(canLevelUp(character as Character)).toBe(false);
  });
});

describe('getExpProgressPercent', () => {
  it('should return 0% at start of level', () => {
    const character: Partial<Character> = {
      level: 2,
      exp: 100, // Just reached level 2
    };
    expect(getExpProgressPercent(character as Character)).toBe(0);
  });

  it('should return 100% at max level', () => {
    const character: Partial<Character> = {
      level: MAX_LEVEL,
      exp: 999999,
    };
    expect(getExpProgressPercent(character as Character)).toBe(100);
  });
});

describe('getExpRemaining', () => {
  it('should return correct remaining EXP', () => {
    const character: Partial<Character> = {
      level: 1,
      exp: 50,
    };
    expect(getExpRemaining(character as Character)).toBe(50); // 100 - 50
  });

  it('should return 0 at max level', () => {
    const character: Partial<Character> = {
      level: MAX_LEVEL,
      exp: 999999,
    };
    expect(getExpRemaining(character as Character)).toBe(0);
  });
});
