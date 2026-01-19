/**
 * Unit tests for combat mechanics
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCritChance,
  calculateCritMultiplier,
  calculateDodgeChance,
  calculateTurnOrder,
  rollBraceBlock,
  calculateThornsDamage,
  calculateReflectDamage,
  calculateCounterDamage,
} from '../combat.js';
import {
  BASE_CRIT_CHANCE,
  CRIT_DAMAGE_MULTIPLIER,
  WARRIOR_CRIT_CHANCE,
  ESPER_CRIT_DAMAGE_BONUS,
  CYBORG_CONSUMABLE_CRIT_MULTIPLIER,
  DODGE_DIVISOR,
  HEALER_DODGE_DIVISOR,
  FREELANCER_PASSIVE_POTENCY,
  DEFENDER_BRACE_MIN,
  DEFENDER_BRACE_MAX,
  DEFENDER_THORNS_DAMAGE,
  DEFENDER_REFLECT_DAMAGE,
  DEFENDER_COUNTER_DAMAGE,
} from '../constants.js';
import type { Weapon, Character, Enemy } from '../types.js';

describe('calculateCritChance', () => {
  it('should return base crit chance for non-warrior', () => {
    expect(calculateCritChance('Mage', 'Human')).toBe(BASE_CRIT_CHANCE);
  });

  it('should return higher crit for Warrior with weapon', () => {
    const weapon: Weapon = {
      name: 'Sword',
      type: 'sword',
      damageType: 'melee',
      power: 10,
    };
    expect(calculateCritChance('Warrior', 'Human', weapon)).toBe(WARRIOR_CRIT_CHANCE);
  });

  it('should return 100% crit when concentrated', () => {
    expect(
      calculateCritChance('Mage', 'Human', undefined, { isConcentrated: true })
    ).toBe(1.0);
  });

  it('should apply Freelancer reduction to Warrior crit', () => {
    const weapon: Weapon = {
      name: 'Sword',
      type: 'sword',
      damageType: 'melee',
      power: 10,
    };
    expect(calculateCritChance('Freelancer', 'Human', weapon)).toBe(
      WARRIOR_CRIT_CHANCE * FREELANCER_PASSIVE_POTENCY
    );
  });
});

describe('calculateCritMultiplier', () => {
  it('should return base crit multiplier', () => {
    expect(calculateCritMultiplier('Human')).toBe(CRIT_DAMAGE_MULTIPLIER);
  });

  it('should add Esper bonus for spells/tomes', () => {
    expect(calculateCritMultiplier('Esper', { isSpellOrTome: true })).toBe(
      CRIT_DAMAGE_MULTIPLIER + ESPER_CRIT_DAMAGE_BONUS
    );
  });

  it('should multiply for Cyborg consumables', () => {
    expect(calculateCritMultiplier('Cyborg', { isConsumable: true })).toBe(
      CRIT_DAMAGE_MULTIPLIER * CYBORG_CONSUMABLE_CRIT_MULTIPLIER
    );
  });
});

describe('calculateDodgeChance', () => {
  it('should calculate base dodge chance', () => {
    // AGI / 200
    expect(calculateDodgeChance(100, 'Warrior')).toBe(100 / DODGE_DIVISOR);
    expect(calculateDodgeChance(50, 'Mage')).toBe(50 / DODGE_DIVISOR);
  });

  it('should calculate Healer Avoid dodge chance', () => {
    // AGI / 5 for Healers
    expect(calculateDodgeChance(100, 'Healer')).toBe(100 / HEALER_DODGE_DIVISOR);
    expect(calculateDodgeChance(50, 'Healer')).toBe(50 / HEALER_DODGE_DIVISOR);
  });

  it('should apply Freelancer reduction to Healer avoid', () => {
    const healerDodge = 100 / HEALER_DODGE_DIVISOR;
    expect(calculateDodgeChance(100, 'Freelancer')).toBe(
      healerDodge * FREELANCER_PASSIVE_POTENCY
    );
  });
});

describe('calculateTurnOrder', () => {
  it('should sort by AGI descending', () => {
    const party: Partial<Character>[] = [
      { id: '1', name: 'Slow', currentStats: { AGI: 10 } as any, currentHP: 100 },
      { id: '2', name: 'Fast', currentStats: { AGI: 50 } as any, currentHP: 100 },
    ];
    const enemies: Partial<Enemy>[] = [
      { id: 'e1', name: 'Enemy', stats: { AGI: 30 } as any, currentHP: 50 },
    ];

    const order = calculateTurnOrder(
      party as Character[],
      enemies as Enemy[]
    );

    expect(order[0].character.name).toBe('Fast');
    expect(order[1].character.name).toBe('Enemy');
    expect(order[2].character.name).toBe('Slow');
  });

  it('should give player priority on ties', () => {
    const party: Partial<Character>[] = [
      { id: '1', name: 'Player', currentStats: { AGI: 30 } as any, currentHP: 100 },
    ];
    const enemies: Partial<Enemy>[] = [
      { id: 'e1', name: 'Enemy', stats: { AGI: 30 } as any, currentHP: 50 },
    ];

    const order = calculateTurnOrder(
      party as Character[],
      enemies as Enemy[]
    );

    expect(order[0].character.name).toBe('Player');
    expect(order[0].isPlayer).toBe(true);
  });

  it('should exclude dead combatants', () => {
    const party: Partial<Character>[] = [
      { id: '1', name: 'Alive', currentStats: { AGI: 30 } as any, currentHP: 100 },
      { id: '2', name: 'Dead', currentStats: { AGI: 50 } as any, currentHP: 0 },
    ];
    const enemies: Partial<Enemy>[] = [];

    const order = calculateTurnOrder(
      party as Character[],
      enemies as Enemy[]
    );

    expect(order.length).toBe(1);
    expect(order[0].character.name).toBe('Alive');
  });
});

describe('rollBraceBlock', () => {
  it('should return value between 25% and 75%', () => {
    for (let i = 0; i < 100; i++) {
      const block = rollBraceBlock();
      expect(block).toBeGreaterThanOrEqual(DEFENDER_BRACE_MIN);
      expect(block).toBeLessThanOrEqual(DEFENDER_BRACE_MAX);
    }
  });
});

describe('calculateThornsDamage', () => {
  it('should calculate 50% of received damage', () => {
    expect(calculateThornsDamage(100)).toBe(100 * DEFENDER_THORNS_DAMAGE);
    expect(calculateThornsDamage(50)).toBe(50 * DEFENDER_THORNS_DAMAGE);
  });
});

describe('calculateReflectDamage', () => {
  it('should calculate 50% of spell damage', () => {
    expect(calculateReflectDamage(100)).toBe(100 * DEFENDER_REFLECT_DAMAGE);
    expect(calculateReflectDamage(80)).toBe(80 * DEFENDER_REFLECT_DAMAGE);
  });
});

describe('calculateCounterDamage', () => {
  it('should calculate 100% of attacker damage', () => {
    expect(calculateCounterDamage(100)).toBe(100 * DEFENDER_COUNTER_DAMAGE);
    expect(calculateCounterDamage(50)).toBe(50 * DEFENDER_COUNTER_DAMAGE);
  });
});
