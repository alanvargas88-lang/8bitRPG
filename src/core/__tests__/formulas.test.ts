/**
 * Unit tests for damage and healing formulas
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMeleeDamage,
  calculateRangedDamage,
  calculateSpellDamage,
  calculateHealing,
  calculateDefenseReduction,
  calculateElementalMultiplier,
  splitDamageForMultiTarget,
} from '../formulas.js';
import {
  MAGE_SPELL_DAMAGE_MULTIPLIER,
  HEALER_HEAL_MULTIPLIER,
  WARRIOR_UNARMED_MULTIPLIER,
  MAGE_FOCUS_MULTIPLIER,
  ESPER_SPELL_DAMAGE_MULTIPLIER,
  FAE_WEAPON_DAMAGE_REDUCTION,
  DEFENDER_HEAL_RECEIVED_MULTIPLIER,
} from '../constants.js';

describe('calculateDefenseReduction', () => {
  it('should calculate defense reduction correctly', () => {
    // (1 - (target_DEF / 200))
    expect(calculateDefenseReduction(0)).toBe(1); // 0% reduction
    expect(calculateDefenseReduction(100)).toBe(0.5); // 50% reduction
    expect(calculateDefenseReduction(200)).toBe(0); // 100% reduction
  });
});

describe('calculateElementalMultiplier', () => {
  it('should calculate elemental multiplier correctly', () => {
    expect(calculateElementalMultiplier(0)).toBe(1); // No resistance
    expect(calculateElementalMultiplier(0.5)).toBe(0.5); // 50% resist
    expect(calculateElementalMultiplier(1)).toBe(0); // Immune
  });

  it('should clamp resistance to valid range', () => {
    expect(calculateElementalMultiplier(-0.5)).toBe(1); // Negative clamped to 0
    expect(calculateElementalMultiplier(1.5)).toBe(0); // Over 1 clamped to 1
  });
});

describe('calculateMeleeDamage', () => {
  it('should calculate basic melee damage', () => {
    // floor((STR / 2) + weapon_power) * variance * defense_reduction
    // With variance = 1.0 (no randomness) and DEF = 0 (no reduction)
    const damage = calculateMeleeDamage(50, 10, 0, { variance: 1.0 });
    // floor(25 + 10) = 35
    expect(damage).toBe(35);
  });

  it('should match the spec example', () => {
    // Example: Level 10 Warrior with STR 50 and weapon power 10
    // floor(25 + 10) = 35, multiplied by variance and defense
    const damage = calculateMeleeDamage(50, 10, 0, { variance: 1.0 });
    expect(damage).toBe(35);
  });

  it('should apply defense reduction', () => {
    // With 100 DEF, damage should be halved
    const damage = calculateMeleeDamage(50, 10, 100, { variance: 1.0 });
    // 35 * 0.5 = 17.5, floored to 17
    expect(damage).toBe(17);
  });

  it('should apply Warrior unarmed bonus', () => {
    // 1.5x damage with unarmed
    const normal = calculateMeleeDamage(50, 0, 0, { variance: 1.0 });
    const warrior = calculateMeleeDamage(50, 0, 0, {
      variance: 1.0,
      isWarriorUnarmed: true,
    });
    // floor(25 * 1.5) = 37
    expect(warrior).toBe(Math.floor(normal * WARRIOR_UNARMED_MULTIPLIER));
  });

  it('should apply Fae weapon damage reduction', () => {
    // Fae deal 50% damage with weapons
    const normal = calculateMeleeDamage(50, 10, 0, { variance: 1.0 });
    const fae = calculateMeleeDamage(50, 10, 0, { variance: 1.0, isFae: true });
    expect(fae).toBe(Math.floor(normal * FAE_WEAPON_DAMAGE_REDUCTION));
  });

  it('should ensure minimum damage of 1', () => {
    const damage = calculateMeleeDamage(0, 0, 200, { variance: 0.8 });
    expect(damage).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateRangedDamage', () => {
  it('should calculate basic ranged damage', () => {
    // floor((AGI / 2) + weapon_power) * variance * defense_reduction
    const damage = calculateRangedDamage(50, 10, 0, { variance: 1.0 });
    expect(damage).toBe(35);
  });

  it('should apply defense reduction', () => {
    const damage = calculateRangedDamage(50, 10, 100, { variance: 1.0 });
    expect(damage).toBe(17);
  });

  it('should apply Fae weapon damage reduction', () => {
    const normal = calculateRangedDamage(50, 10, 0, { variance: 1.0 });
    const fae = calculateRangedDamage(50, 10, 0, { variance: 1.0, isFae: true });
    expect(fae).toBe(Math.floor(normal * FAE_WEAPON_DAMAGE_REDUCTION));
  });
});

describe('calculateSpellDamage', () => {
  it('should calculate basic spell damage', () => {
    // MAG + spell_power * variance * elemental_resist
    const damage = calculateSpellDamage(50, 20, 0, { variance: 1.0 });
    // 50 + 20 = 70
    expect(damage).toBe(70);
  });

  it('should apply elemental resistance', () => {
    const damage = calculateSpellDamage(50, 20, 0.5, { variance: 1.0 });
    // 70 * 0.5 = 35
    expect(damage).toBe(35);
  });

  it('should apply Mage damage multiplier', () => {
    const normal = calculateSpellDamage(50, 20, 0, { variance: 1.0 });
    const mage = calculateSpellDamage(50, 20, 0, { variance: 1.0, isMage: true });
    expect(mage).toBe(normal * MAGE_SPELL_DAMAGE_MULTIPLIER);
  });

  it('should apply Esper damage multiplier', () => {
    const normal = calculateSpellDamage(50, 20, 0, { variance: 1.0 });
    const esper = calculateSpellDamage(50, 20, 0, { variance: 1.0, isEsper: true });
    expect(esper).toBe(normal * ESPER_SPELL_DAMAGE_MULTIPLIER);
  });

  it('should stack Mage and Esper multipliers', () => {
    const normal = calculateSpellDamage(50, 20, 0, { variance: 1.0 });
    const both = calculateSpellDamage(50, 20, 0, {
      variance: 1.0,
      isMage: true,
      isEsper: true,
    });
    expect(both).toBe(
      normal * MAGE_SPELL_DAMAGE_MULTIPLIER * ESPER_SPELL_DAMAGE_MULTIPLIER
    );
  });

  it('should apply Focus multiplier', () => {
    const normal = calculateSpellDamage(50, 20, 0, { variance: 1.0 });
    const focused = calculateSpellDamage(50, 20, 0, {
      variance: 1.0,
      isFocused: true,
    });
    expect(focused).toBe(Math.floor(normal * MAGE_FOCUS_MULTIPLIER));
  });
});

describe('calculateHealing', () => {
  it('should calculate basic healing', () => {
    // MAG + spell_power
    const healing = calculateHealing(50, 20);
    expect(healing).toBe(70);
  });

  it('should apply Healer multiplier', () => {
    const normal = calculateHealing(50, 20);
    const healer = calculateHealing(50, 20, { isHealer: true });
    expect(healer).toBe(normal * HEALER_HEAL_MULTIPLIER);
  });

  it('should apply Defender received healing bonus', () => {
    const normal = calculateHealing(50, 20);
    const toDefender = calculateHealing(50, 20, { targetIsDefender: true });
    expect(toDefender).toBe(normal * DEFENDER_HEAL_RECEIVED_MULTIPLIER);
  });

  it('should stack Healer and Defender bonuses', () => {
    const normal = calculateHealing(50, 20);
    const both = calculateHealing(50, 20, {
      isHealer: true,
      targetIsDefender: true,
    });
    expect(both).toBe(
      normal * HEALER_HEAL_MULTIPLIER * DEFENDER_HEAL_RECEIVED_MULTIPLIER
    );
  });
});

describe('splitDamageForMultiTarget', () => {
  it('should split damage equally', () => {
    expect(splitDamageForMultiTarget(100, 4)).toBe(25);
    expect(splitDamageForMultiTarget(100, 3)).toBe(33);
    expect(splitDamageForMultiTarget(100, 1)).toBe(100);
  });

  it('should handle zero targets', () => {
    expect(splitDamageForMultiTarget(100, 0)).toBe(0);
  });
});
