/**
 * Unit tests for class system
 */

import { describe, it, expect } from 'vitest';
import {
  getClass,
  getClassBaseStatBonus,
  getClassGrowth,
  classHasAbility,
  classHasRestriction,
  getAbilityPotency,
  calculateSpellSlots,
  calculateTomeSlots,
  getTomeUsesMultiplier,
  getMartialArtsUsesMultiplier,
} from '../classes.js';
import { FREELANCER_PASSIVE_POTENCY } from '../constants.js';

describe('getClass', () => {
  it('should return Warrior class', () => {
    const warrior = getClass('Warrior');
    expect(warrior.name).toBe('Warrior');
    expect(warrior.baseStatBonus.STR).toBe(20);
  });

  it('should return Mage class', () => {
    const mage = getClass('Mage');
    expect(mage.name).toBe('Mage');
    expect(mage.baseStatBonus.MAG).toBe(20);
  });

  it('should return Defender class', () => {
    const defender = getClass('Defender');
    expect(defender.name).toBe('Defender');
    expect(defender.baseStatBonus.DEF).toBe(20);
    expect(defender.baseStatBonus.CON).toBe(20);
  });

  it('should return Healer class', () => {
    const healer = getClass('Healer');
    expect(healer.name).toBe('Healer');
    expect(healer.baseStatBonus.MAG).toBe(20);
    expect(healer.baseStatBonus.AGI).toBe(15);
  });

  it('should return Freelancer class', () => {
    const freelancer = getClass('Freelancer');
    expect(freelancer.name).toBe('Freelancer');
    expect(freelancer.baseStatBonus.STR).toBe(12);
    expect(freelancer.baseStatBonus.AGI).toBe(12);
    expect(freelancer.baseStatBonus.MAG).toBe(12);
    expect(freelancer.baseStatBonus.DEF).toBe(12);
    expect(freelancer.baseStatBonus.CON).toBe(12);
  });
});

describe('getClassGrowth', () => {
  it('should return Warrior growth rates', () => {
    const growth = getClassGrowth('Warrior');
    expect(growth.STR).toBe(3);
    expect(growth.AGI).toBe(3);
    expect(growth.MAG).toBe(1);
    expect(growth.DEF).toBe(1);
    expect(growth.CON).toBe(1);
  });

  it('should return Mage growth rates', () => {
    const growth = getClassGrowth('Mage');
    expect(growth.MAG).toBe(3);
  });

  it('should return Defender growth rates', () => {
    const growth = getClassGrowth('Defender');
    expect(growth.DEF).toBe(2);
    expect(growth.CON).toBe(2);
    expect(growth.AGI).toBe(0.5);
    expect(growth.MAG).toBe(0.5);
  });

  it('should return Freelancer growth rates', () => {
    const growth = getClassGrowth('Freelancer');
    expect(growth.STR).toBe(1.5);
    expect(growth.AGI).toBe(1.5);
    expect(growth.MAG).toBe(1.5);
    expect(growth.DEF).toBe(1.5);
    expect(growth.CON).toBe(1.5);
  });
});

describe('classHasAbility', () => {
  it('should detect Warrior abilities', () => {
    expect(classHasAbility('Warrior', 'high_crit')).toBe(true);
    expect(classHasAbility('Warrior', 'unarmed_bonus')).toBe(true);
    expect(classHasAbility('Warrior', 'concentrate')).toBe(false);
  });

  it('should detect Mage abilities', () => {
    expect(classHasAbility('Mage', 'concentrate')).toBe(true);
    expect(classHasAbility('Mage', 'focus')).toBe(true);
    expect(classHasAbility('Mage', 'extra_slots')).toBe(true);
  });

  it('should detect Defender abilities', () => {
    expect(classHasAbility('Defender', 'cover')).toBe(true);
    expect(classHasAbility('Defender', 'brace')).toBe(true);
    expect(classHasAbility('Defender', 'thorns')).toBe(true);
    expect(classHasAbility('Defender', 'elemental_resist')).toBe(true);
  });

  it('should detect Healer abilities', () => {
    expect(classHasAbility('Healer', 'heal_bonus')).toBe(true);
    expect(classHasAbility('Healer', 'revive')).toBe(true);
    expect(classHasAbility('Healer', 'avoid')).toBe(true);
    expect(classHasAbility('Healer', 'status_immune')).toBe(true);
  });

  it('should give Freelancer access to all abilities', () => {
    expect(classHasAbility('Freelancer', 'high_crit')).toBe(true);
    expect(classHasAbility('Freelancer', 'concentrate')).toBe(true);
    expect(classHasAbility('Freelancer', 'cover')).toBe(true);
    expect(classHasAbility('Freelancer', 'heal_bonus')).toBe(true);
  });
});

describe('classHasRestriction', () => {
  it('should detect Warrior restrictions', () => {
    expect(classHasRestriction('Warrior', 'no_magic_weapons')).toBe(true);
    expect(classHasRestriction('Warrior', 'no_martial_arts')).toBe(false);
  });

  it('should detect Mage restrictions', () => {
    expect(classHasRestriction('Mage', 'no_martial_arts')).toBe(true);
  });

  it('should detect Defender restrictions', () => {
    expect(classHasRestriction('Defender', 'reduced_agi')).toBe(true);
  });

  it('should detect no restrictions for Healer/Freelancer', () => {
    expect(classHasRestriction('Healer', 'no_magic_weapons')).toBe(false);
    expect(classHasRestriction('Freelancer', 'no_martial_arts')).toBe(false);
  });
});

describe('getAbilityPotency', () => {
  it('should return 1.0 for normal classes', () => {
    expect(getAbilityPotency('Warrior')).toBe(1.0);
    expect(getAbilityPotency('Mage')).toBe(1.0);
    expect(getAbilityPotency('Defender')).toBe(1.0);
    expect(getAbilityPotency('Healer')).toBe(1.0);
  });

  it('should return 0.75 for Freelancer', () => {
    expect(getAbilityPotency('Freelancer')).toBe(FREELANCER_PASSIVE_POTENCY);
  });
});

describe('calculateSpellSlots', () => {
  it('should return base slots for non-caster', () => {
    expect(calculateSpellSlots('Warrior', 1)).toBe(1);
    expect(calculateSpellSlots('Warrior', 50)).toBe(1);
  });

  it('should return extra slots for Mage', () => {
    expect(calculateSpellSlots('Mage', 1)).toBe(2); // Base + 1
    expect(calculateSpellSlots('Mage', 10)).toBe(3); // Base + 1 + 1
    expect(calculateSpellSlots('Mage', 20)).toBe(4); // Base + 1 + 2
  });

  it('should return extra slots for Healer', () => {
    expect(calculateSpellSlots('Healer', 1)).toBe(2);
    expect(calculateSpellSlots('Healer', 10)).toBe(3);
  });

  it('should return reduced slots for Freelancer', () => {
    const mageSlots = calculateSpellSlots('Mage', 10) - 1; // Mage bonus
    const freelancerSlots = calculateSpellSlots('Freelancer', 10) - 1;
    expect(freelancerSlots).toBe(Math.floor(mageSlots * FREELANCER_PASSIVE_POTENCY));
  });
});

describe('getTomeUsesMultiplier', () => {
  it('should return 2x for Mage and Healer', () => {
    expect(getTomeUsesMultiplier('Mage')).toBe(2);
    expect(getTomeUsesMultiplier('Healer')).toBe(2);
  });

  it('should return 1x for Warrior/Defender', () => {
    expect(getTomeUsesMultiplier('Warrior')).toBe(1);
    expect(getTomeUsesMultiplier('Defender')).toBe(1);
  });

  it('should return 1.75x for Freelancer', () => {
    expect(getTomeUsesMultiplier('Freelancer')).toBe(1 + FREELANCER_PASSIVE_POTENCY);
  });
});

describe('getMartialArtsUsesMultiplier', () => {
  it('should return 2x for Healer', () => {
    expect(getMartialArtsUsesMultiplier('Healer')).toBe(2);
  });

  it('should return 1x for other classes', () => {
    expect(getMartialArtsUsesMultiplier('Warrior')).toBe(1);
    expect(getMartialArtsUsesMultiplier('Mage')).toBe(1);
    expect(getMartialArtsUsesMultiplier('Defender')).toBe(1);
  });

  it('should return 1.75x for Freelancer', () => {
    expect(getMartialArtsUsesMultiplier('Freelancer')).toBe(
      1 + FREELANCER_PASSIVE_POTENCY
    );
  });
});
