/**
 * Core game constants for the 8-bit RPG
 * All fundamental values and caps are defined here
 */

// =============================================================================
// STAT CAPS
// =============================================================================

/** Maximum value for any stat (STR, AGI, MAG, DEF, CON) */
export const MAX_STAT = 200;

/** Maximum HP a character can have */
export const MAX_HP = 9999;

/** Maximum MP a character can have */
export const MAX_MP = 9999;

/** Maximum level a character can reach */
export const MAX_LEVEL = 50;

/** MP cap for Cyborgs (effective MAG max 50) */
export const CYBORG_MAX_MP = 50;

// =============================================================================
// BASE STAT CALCULATIONS
// =============================================================================

/** Base HP before CON modifier */
export const BASE_HP = 100;

/** HP gained per point of CON */
export const HP_PER_CON = 50;

/** Base MP before MAG modifier */
export const BASE_MP = 100;

/** MP gained per point of MAG */
export const MP_PER_MAG = 50;

// =============================================================================
// DAMAGE FORMULA CONSTANTS
// =============================================================================

/** Minimum random damage multiplier for melee/ranged */
export const DAMAGE_VARIANCE_MIN = 0.8;

/** Maximum random damage multiplier for melee/ranged */
export const DAMAGE_VARIANCE_MAX = 1.2;

/** Minimum random damage multiplier for spells */
export const SPELL_VARIANCE_MIN = 0.9;

/** Maximum random damage multiplier for spells */
export const SPELL_VARIANCE_MAX = 1.1;

/** Divisor for stat contribution to weapon damage */
export const WEAPON_STAT_DIVISOR = 2;

/** Maximum defense reduction (DEF / MAX_STAT) */
export const MAX_DEFENSE_REDUCTION = MAX_STAT;

// =============================================================================
// CRITICAL HIT CONSTANTS
// =============================================================================

/** Base critical hit chance (5%) */
export const BASE_CRIT_CHANCE = 0.05;

/** Critical hit damage multiplier */
export const CRIT_DAMAGE_MULTIPLIER = 2;

/** Warrior critical chance with weapons (50%) */
export const WARRIOR_CRIT_CHANCE = 0.50;

/** Esper additional critical damage bonus (+25%) */
export const ESPER_CRIT_DAMAGE_BONUS = 0.25;

/** Cyborg consumable critical damage multiplier (2x base = 4x total) */
export const CYBORG_CONSUMABLE_CRIT_MULTIPLIER = 2;

// =============================================================================
// DODGE CONSTANTS
// =============================================================================

/** Base dodge chance divisor (AGI / 200) */
export const DODGE_DIVISOR = 200;

/** Healer dodge chance divisor (AGI / 5) */
export const HEALER_DODGE_DIVISOR = 5;

// =============================================================================
// CLASS MULTIPLIERS
// =============================================================================

/** Mage damage spell multiplier */
export const MAGE_SPELL_DAMAGE_MULTIPLIER = 2;

/** Healer healing multiplier */
export const HEALER_HEAL_MULTIPLIER = 2;

/** Warrior unarmed damage multiplier */
export const WARRIOR_UNARMED_MULTIPLIER = 1.5;

/** Mage Focus ability damage multiplier */
export const MAGE_FOCUS_MULTIPLIER = 2.5;

/** Freelancer passive potency multiplier */
export const FREELANCER_PASSIVE_POTENCY = 0.75;

// =============================================================================
// DEFENDER CLASS CONSTANTS
// =============================================================================

/** Defender Brace minimum block percentage */
export const DEFENDER_BRACE_MIN = 0.25;

/** Defender Brace maximum block percentage */
export const DEFENDER_BRACE_MAX = 0.75;

/** Defender thorns damage chance */
export const DEFENDER_THORNS_CHANCE = 0.25;

/** Defender thorns damage percentage */
export const DEFENDER_THORNS_DAMAGE = 0.50;

/** Defender spell reflect chance */
export const DEFENDER_REFLECT_CHANCE = 0.10;

/** Defender spell reflect damage percentage */
export const DEFENDER_REFLECT_DAMAGE = 0.50;

/** Defender ranged negate chance */
export const DEFENDER_RANGED_NEGATE_CHANCE = 0.25;

/** Defender martial arts counter chance */
export const DEFENDER_COUNTER_CHANCE = 1.0;

/** Defender martial arts counter damage percentage */
export const DEFENDER_COUNTER_DAMAGE = 1.0;

/** Defender healing received multiplier */
export const DEFENDER_HEAL_RECEIVED_MULTIPLIER = 2;

/** Defender elemental resistance per level */
export const DEFENDER_RESIST_PER_LEVEL = 0.01;

/** Defender AGI reduction */
export const DEFENDER_AGI_REDUCTION = 0.20;

// =============================================================================
// RACE WEAKNESS MULTIPLIERS
// =============================================================================

/** Human weakness to consumable weapons */
export const HUMAN_CONSUMABLE_WEAKNESS = 1.5;

/** Esper weakness to melee damage */
export const ESPER_MELEE_WEAKNESS = 1.5;

/** Cyborg weakness to magic damage */
export const CYBORG_MAGIC_WEAKNESS = 1.5;

/** Fae weakness to ranged damage */
export const FAE_RANGED_WEAKNESS = 1.5;

/** Fae weapon damage reduction */
export const FAE_WEAPON_DAMAGE_REDUCTION = 0.5;

// =============================================================================
// FAE RACE CONSTANTS
// =============================================================================

/** Fae martial arts double attack chance */
export const FAE_DOUBLE_ATTACK_CHANCE = 0.25;

/** Fae meat drop chance from enemies */
export const FAE_MEAT_DROP_CHANCE = 0.10;

// =============================================================================
// CYBORG RACE CONSTANTS
// =============================================================================

/** Cyborg starting gear slots */
export const CYBORG_BASE_GEAR_SLOTS = 2;

/** Levels between Cyborg gear slot unlocks */
export const CYBORG_SLOT_UNLOCK_INTERVAL = 10;

/** Cyborg shop stat upgrade cost */
export const CYBORG_STAT_UPGRADE_COST = 500;

/** Cyborg shop stat upgrade amount */
export const CYBORG_STAT_UPGRADE_AMOUNT = 10;

/** Cyborg consumable non-consume chance */
export const CYBORG_CONSUMABLE_SAVE_CHANCE = 0.25;

// =============================================================================
// ESPER RACE CONSTANTS
// =============================================================================

/** Esper spell/tome damage multiplier */
export const ESPER_SPELL_DAMAGE_MULTIPLIER = 2;

// =============================================================================
// HEALER CLASS CONSTANTS
// =============================================================================

/** Healer Revive HP restoration percentage */
export const HEALER_REVIVE_HP_PERCENT = 0.50;

// =============================================================================
// INVENTORY CONSTANTS
// =============================================================================

/** Base inventory slots per character */
export const BASE_INVENTORY_SLOTS = 8;

/** Party size */
export const PARTY_SIZE = 4;

/** Total base party inventory slots */
export const TOTAL_BASE_INVENTORY = BASE_INVENTORY_SLOTS * PARTY_SIZE;

/** Cyborg extra inventory slots */
export const CYBORG_EXTRA_INVENTORY = 4;

/** Maximum tome/consumable uses */
export const MAX_ITEM_USES = 99;

/** Uses required to learn new tome/martial art */
export const USES_TO_LEARN_NEW = 50;

// =============================================================================
// HOTEL CONSTANTS
// =============================================================================

/** Hotel rest cost in gold */
export const HOTEL_COST = 50;

/** Hotel use regeneration percentage */
export const HOTEL_USE_REGEN_PERCENT = 0.50;

// =============================================================================
// BATTLE CONSTANTS
// =============================================================================

/** Overworld battle encounter rate */
export const OVERWORLD_ENCOUNTER_RATE = 0.10;

/** Dungeon battle encounter rate */
export const DUNGEON_ENCOUNTER_RATE = 0.25;

/** Dungeon EXP multiplier */
export const DUNGEON_EXP_MULTIPLIER = 2;

/** Maximum enemies in battle */
export const MAX_ENEMIES_IN_BATTLE = 4;

/** EXP per enemy level */
export const EXP_PER_ENEMY_LEVEL = 20;

/** EXP variance (±10%) */
export const EXP_VARIANCE = 0.10;

/** Gold loss on party wipe */
export const WIPE_GOLD_LOSS = 0.50;

// =============================================================================
// DISPLAY CONSTANTS
// =============================================================================

/** Game window width (Game Boy resolution) */
export const SCREEN_WIDTH = 160;

/** Game window height (Game Boy resolution) */
export const SCREEN_HEIGHT = 144;

// =============================================================================
// ELEMENTS
// =============================================================================

/** All element types in the game */
export const ELEMENTS = [
  'fire',
  'ice',
  'thunder',
  'wind',
  'earth',
  'water',
  'light',
  'dark',
] as const;

/** Number of elements */
export const ELEMENT_COUNT = ELEMENTS.length;
