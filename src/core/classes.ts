/**
 * Class definitions for the 8-bit RPG
 * Warrior, Mage, Defender, Healer, Freelancer with their unique abilities
 */

import type {
  CharacterClass,
  ClassName,
  Stats,
  StatGrowth,
  ClassAbility,
  ClassRestriction,
} from './types.js';
import { FREELANCER_PASSIVE_POTENCY } from './constants.js';

// =============================================================================
// CLASS DEFINITIONS
// =============================================================================

/**
 * Warrior class definition
 * - Base: STR 20
 * - Growth: +3 STR/AGI, +1 others per level
 * - 50% critical chance with melee or ranged weapons
 * - 1.5x damage with unarmed martial arts
 * - Cannot use magic weapons (staves/wands)
 */
export const WarriorClass: CharacterClass = {
  name: 'Warrior',
  baseStatBonus: {
    STR: 20,
  },
  growth: {
    STR: 3,
    AGI: 3,
    MAG: 1,
    DEF: 1,
    CON: 1,
  },
  abilities: ['high_crit', 'unarmed_bonus'],
  restrictions: ['no_magic_weapons'],
};

/**
 * Mage class definition
 * - Base: MAG 20
 * - Growth: +3 MAG, +1 AGI/others per level
 * - Wand equip: Concentrate (next spell auto-critical, single target only)
 * - Staff equip (replaces shield): Focus (sacrifice turn, next spell 2.5x damage, multi-target split)
 * - Start with +1 spell and +1 tome slot; +1 more each every 10 levels
 * - Tomes have double uses
 * - Learn new tomes after 50 uses of current ones
 * - All bonuses apply only to damage/attack spells, not healing
 * - Cannot use martial arts
 */
export const MageClass: CharacterClass = {
  name: 'Mage',
  baseStatBonus: {
    MAG: 20,
  },
  growth: {
    STR: 1,
    AGI: 1,
    MAG: 3,
    DEF: 1,
    CON: 1,
  },
  abilities: ['concentrate', 'focus', 'extra_slots', 'double_tome_uses'],
  restrictions: ['no_martial_arts'],
};

/**
 * Defender class definition
 * - Base: DEF 20, CON 20
 * - Growth: +2 DEF/CON, +0.5 AGI/MAG per level
 * - Cover: Take damage for chosen ally if your AGI > enemy AGI
 * - Brace: Block 25-75% random of all incoming damage for 1 turn
 * - 25% chance to deal 50% thorns damage on enemy melee hits
 * - 10% chance to reflect 50% of spell damage
 * - 25% chance to negate ranged attacks
 * - 100% chance to counter martial arts for 100% damage
 * - Receives double healing from all sources
 * - +1% resistance to all elements per level
 * - AGI reduced by 20%
 */
export const DefenderClass: CharacterClass = {
  name: 'Defender',
  baseStatBonus: {
    DEF: 20,
    CON: 20,
  },
  growth: {
    STR: 1,
    AGI: 0.5,
    MAG: 0.5,
    DEF: 2,
    CON: 2,
  },
  abilities: [
    'cover',
    'brace',
    'thorns',
    'reflect',
    'ranged_negate',
    'counter_martial',
    'double_healing',
    'elemental_resist',
  ],
  restrictions: ['reduced_agi'],
};

/**
 * Healer class definition
 * - Base: MAG 20, AGI 15
 * - Growth: +2 MAG/AGI, +1 others per level
 * - All Mage rules but applied to healing spells (2x heal, Concentrate/Focus, slots, uses, learn)
 * - Revive spell restores ally to 50% HP
 * - Martial arts get double uses and learn new after 50
 * - AGI grants Avoid: 1% dodge per 5 AGI points (AGI/5 dodge chance)
 * - Immune to dark and poison status
 */
export const HealerClass: CharacterClass = {
  name: 'Healer',
  baseStatBonus: {
    MAG: 20,
    AGI: 15,
  },
  growth: {
    STR: 1,
    AGI: 2,
    MAG: 2,
    DEF: 1,
    CON: 1,
  },
  abilities: [
    'heal_bonus',
    'concentrate',
    'focus',
    'extra_slots',
    'double_tome_uses',
    'revive',
    'martial_double_uses',
    'avoid',
    'status_immune',
  ],
  restrictions: [],
};

/**
 * Freelancer class definition (Human only)
 * - Base: All 12
 * - Growth: +1.5 to all stats per level
 * - Gains all other class passives at 0.75x potency
 * - Can switch classes anytime
 */
export const FreelancerClass: CharacterClass = {
  name: 'Freelancer',
  baseStatBonus: {
    STR: 12,
    AGI: 12,
    MAG: 12,
    DEF: 12,
    CON: 12,
  },
  growth: {
    STR: 1.5,
    AGI: 1.5,
    MAG: 1.5,
    DEF: 1.5,
    CON: 1.5,
  },
  abilities: ['all_passives'],
  restrictions: [],
};

// =============================================================================
// CLASS LOOKUP
// =============================================================================

/** All classes indexed by name */
export const CLASSES: Record<ClassName, CharacterClass> = {
  Warrior: WarriorClass,
  Mage: MageClass,
  Defender: DefenderClass,
  Healer: HealerClass,
  Freelancer: FreelancerClass,
};

/**
 * Get a class by name
 */
export function getClass(name: ClassName): CharacterClass {
  return CLASSES[name];
}

// =============================================================================
// CLASS UTILITY FUNCTIONS
// =============================================================================

/**
 * Get class base stat bonuses
 */
export function getClassBaseStatBonus(className: ClassName): Partial<Stats> {
  return { ...CLASSES[className].baseStatBonus };
}

/**
 * Get class stat growth per level
 */
export function getClassGrowth(className: ClassName): StatGrowth {
  return { ...CLASSES[className].growth };
}

/**
 * Check if class has a specific ability
 */
export function classHasAbility(
  className: ClassName,
  ability: ClassAbility
): boolean {
  const classData = CLASSES[className];

  // Freelancer has all passives at reduced potency
  if (className === 'Freelancer') {
    return true; // Has access to all abilities
  }

  return classData.abilities.includes(ability);
}

/**
 * Check if class has a specific restriction
 */
export function classHasRestriction(
  className: ClassName,
  restriction: ClassRestriction
): boolean {
  return CLASSES[className].restrictions.includes(restriction);
}

/**
 * Get ability potency for a class (1.0 for normal, 0.75 for Freelancer)
 */
export function getAbilityPotency(className: ClassName): number {
  return className === 'Freelancer' ? FREELANCER_PASSIVE_POTENCY : 1.0;
}

// =============================================================================
// SPELL/TOME SLOT CALCULATIONS
// =============================================================================

/**
 * Calculate spell slots for a class at a given level
 * Mages and Healers start with +1 and gain +1 every 10 levels
 */
export function calculateSpellSlots(className: ClassName, level: number): number {
  const baseSlots = 1;

  if (className === 'Mage' || className === 'Healer') {
    // +1 at start, +1 every 10 levels
    return baseSlots + 1 + Math.floor(level / 10);
  }

  // Freelancer gets 75% (rounded down) of the Mage bonus
  if (className === 'Freelancer') {
    const mageBonus = 1 + Math.floor(level / 10);
    return baseSlots + Math.floor(mageBonus * FREELANCER_PASSIVE_POTENCY);
  }

  return baseSlots;
}

/**
 * Calculate tome slots for a class at a given level
 * Same logic as spell slots
 */
export function calculateTomeSlots(className: ClassName, level: number): number {
  return calculateSpellSlots(className, level);
}

/**
 * Calculate tome uses multiplier
 * Mages and Healers get double uses
 */
export function getTomeUsesMultiplier(className: ClassName): number {
  if (className === 'Mage' || className === 'Healer') {
    return 2;
  }

  if (className === 'Freelancer') {
    return 1 + FREELANCER_PASSIVE_POTENCY; // 1.75x
  }

  return 1;
}

/**
 * Calculate martial arts uses multiplier
 * Healers get double uses
 */
export function getMartialArtsUsesMultiplier(className: ClassName): number {
  if (className === 'Healer') {
    return 2;
  }

  if (className === 'Freelancer') {
    return 1 + FREELANCER_PASSIVE_POTENCY; // 1.75x
  }

  return 1;
}

// =============================================================================
// CLASS ABILITY DESCRIPTIONS
// =============================================================================

/** Human-readable ability descriptions */
export const ABILITY_DESCRIPTIONS: Record<ClassAbility, string> = {
  high_crit: '50% critical chance with melee or ranged weapons',
  unarmed_bonus: '1.5x damage with unarmed martial arts',
  concentrate: 'Wand: Next spell is auto-critical (single target only)',
  focus: 'Staff: Sacrifice turn, next spell deals 2.5x damage to all targets',
  extra_slots: '+1 spell and +1 tome slot at start, +1 more every 10 levels',
  double_tome_uses: 'Tomes have double uses',
  cover: 'Take damage for chosen ally if your AGI > enemy AGI',
  brace: 'Block 25-75% of all incoming damage for 1 turn',
  thorns: '25% chance to deal 50% damage back on enemy melee hits',
  reflect: '10% chance to reflect 50% of spell damage',
  ranged_negate: '25% chance to completely negate ranged attacks',
  counter_martial: '100% chance to counter martial arts for 100% damage',
  double_healing: 'Receive double healing from all sources',
  elemental_resist: '+1% resistance to all elements per level',
  heal_bonus: '2x healing output on all healing spells',
  revive: 'Revive spell restores ally to 50% HP',
  avoid: '1% dodge chance per 5 AGI points',
  status_immune: 'Immune to dark and poison status effects',
  martial_double_uses: 'Martial arts have double uses',
  all_passives: 'Has all other class passives at 75% potency',
};

/**
 * Get ability descriptions for a class
 */
export function getClassAbilityDescriptions(className: ClassName): string[] {
  if (className === 'Freelancer') {
    return [ABILITY_DESCRIPTIONS.all_passives];
  }

  return CLASSES[className].abilities.map(
    ability => ABILITY_DESCRIPTIONS[ability]
  );
}

/** Human-readable restriction descriptions */
export const RESTRICTION_DESCRIPTIONS: Record<ClassRestriction, string> = {
  no_magic_weapons: 'Cannot use staves or wands',
  no_martial_arts: 'Cannot use martial arts',
  reduced_agi: 'AGI reduced by 20%',
};

/**
 * Get restriction descriptions for a class
 */
export function getClassRestrictionDescriptions(className: ClassName): string[] {
  return CLASSES[className].restrictions.map(
    restriction => RESTRICTION_DESCRIPTIONS[restriction]
  );
}
