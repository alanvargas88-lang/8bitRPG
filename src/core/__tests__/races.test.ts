/**
 * Unit tests for race system
 */

import { describe, it, expect } from 'vitest';
import {
  getRace,
  isClassAllowedForRace,
  getAllowedClassesForRace,
  raceHasTrait,
  getCyborgGearSlots,
  canCyborgEquipSlot,
} from '../races.js';

describe('getRace', () => {
  it('should return Human race', () => {
    const human = getRace('Human');
    expect(human.name).toBe('Human');
    expect(human.baseStats.STR).toBe(10);
    expect(human.baseStats.AGI).toBe(10);
    expect(human.baseStats.MAG).toBe(10);
    expect(human.baseStats.DEF).toBe(10);
    expect(human.baseStats.CON).toBe(10);
  });

  it('should return Esper race with correct stats', () => {
    const esper = getRace('Esper');
    expect(esper.name).toBe('Esper');
    expect(esper.baseStats.MAG).toBe(25);
    expect(esper.baseStats.AGI).toBe(15);
    expect(esper.baseStats.STR).toBe(8);
  });

  it('should return Cyborg race with correct stats', () => {
    const cyborg = getRace('Cyborg');
    expect(cyborg.name).toBe('Cyborg');
    expect(cyborg.baseStats.STR).toBe(5);
    expect(cyborg.growth).toBeNull(); // No level growth
  });

  it('should return Fae race', () => {
    const fae = getRace('Fae');
    expect(fae.name).toBe('Fae');
    expect(fae.growth).toBeNull(); // Subtype-dependent
  });
});

describe('isClassAllowedForRace', () => {
  it('should allow Human to be any class', () => {
    expect(isClassAllowedForRace('Human', 'Warrior')).toBe(true);
    expect(isClassAllowedForRace('Human', 'Mage')).toBe(true);
    expect(isClassAllowedForRace('Human', 'Defender')).toBe(true);
    expect(isClassAllowedForRace('Human', 'Healer')).toBe(true);
    expect(isClassAllowedForRace('Human', 'Freelancer')).toBe(true);
  });

  it('should only allow Esper to be Mage', () => {
    expect(isClassAllowedForRace('Esper', 'Mage')).toBe(true);
    expect(isClassAllowedForRace('Esper', 'Warrior')).toBe(false);
    expect(isClassAllowedForRace('Esper', 'Freelancer')).toBe(false);
  });

  it('should not allow Freelancer for non-humans', () => {
    expect(isClassAllowedForRace('Cyborg', 'Freelancer')).toBe(false);
    expect(isClassAllowedForRace('Fae', 'Freelancer')).toBe(false);
    expect(isClassAllowedForRace('Esper', 'Freelancer')).toBe(false);
  });
});

describe('getAllowedClassesForRace', () => {
  it('should return all classes for Human', () => {
    const classes = getAllowedClassesForRace('Human');
    expect(classes).toContain('Freelancer');
    expect(classes.length).toBe(5);
  });

  it('should return only Mage for Esper', () => {
    const classes = getAllowedClassesForRace('Esper');
    expect(classes).toEqual(['Mage']);
  });
});

describe('raceHasTrait', () => {
  it('should detect Esper traits', () => {
    expect(raceHasTrait('Esper', 'extra_spell_slot')).toBe(true);
    expect(raceHasTrait('Esper', 'spell_damage_double')).toBe(true);
    expect(raceHasTrait('Esper', 'no_martial_arts')).toBe(true);
  });

  it('should detect Cyborg traits', () => {
    expect(raceHasTrait('Cyborg', 'dual_wield')).toBe(true);
    expect(raceHasTrait('Cyborg', 'gear_dependent')).toBe(true);
    expect(raceHasTrait('Cyborg', 'mp_capped')).toBe(true);
  });

  it('should detect Fae traits', () => {
    expect(raceHasTrait('Fae', 'infinite_martial')).toBe(true);
    expect(raceHasTrait('Fae', 'double_attack')).toBe(true);
    expect(raceHasTrait('Fae', 'no_tomes')).toBe(true);
  });
});

describe('getCyborgGearSlots', () => {
  it('should start with 2 slots (head, body)', () => {
    const slots = getCyborgGearSlots(1);
    expect(slots).toHaveLength(2);
    expect(slots).toContain('head');
    expect(slots).toContain('body');
  });

  it('should unlock arms at level 10', () => {
    const slots = getCyborgGearSlots(10);
    expect(slots).toHaveLength(3);
    expect(slots).toContain('arms');
  });

  it('should unlock legs at level 20', () => {
    const slots = getCyborgGearSlots(20);
    expect(slots).toHaveLength(4);
    expect(slots).toContain('legs');
  });

  it('should unlock torso at level 30', () => {
    const slots = getCyborgGearSlots(30);
    expect(slots).toHaveLength(5);
    expect(slots).toContain('torso');
  });

  it('should unlock back at level 40', () => {
    const slots = getCyborgGearSlots(40);
    expect(slots).toHaveLength(6);
    expect(slots).toContain('back');
  });
});

describe('canCyborgEquipSlot', () => {
  it('should allow head and body at level 1', () => {
    expect(canCyborgEquipSlot(1, 'head')).toBe(true);
    expect(canCyborgEquipSlot(1, 'body')).toBe(true);
    expect(canCyborgEquipSlot(1, 'arms')).toBe(false);
  });

  it('should allow arms at level 10', () => {
    expect(canCyborgEquipSlot(10, 'arms')).toBe(true);
    expect(canCyborgEquipSlot(9, 'arms')).toBe(false);
  });
});
