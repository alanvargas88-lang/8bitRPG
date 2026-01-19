/**
 * Race definitions for the 8-bit RPG
 * Humans, Espers, Cyborgs, and Fae with their unique traits
 */

import type {
  Race,
  RaceName,
  Stats,
  StatGrowth,
  ClassName,
  RaceTrait,
  ArmorSlot,
} from './types.js';
import { createBaseStats } from './stats.js';
import {
  CYBORG_BASE_GEAR_SLOTS,
  CYBORG_SLOT_UNLOCK_INTERVAL,
} from './constants.js';

// =============================================================================
// RACE DEFINITIONS
// =============================================================================

/**
 * Human race definition
 * - Base stats at level 1: All 10
 * - Normal growth per level (depends on class)
 * - Can be any class, including exclusive Freelancer
 * - Weakness: Take 1.5x damage from consumable weapons
 */
export const HumanRace: Race = {
  name: 'Human',
  baseStats: createBaseStats(10, 10, 10, 10, 10),
  growth: {
    STR: 0,
    AGI: 0,
    MAG: 0,
    DEF: 0,
    CON: 0,
  }, // Growth comes from class
  allowedClasses: ['Warrior', 'Mage', 'Defender', 'Healer', 'Freelancer'],
  traits: [],
  weakness: 'consumable',
};

/**
 * Esper race definition
 * - Base: MAG 25, AGI 15, others 8
 * - Growth: +0.5 STR/CON, +3 MAG/AGI, +1 DEF per level
 * - Mage only
 * - +1 spell and +1 tome slot
 * - Spells and tomes do 2x damage and get +25% critical damage
 * - Cannot use martial arts
 * - Weakness: Take 1.5x melee damage
 */
export const EsperRace: Race = {
  name: 'Esper',
  baseStats: createBaseStats(8, 15, 25, 8, 8),
  growth: {
    STR: 0.5,
    AGI: 3,
    MAG: 3,
    DEF: 1,
    CON: 0.5,
  },
  allowedClasses: ['Mage'],
  traits: [
    'extra_spell_slot',
    'spell_crit_bonus',
    'spell_damage_double',
    'no_martial_arts',
  ],
  weakness: 'melee',
};

/**
 * Cyborg race definition
 * - Base: All 5
 * - No level growth - stats come entirely from equipped gear
 * - Start with 2 gear slots (head + body)
 * - Gain +1 slot every 10 levels (arms at 10, legs at 20, torso at 30, back at 40)
 * - Dual wield: Equip 2 weapons and 2 shields
 * - Consumable weapons get 2x critical damage and 25% chance not to consume a use
 * - Shop upgrades: +10 to any stat for 500 gold
 * - MP capped at 50 (effective MAG max 50)
 * - No staves or wands
 * - Weakness: Take 1.5x magic damage
 */
export const CyborgRace: Race = {
  name: 'Cyborg',
  baseStats: createBaseStats(5, 5, 5, 5, 5),
  growth: null, // No level growth
  allowedClasses: ['Warrior', 'Mage', 'Defender', 'Healer'],
  traits: [
    'dual_wield',
    'gear_dependent',
    'shop_upgrades',
    'mp_capped',
    'no_staves_wands',
    'consumable_save',
    'consumable_crit',
  ],
  weakness: 'magic',
};

/**
 * Fae race definition
 * - Base and growth depend on subtype
 * - Stats reset to new subtype's table when eating meat
 * - Martial arts attacks have infinite uses (regenerate at hotel)
 * - 25% chance for double attack with martial arts
 * - Cannot use tomes
 * - Deal half damage with melee and ranged weapons
 * - Armor provides non-DEF benefits only; DEF boost shows as "X" on status screen
 * - Weakness: Take 1.5x ranged damage
 */
export const FaeRace: Race = {
  name: 'Fae',
  baseStats: createBaseStats(5, 5, 5, 5, 5), // Overridden by subtype
  growth: null, // Depends on subtype
  allowedClasses: ['Warrior', 'Mage', 'Defender', 'Healer'],
  traits: [
    'subtype_dependent',
    'infinite_martial',
    'double_attack',
    'no_tomes',
    'half_weapon_damage',
    'def_from_armor_ignored',
  ],
  weakness: 'ranged',
};

// =============================================================================
// RACE LOOKUP
// =============================================================================

/** All races indexed by name */
export const RACES: Record<RaceName, Race> = {
  Human: HumanRace,
  Esper: EsperRace,
  Cyborg: CyborgRace,
  Fae: FaeRace,
};

/**
 * Get a race by name
 */
export function getRace(name: RaceName): Race {
  return RACES[name];
}

// =============================================================================
// RACE UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a class is allowed for a race
 */
export function isClassAllowedForRace(
  race: RaceName,
  className: ClassName
): boolean {
  return RACES[race].allowedClasses.includes(className);
}

/**
 * Get allowed classes for a race
 */
export function getAllowedClassesForRace(race: RaceName): ClassName[] {
  return RACES[race].allowedClasses;
}

/**
 * Check if race has a specific trait
 */
export function raceHasTrait(race: RaceName, trait: RaceTrait): boolean {
  return RACES[race].traits.includes(trait);
}

/**
 * Get base stats for a race (for Fae, returns default; use subtype for actual)
 */
export function getRaceBaseStats(race: RaceName): Stats {
  return { ...RACES[race].baseStats };
}

/**
 * Get stat growth for a race
 * Returns null for Cyborg (gear-dependent) and Fae (subtype-dependent)
 */
export function getRaceGrowth(race: RaceName): StatGrowth | null {
  return RACES[race].growth ? { ...RACES[race].growth } : null;
}

// =============================================================================
// CYBORG GEAR SLOTS
// =============================================================================

/** Cyborg gear slot unlock order */
const CYBORG_SLOT_UNLOCK_ORDER: ArmorSlot[] = [
  'head',    // Start
  'body',    // Start
  'arms',    // Level 10
  'legs',    // Level 20
  'torso',   // Level 30
  'back',    // Level 40
];

/**
 * Get available gear slots for a Cyborg at a given level
 */
export function getCyborgGearSlots(level: number): ArmorSlot[] {
  // Start with 2 base slots
  let slotsCount = CYBORG_BASE_GEAR_SLOTS;

  // Add +1 slot every 10 levels
  slotsCount += Math.floor(level / CYBORG_SLOT_UNLOCK_INTERVAL);

  // Cap at total available slots
  slotsCount = Math.min(slotsCount, CYBORG_SLOT_UNLOCK_ORDER.length);

  return CYBORG_SLOT_UNLOCK_ORDER.slice(0, slotsCount);
}

/**
 * Check if a Cyborg can equip a slot at their level
 */
export function canCyborgEquipSlot(level: number, slot: ArmorSlot): boolean {
  return getCyborgGearSlots(level).includes(slot);
}

/**
 * Get the next slot unlock level for a Cyborg
 * Returns null if all slots are unlocked
 */
export function getNextCyborgSlotUnlockLevel(currentLevel: number): number | null {
  const currentSlots = getCyborgGearSlots(currentLevel).length;

  if (currentSlots >= CYBORG_SLOT_UNLOCK_ORDER.length) {
    return null;
  }

  // Calculate when next slot unlocks
  const nextUnlockIndex = currentSlots;
  if (nextUnlockIndex < 2) {
    return 1; // Base slots available at level 1
  }

  return (nextUnlockIndex - 1) * CYBORG_SLOT_UNLOCK_INTERVAL;
}

// =============================================================================
// RACE WEAKNESS DESCRIPTIONS
// =============================================================================

/** Human-readable weakness descriptions */
export const WEAKNESS_DESCRIPTIONS: Record<Race['weakness'], string> = {
  consumable: 'Takes 1.5x damage from consumable weapons',
  melee: 'Takes 1.5x damage from melee attacks',
  magic: 'Takes 1.5x damage from magic attacks',
  ranged: 'Takes 1.5x damage from ranged attacks',
};

/**
 * Get weakness description for a race
 */
export function getRaceWeaknessDescription(race: RaceName): string {
  return WEAKNESS_DESCRIPTIONS[RACES[race].weakness];
}

// =============================================================================
// RACE TRAIT DESCRIPTIONS
// =============================================================================

/** Human-readable trait descriptions */
export const TRAIT_DESCRIPTIONS: Record<RaceTrait, string> = {
  extra_spell_slot: '+1 spell and +1 tome slot',
  spell_crit_bonus: '+25% critical damage on spells and tomes',
  spell_damage_double: 'Spells and tomes deal 2x damage',
  dual_wield: 'Can equip 2 weapons and 2 shields',
  gear_dependent: 'Stats come entirely from equipped gear',
  shop_upgrades: 'Can buy +10 to any stat for 500 gold at shops',
  mp_capped: 'MP capped at 50',
  no_staves_wands: 'Cannot use staves or wands',
  consumable_save: '25% chance not to consume a use on consumables',
  consumable_crit: '2x critical damage on consumable weapons',
  infinite_martial: 'Martial arts have infinite uses (regenerate at hotel)',
  double_attack: '25% chance for double attack with martial arts',
  no_tomes: 'Cannot use tomes',
  half_weapon_damage: 'Deal half damage with melee and ranged weapons',
  def_from_armor_ignored: 'Armor DEF bonus is ignored (shows as "X")',
  subtype_dependent: 'Stats depend on current subtype',
  no_martial_arts: 'Cannot use martial arts',
};

/**
 * Get trait descriptions for a race
 */
export function getRaceTraitDescriptions(race: RaceName): string[] {
  return RACES[race].traits.map(trait => TRAIT_DESCRIPTIONS[trait]);
}
