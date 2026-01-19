/**
 * Core type definitions for the 8-bit RPG
 */

import { ELEMENTS } from './constants.js';

// =============================================================================
// ELEMENT TYPES
// =============================================================================

/** Element type derived from the ELEMENTS constant */
export type Element = (typeof ELEMENTS)[number];

/** Elemental resistances mapped to percentages (0-1) */
export type ElementalResistances = Record<Element, number>;

// =============================================================================
// STAT TYPES
// =============================================================================

/** The five core stats */
export type StatName = 'STR' | 'AGI' | 'MAG' | 'DEF' | 'CON';

/** Core stats as a record */
export type Stats = Record<StatName, number>;

/** Stat growth rates per level */
export type StatGrowth = Record<StatName, number>;

// =============================================================================
// RACE TYPES
// =============================================================================

/** Available races in the game */
export type RaceName = 'Human' | 'Esper' | 'Cyborg' | 'Fae';

/** Race definition with base stats and growth */
export interface Race {
  name: RaceName;
  baseStats: Stats;
  /** Growth per level (null for Cyborg/Fae who don't gain stats normally) */
  growth: StatGrowth | null;
  /** Allowed class names for this race */
  allowedClasses: ClassName[];
  /** Race-specific abilities and traits */
  traits: RaceTrait[];
  /** Weakness description */
  weakness: WeaknessType;
}

/** Types of weaknesses */
export type WeaknessType =
  | 'consumable' // Human: 1.5x from consumable weapons
  | 'melee' // Esper: 1.5x melee damage
  | 'magic' // Cyborg: 1.5x magic damage
  | 'ranged'; // Fae: 1.5x ranged damage

/** Race-specific traits */
export type RaceTrait =
  | 'extra_spell_slot' // Esper: +1 spell and +1 tome slot
  | 'spell_crit_bonus' // Esper: +25% critical damage on spells/tomes
  | 'dual_wield' // Cyborg: Equip 2 weapons and 2 shields
  | 'gear_dependent' // Cyborg: Stats come from gear
  | 'shop_upgrades' // Cyborg: Can buy stat upgrades
  | 'mp_capped' // Cyborg: MP capped at 50
  | 'no_staves_wands' // Cyborg: Cannot use staves or wands
  | 'consumable_save' // Cyborg: 25% chance not to consume
  | 'consumable_crit' // Cyborg: 2x crit damage on consumables
  | 'infinite_martial' // Fae: Martial arts have infinite uses
  | 'double_attack' // Fae: 25% chance double attack with martial
  | 'no_tomes' // Fae: Cannot use tomes
  | 'half_weapon_damage' // Fae: Half damage with melee/ranged weapons
  | 'def_from_armor_ignored' // Fae: Armor DEF boost ignored
  | 'subtype_dependent' // Fae: Stats depend on subtype
  | 'no_martial_arts' // Esper: Cannot use martial arts
  | 'spell_damage_double'; // Esper: Spells and tomes do 2x damage

// =============================================================================
// CLASS TYPES
// =============================================================================

/** Available classes in the game */
export type ClassName = 'Warrior' | 'Mage' | 'Defender' | 'Healer' | 'Freelancer';

/** Class definition with abilities and growth */
export interface CharacterClass {
  name: ClassName;
  baseStatBonus: Partial<Stats>;
  growth: StatGrowth;
  abilities: ClassAbility[];
  /** Restrictions on equipment/abilities */
  restrictions: ClassRestriction[];
}

/** Class-specific abilities */
export type ClassAbility =
  | 'high_crit' // Warrior: 50% crit with weapons
  | 'unarmed_bonus' // Warrior: 1.5x unarmed damage
  | 'concentrate' // Mage: Next spell auto-crit (wand)
  | 'focus' // Mage: 2.5x damage, multi-target (staff)
  | 'extra_slots' // Mage: Extra spell/tome slots
  | 'double_tome_uses' // Mage: Tomes have double uses
  | 'cover' // Defender: Take damage for ally
  | 'brace' // Defender: Block 25-75% damage
  | 'thorns' // Defender: 25% chance 50% thorns
  | 'reflect' // Defender: 10% chance 50% spell reflect
  | 'ranged_negate' // Defender: 25% chance negate ranged
  | 'counter_martial' // Defender: 100% counter martial arts
  | 'double_healing' // Defender: Receive 2x healing
  | 'elemental_resist' // Defender: +1% resist per level
  | 'heal_bonus' // Healer: 2x healing output
  | 'revive' // Healer: Revive to 50% HP
  | 'avoid' // Healer: AGI/5 dodge chance
  | 'status_immune' // Healer: Immune to dark/poison
  | 'martial_double_uses' // Healer: Double martial art uses
  | 'all_passives'; // Freelancer: All passives at 0.75x

/** Class restrictions */
export type ClassRestriction =
  | 'no_magic_weapons' // Warrior: Can't use staves/wands
  | 'no_martial_arts' // Mage: Can't use martial arts
  | 'reduced_agi'; // Defender: AGI reduced by 20%

// =============================================================================
// FAE SUBTYPE TYPES
// =============================================================================

/** Available Fae subtypes */
export type FaeSubtypeName = 'Slime' | 'Dino' | 'Wolf' | 'Goblin' | 'Scorpion' | 'Beetle';

/** Fae subtype definition */
export interface FaeSubtype {
  name: FaeSubtypeName;
  baseStats: Stats;
  /** HP at level 1 (derived from baseStats but can be explicit) */
  baseHP: number;
  growth: StatGrowth;
  /** Level range when this subtype becomes available */
  availableAt: { min: number; max: number } | null;
  /** Martial arts abilities for this subtype */
  martialArts: MartialArt[];
}

/** Martial art ability for Fae */
export interface MartialArt {
  name: string;
  type: 'melee' | 'ranged';
  targeting: 'single' | 'multi' | 'aoe';
  /** Base damage formula components */
  baseDamage: number;
  /** Stat that adds to damage */
  scalingStat: StatName;
  /** Optional element */
  element?: Element;
}

// =============================================================================
// EQUIPMENT TYPES
// =============================================================================

/** Weapon types */
export type WeaponType =
  | 'sword'
  | 'knife'
  | 'axe'
  | 'spear'
  | 'bow'
  | 'crossbow'
  | 'thrown'
  | 'staff'
  | 'wand'
  | 'unarmed';

/** Damage type categories */
export type DamageType = 'melee' | 'ranged' | 'spell' | 'martial';

/** Weapon definition */
export interface Weapon {
  name: string;
  type: WeaponType;
  damageType: DamageType;
  power: number;
  /** Optional power range for variable damage weapons */
  powerRange?: { min: number; max: number };
  /** Optional elemental damage */
  element?: Element;
  /** Stat bonuses from weapon */
  statBonuses?: Partial<Stats>;
}

/** Armor slot types */
export type ArmorSlot = 'head' | 'body' | 'arms' | 'legs' | 'torso' | 'back';

/** Shield definition */
export interface Shield {
  name: string;
  defenseBonus: number;
  statBonuses?: Partial<Stats>;
  resistances?: Partial<ElementalResistances>;
}

/** Armor definition */
export interface Armor {
  name: string;
  slot: ArmorSlot;
  defenseBonus: number;
  statBonuses?: Partial<Stats>;
  resistances?: Partial<ElementalResistances>;
  /** Status immunities */
  statusImmunities?: StatusEffect[];
}

// =============================================================================
// SPELL AND TOME TYPES
// =============================================================================

/** Spell targeting types */
export type SpellTargeting = 'single' | 'multi' | 'all' | 'self' | 'ally' | 'all_allies';

/** Spell definition */
export interface Spell {
  name: string;
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'status';
  power: number;
  mpCost: number;
  targeting: SpellTargeting;
  element?: Element;
  statusEffect?: StatusEffect;
}

/** Tome (limited use spell item) */
export interface Tome {
  name: string;
  spell: Spell;
  maxUses: number;
  currentUses: number;
}

// =============================================================================
// STATUS EFFECT TYPES
// =============================================================================

/** Status effects in the game */
export type StatusEffect =
  | 'poison' // Tick damage
  | 'dark' // Reduced accuracy / tick damage
  | 'paralysis' // Skip turn chance
  | 'sleep' // Skip turns until hit
  | 'silence' // Cannot cast spells
  | 'blind' // Reduced accuracy
  | 'slow' // Reduced AGI
  | 'haste' // Increased AGI
  | 'regen' // HP recovery
  | 'protect' // Reduced physical damage
  | 'shell' // Reduced magic damage
  | 'berserk'; // Attack only, increased damage

// =============================================================================
// CHARACTER TYPES
// =============================================================================

/** Equipment loadout for a character */
export interface Equipment {
  weapon: Weapon | null;
  secondWeapon?: Weapon | null; // Cyborg only
  shield: Shield | null;
  secondShield?: Shield | null; // Cyborg only
  armor: Partial<Record<ArmorSlot, Armor>>;
}

/** Character state in battle/game */
export interface Character {
  id: string;
  name: string;
  race: RaceName;
  class: ClassName;
  level: number;
  exp: number;

  /** Base stats (before equipment) */
  baseStats: Stats;
  /** Current stats (after equipment and effects) */
  currentStats: Stats;

  /** Current HP */
  currentHP: number;
  /** Maximum HP */
  maxHP: number;
  /** Current MP */
  currentMP: number;
  /** Maximum MP */
  maxMP: number;

  /** Equipment */
  equipment: Equipment;

  /** Elemental resistances */
  resistances: ElementalResistances;

  /** Active status effects */
  statusEffects: StatusEffect[];

  /** For Fae: current subtype */
  faeSubtype?: FaeSubtypeName;

  /** Learned spells */
  spells: Spell[];
  /** Equipped tomes */
  tomes: Tome[];
  /** Martial arts (for classes that use them) */
  martialArts: MartialArt[];
}

// =============================================================================
// COMBAT TYPES
// =============================================================================

/** Attack result with all calculated values */
export interface AttackResult {
  attacker: string;
  target: string;
  damageType: DamageType;
  baseDamage: number;
  varianceMultiplier: number;
  defenseReduction: number;
  elementalMultiplier: number;
  criticalMultiplier: number;
  isCritical: boolean;
  finalDamage: number;
  isDodged: boolean;
  isNegated: boolean; // For Defender ranged negate
  isReflected: boolean;
  reflectDamage: number;
  thornsDamage: number;
  counterDamage: number;
}

/** Healing result */
export interface HealResult {
  healer: string;
  target: string;
  baseHealing: number;
  varianceMultiplier: number;
  classMultiplier: number;
  targetMultiplier: number; // Defender receives 2x
  finalHealing: number;
}

/** Turn order entry */
export interface TurnOrderEntry {
  character: Character;
  effectiveAGI: number;
  isPlayer: boolean;
}

// =============================================================================
// ENEMY TYPES
// =============================================================================

/** Enemy definition */
export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  maxHP: number;
  currentHP: number;
  resistances: ElementalResistances;
  attacks: EnemyAttack[];
  /** Drop table */
  drops: EnemyDrop[];
  /** EXP reward */
  expReward: number;
  /** Gold reward */
  goldReward: number;
}

/** Enemy attack pattern */
export interface EnemyAttack {
  name: string;
  damageType: DamageType;
  power: number;
  /** Optional power range */
  powerRange?: { min: number; max: number };
  targeting: SpellTargeting;
  element?: Element;
  statusEffect?: StatusEffect;
  /** Chance to use this attack (0-1) */
  useChance: number;
  /** Critical hit chance override */
  critChance?: number;
}

/** Enemy drop definition */
export interface EnemyDrop {
  itemType: 'gold' | 'item' | 'meat' | 'runestone';
  itemId?: string;
  /** Drop chance (0-1) */
  chance: number;
  /** Quantity range */
  quantity: { min: number; max: number };
}

// =============================================================================
// EXPERIENCE AND LEVELING TYPES
// =============================================================================

/** Level up result */
export interface LevelUpResult {
  previousLevel: number;
  newLevel: number;
  statGains: Partial<Stats>;
  newMaxHP: number;
  newMaxMP: number;
  /** New abilities unlocked */
  newAbilities: string[];
  /** For Cyborg: new gear slots */
  newGearSlots?: ArmorSlot[];
}

/** EXP table entry */
export interface ExpTableEntry {
  level: number;
  /** Total cumulative EXP needed */
  totalExp: number;
  /** EXP needed from previous level */
  expFromPrevious: number;
}

// =============================================================================
// BATTLE STATE TYPES
// =============================================================================

/** Battle context for formulas */
export interface BattleContext {
  attacker: Character | Enemy;
  target: Character | Enemy;
  weapon?: Weapon;
  spell?: Spell;
  martialArt?: MartialArt;
  isConcentrated?: boolean; // Mage Concentrate active
  isFocused?: boolean; // Mage Focus active
  isDungeonBattle?: boolean;
}
