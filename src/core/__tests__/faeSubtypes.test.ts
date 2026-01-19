/**
 * Unit tests for Fae subtype system
 */

import { describe, it, expect } from 'vitest';
import {
  getFaeSubtype,
  getAvailableSubtypes,
  getEarlySubtypes,
  getSubtypeMartialArts,
  getSubtypeBaseStats,
  getSubtypeGrowth,
  getSubtypeBaseHP,
  calculateTransformStats,
  calculateTransformHP,
  transformFae,
} from '../faeSubtypes.js';

describe('getFaeSubtype', () => {
  it('should return Slime subtype', () => {
    const slime = getFaeSubtype('Slime');
    expect(slime.name).toBe('Slime');
    expect(slime.baseStats.CON).toBe(30);
    expect(slime.baseHP).toBe(50);
  });

  it('should return Dino subtype', () => {
    const dino = getFaeSubtype('Dino');
    expect(dino.name).toBe('Dino');
    expect(dino.baseStats.STR).toBe(25);
    expect(dino.baseHP).toBe(75);
  });

  it('should return Wolf subtype', () => {
    const wolf = getFaeSubtype('Wolf');
    expect(wolf.name).toBe('Wolf');
    expect(wolf.baseStats.AGI).toBe(25);
    expect(wolf.baseHP).toBe(60);
  });

  it('should return Goblin subtype', () => {
    const goblin = getFaeSubtype('Goblin');
    expect(goblin.name).toBe('Goblin');
    expect(goblin.baseStats.STR).toBe(20);
    expect(goblin.baseStats.AGI).toBe(15);
    expect(goblin.baseHP).toBe(105);
  });
});

describe('getAvailableSubtypes', () => {
  it('should return early subtypes at level 1', () => {
    const subtypes = getAvailableSubtypes(1);
    expect(subtypes).toContain('Slime');
    expect(subtypes).toContain('Dino');
    expect(subtypes).toContain('Wolf');
    expect(subtypes).toContain('Goblin');
  });

  it('should return early subtypes at level 5', () => {
    const subtypes = getAvailableSubtypes(5);
    expect(subtypes.length).toBe(4);
  });

  it('should not include later subtypes at level 1', () => {
    const subtypes = getAvailableSubtypes(1);
    expect(subtypes).not.toContain('Scorpion');
    expect(subtypes).not.toContain('Beetle');
  });
});

describe('getEarlySubtypes', () => {
  it('should return all early game subtypes', () => {
    const subtypes = getEarlySubtypes();
    expect(subtypes).toEqual(['Slime', 'Dino', 'Wolf', 'Goblin']);
  });
});

describe('getSubtypeMartialArts', () => {
  it('should return Slime martial arts', () => {
    const arts = getSubtypeMartialArts('Slime');
    expect(arts.length).toBe(2);

    const acid = arts.find(a => a.name === 'Acid');
    expect(acid).toBeDefined();
    expect(acid?.type).toBe('ranged');
    expect(acid?.baseDamage).toBe(20);
    expect(acid?.scalingStat).toBe('AGI');

    const dissolve = arts.find(a => a.name === 'Dissolve');
    expect(dissolve).toBeDefined();
    expect(dissolve?.type).toBe('melee');
    expect(dissolve?.baseDamage).toBe(30);
    expect(dissolve?.scalingStat).toBe('STR');
  });

  it('should return Wolf martial arts', () => {
    const arts = getSubtypeMartialArts('Wolf');
    expect(arts.length).toBe(2);

    const bite = arts.find(a => a.name === 'Bite');
    expect(bite?.baseDamage).toBe(25);
    expect(bite?.scalingStat).toBe('STR');

    const scratch = arts.find(a => a.name === 'Scratch');
    expect(scratch?.targeting).toBe('multi');
  });
});

describe('getSubtypeGrowth', () => {
  it('should return Slime growth', () => {
    const growth = getSubtypeGrowth('Slime');
    expect(growth.CON).toBe(2);
    expect(growth.DEF).toBe(2);
    expect(growth.STR).toBe(1);
  });

  it('should return Wolf growth', () => {
    const growth = getSubtypeGrowth('Wolf');
    expect(growth.AGI).toBe(3);
    expect(growth.STR).toBe(1.5);
  });

  it('should return Goblin growth (balanced)', () => {
    const growth = getSubtypeGrowth('Goblin');
    expect(growth.STR).toBe(2);
    expect(growth.AGI).toBe(2);
    expect(growth.MAG).toBe(2);
    expect(growth.DEF).toBe(2);
    expect(growth.CON).toBe(2);
  });
});

describe('calculateTransformStats', () => {
  it('should return base stats at level 1', () => {
    const stats = calculateTransformStats('Wolf', 1);
    expect(stats.AGI).toBe(25);
    expect(stats.STR).toBe(7);
  });

  it('should apply growth for higher levels', () => {
    const stats = calculateTransformStats('Wolf', 10);
    // Wolf: +3 AGI, +1.5 STR per level
    // Level 10 = 9 levels of growth
    expect(stats.AGI).toBe(25 + 3 * 9); // 52
    expect(stats.STR).toBe(7 + Math.floor(1.5 * 9)); // 7 + 13 = 20
  });

  it('should calculate Goblin stats correctly', () => {
    const stats = calculateTransformStats('Goblin', 5);
    // Goblin: +2 to all per level
    // 4 levels of growth
    expect(stats.STR).toBe(20 + 2 * 4); // 28
    expect(stats.AGI).toBe(15 + 2 * 4); // 23
  });
});

describe('calculateTransformHP', () => {
  it('should calculate HP based on transformed CON', () => {
    const hp = calculateTransformHP('Slime', 1);
    // Slime CON = 30, HP = 100 + 30*50 = 1600
    expect(hp).toBe(100 + 30 * 50);
  });

  it('should scale HP with level growth', () => {
    const hp1 = calculateTransformHP('Slime', 1);
    const hp10 = calculateTransformHP('Slime', 10);
    expect(hp10).toBeGreaterThan(hp1);
  });
});

describe('transformFae', () => {
  it('should return new stats and martial arts', () => {
    const result = transformFae(5, 'Wolf');

    expect(result.newStats.AGI).toBe(25 + 3 * 4); // 37
    expect(result.newMartialArts.length).toBe(2);
    expect(result.newMartialArts.some(a => a.name === 'Bite')).toBe(true);
  });

  it('should correctly transform to Goblin', () => {
    const result = transformFae(10, 'Goblin');

    // Goblin at level 10: base + 9 levels of +2 each
    expect(result.newStats.STR).toBe(20 + 2 * 9); // 38
    expect(result.newStats.AGI).toBe(15 + 2 * 9); // 33
  });
});
