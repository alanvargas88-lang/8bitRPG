/**
 * Damage and healing formulas for the 8-bit RPG
 * All combat calculations are defined here
 */

import {
  DAMAGE_VARIANCE_MIN,
  DAMAGE_VARIANCE_MAX,
  SPELL_VARIANCE_MIN,
  SPELL_VARIANCE_MAX,
  WEAPON_STAT_DIVISOR,
  MAX_DEFENSE_REDUCTION,
  MAGE_SPELL_DAMAGE_MULTIPLIER,
  HEALER_HEAL_MULTIPLIER,
  WARRIOR_UNARMED_MULTIPLIER,
  MAGE_FOCUS_MULTIPLIER,
  ESPER_SPELL_DAMAGE_MULTIPLIER,
  FAE_WEAPON_DAMAGE_REDUCTION,
  HUMAN_CONSUMABLE_WEAKNESS,
  ESPER_MELEE_WEAKNESS,
  CYBORG_MAGIC_WEAKNESS,
  FAE_RANGED_WEAKNESS,
  DEFENDER_HEAL_RECEIVED_MULTIPLIER,
} from './constants.js';
import type {
  Stats,
  Character,
  Enemy,
  Weapon,
  Spell,
  MartialArt,
  BattleContext,
  Element,
  ElementalResistances,
  RaceName,
  ClassName,
  DamageType,
} from './types.js';

// =============================================================================
// RANDOM NUMBER GENERATION
// =============================================================================

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Generate damage variance multiplier for melee/ranged (0.8 to 1.2)
 */
export function rollDamageVariance(): number {
  return randomRange(DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_MAX);
}

/**
 * Generate damage variance multiplier for spells (0.9 to 1.1)
 */
export function rollSpellVariance(): number {
  return randomRange(SPELL_VARIANCE_MIN, SPELL_VARIANCE_MAX);
}

// =============================================================================
// DEFENSE CALCULATION
// =============================================================================

/**
 * Calculate defense reduction multiplier
 * Formula: (1 - (target_DEF / 200))
 * @returns Multiplier from 0 (100% reduction) to 1 (0% reduction)
 */
export function calculateDefenseReduction(targetDEF: number): number {
  return 1 - targetDEF / MAX_DEFENSE_REDUCTION;
}

/**
 * Calculate elemental damage multiplier based on resistance
 * @param resistance - Target's resistance (0-1 where 1 = immune)
 * @returns Multiplier applied to damage
 */
export function calculateElementalMultiplier(resistance: number): number {
  return 1 - Math.min(1, Math.max(0, resistance));
}

// =============================================================================
// MELEE DAMAGE
// =============================================================================

/**
 * Calculate melee damage
 * Formula: floor((STR / 2) + weapon_power) * random(0.8 to 1.2) * (1 - (target_DEF / 200))
 * Applies to melee weapons and unarmed martial arts
 */
export function calculateMeleeDamage(
  attackerSTR: number,
  weaponPower: number,
  targetDEF: number,
  options?: {
    variance?: number;
    isWarriorUnarmed?: boolean;
    isFae?: boolean;
    isConsumableVsHuman?: boolean;
  }
): number {
  // Base damage: floor((STR / 2) + weapon_power)
  let baseDamage = Math.floor(attackerSTR / WEAPON_STAT_DIVISOR + weaponPower);

  // Warrior unarmed bonus (1.5x)
  if (options?.isWarriorUnarmed) {
    baseDamage = Math.floor(baseDamage * WARRIOR_UNARMED_MULTIPLIER);
  }

  // Fae weapon damage reduction (50%)
  if (options?.isFae && weaponPower > 0) {
    baseDamage = Math.floor(baseDamage * FAE_WEAPON_DAMAGE_REDUCTION);
  }

  // Apply variance
  const variance = options?.variance ?? rollDamageVariance();
  let damage = baseDamage * variance;

  // Apply defense reduction
  const defenseMultiplier = calculateDefenseReduction(targetDEF);
  damage *= defenseMultiplier;

  // Human weakness to consumables
  if (options?.isConsumableVsHuman) {
    damage *= HUMAN_CONSUMABLE_WEAKNESS;
  }

  return Math.floor(Math.max(1, damage));
}

// =============================================================================
// RANGED DAMAGE
// =============================================================================

/**
 * Calculate ranged damage
 * Formula: floor((AGI / 2) + weapon_power) * random(0.8 to 1.2) * (1 - (target_DEF / 200))
 * Applies to bows, thrown weapons, consumables, and certain abilities
 */
export function calculateRangedDamage(
  attackerAGI: number,
  weaponPower: number,
  targetDEF: number,
  options?: {
    variance?: number;
    isFae?: boolean;
    targetIsFae?: boolean;
  }
): number {
  // Base damage: floor((AGI / 2) + weapon_power)
  let baseDamage = Math.floor(attackerAGI / WEAPON_STAT_DIVISOR + weaponPower);

  // Fae weapon damage reduction (50%)
  if (options?.isFae && weaponPower > 0) {
    baseDamage = Math.floor(baseDamage * FAE_WEAPON_DAMAGE_REDUCTION);
  }

  // Apply variance
  const variance = options?.variance ?? rollDamageVariance();
  let damage = baseDamage * variance;

  // Apply defense reduction
  const defenseMultiplier = calculateDefenseReduction(targetDEF);
  damage *= defenseMultiplier;

  // Fae weakness to ranged
  if (options?.targetIsFae) {
    damage *= FAE_RANGED_WEAKNESS;
  }

  return Math.floor(Math.max(1, damage));
}

// =============================================================================
// SPELL DAMAGE
// =============================================================================

/**
 * Calculate spell or tome damage
 * Formula: MAG + spell_power * random(0.9 to 1.1) * (1 - elemental_resist)
 * Mages multiply this by 2 for damage spells
 * Espers deal 2x damage with spells and tomes
 */
export function calculateSpellDamage(
  attackerMAG: number,
  spellPower: number,
  targetResistance: number,
  options?: {
    variance?: number;
    isMage?: boolean;
    isEsper?: boolean;
    isFocused?: boolean;
    targetIsCyborg?: boolean;
  }
): number {
  // Base damage: MAG + spell_power
  let baseDamage = attackerMAG + spellPower;

  // Apply variance
  const variance = options?.variance ?? rollSpellVariance();
  let damage = baseDamage * variance;

  // Mage damage spell multiplier (2x)
  if (options?.isMage) {
    damage *= MAGE_SPELL_DAMAGE_MULTIPLIER;
  }

  // Esper spell damage multiplier (2x) - stacks with Mage if somehow both
  if (options?.isEsper) {
    damage *= ESPER_SPELL_DAMAGE_MULTIPLIER;
  }

  // Mage Focus ability (2.5x)
  if (options?.isFocused) {
    damage *= MAGE_FOCUS_MULTIPLIER;
  }

  // Apply elemental resistance
  const elementalMultiplier = calculateElementalMultiplier(targetResistance);
  damage *= elementalMultiplier;

  // Cyborg weakness to magic
  if (options?.targetIsCyborg) {
    damage *= CYBORG_MAGIC_WEAKNESS;
  }

  return Math.floor(Math.max(1, damage));
}

// =============================================================================
// HEALING
// =============================================================================

/**
 * Calculate healing amount
 * Formula: MAG + spell_power
 * Healers multiply healing by 2
 * Defenders receive double healing from all sources
 */
export function calculateHealing(
  healerMAG: number,
  spellPower: number,
  options?: {
    isHealer?: boolean;
    targetIsDefender?: boolean;
  }
): number {
  // Base healing: MAG + spell_power
  let healing = healerMAG + spellPower;

  // Healer healing multiplier (2x)
  if (options?.isHealer) {
    healing *= HEALER_HEAL_MULTIPLIER;
  }

  // Defender receives double healing
  if (options?.targetIsDefender) {
    healing *= DEFENDER_HEAL_RECEIVED_MULTIPLIER;
  }

  return Math.floor(Math.max(1, healing));
}

// =============================================================================
// MARTIAL ARTS DAMAGE
// =============================================================================

/**
 * Calculate martial arts damage
 * Uses the martial art's base damage + scaling stat
 * Fae martial arts have infinite uses
 * Healer martial arts have double uses
 */
export function calculateMartialArtsDamage(
  martialArt: MartialArt,
  attackerStats: Stats,
  targetDEF: number,
  targetResistances: ElementalResistances,
  options?: {
    variance?: number;
    isWarrior?: boolean;
    targetIsEsper?: boolean;
    targetIsFae?: boolean;
  }
): number {
  const scalingStat = attackerStats[martialArt.scalingStat];
  let baseDamage = martialArt.baseDamage + scalingStat;

  // Warrior unarmed bonus applies to martial arts too (1.5x)
  if (options?.isWarrior) {
    baseDamage = Math.floor(baseDamage * WARRIOR_UNARMED_MULTIPLIER);
  }

  // Apply variance based on martial art type
  const variance = options?.variance ?? (
    martialArt.type === 'melee' ? rollDamageVariance() : rollDamageVariance()
  );
  let damage = baseDamage * variance;

  // Apply defense reduction
  const defenseMultiplier = calculateDefenseReduction(targetDEF);
  damage *= defenseMultiplier;

  // Apply elemental resistance if martial art has element
  if (martialArt.element) {
    const resistance = targetResistances[martialArt.element] || 0;
    damage *= calculateElementalMultiplier(resistance);
  }

  // Esper weakness to melee
  if (martialArt.type === 'melee' && options?.targetIsEsper) {
    damage *= ESPER_MELEE_WEAKNESS;
  }

  // Fae weakness to ranged
  if (martialArt.type === 'ranged' && options?.targetIsFae) {
    damage *= FAE_RANGED_WEAKNESS;
  }

  return Math.floor(Math.max(1, damage));
}

// =============================================================================
// MULTI-TARGET DAMAGE
// =============================================================================

/**
 * Split damage equally among multiple targets (for Focus/staff abilities)
 */
export function splitDamageForMultiTarget(totalDamage: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.floor(totalDamage / targetCount);
}

// =============================================================================
// WEAKNESS CHECKS
// =============================================================================

/**
 * Check if attacker has a weapon-based weakness against target
 */
export function checkWeaknessMultiplier(
  attackerRace: RaceName,
  targetRace: RaceName,
  damageType: DamageType,
  isConsumable: boolean = false
): number {
  // Human weakness: 1.5x from consumable weapons
  if (targetRace === 'Human' && isConsumable) {
    return HUMAN_CONSUMABLE_WEAKNESS;
  }

  // Esper weakness: 1.5x melee damage
  if (targetRace === 'Esper' && damageType === 'melee') {
    return ESPER_MELEE_WEAKNESS;
  }

  // Cyborg weakness: 1.5x magic damage
  if (targetRace === 'Cyborg' && damageType === 'spell') {
    return CYBORG_MAGIC_WEAKNESS;
  }

  // Fae weakness: 1.5x ranged damage
  if (targetRace === 'Fae' && damageType === 'ranged') {
    return FAE_RANGED_WEAKNESS;
  }

  return 1;
}

// =============================================================================
// COMBAT CONTEXT HELPERS
// =============================================================================

/**
 * Get weapon power from a weapon, handling variable damage weapons
 */
export function getWeaponPower(weapon: Weapon): number {
  if (weapon.powerRange) {
    return Math.floor(randomRange(weapon.powerRange.min, weapon.powerRange.max));
  }
  return weapon.power;
}

/**
 * Calculate full attack damage with all modifiers from battle context
 */
export function calculateAttackDamage(context: BattleContext): number {
  const { attacker, target, weapon, spell, martialArt, isFocused } = context;

  // Get attacker stats
  const attackerStats = 'baseStats' in attacker ? attacker.currentStats : attacker.stats;
  const attackerRace = 'race' in attacker ? attacker.race : null;
  const attackerClass = 'class' in attacker ? attacker.class : null;

  // Get target stats and properties
  const targetStats = 'baseStats' in target ? target.currentStats : target.stats;
  const targetRace = 'race' in target ? target.race : null;
  const targetResistances = 'resistances' in target ? target.resistances : null;

  // Spell damage
  if (spell) {
    const resistance = spell.element && targetResistances
      ? targetResistances[spell.element]
      : 0;

    return calculateSpellDamage(
      attackerStats.MAG,
      spell.power,
      resistance,
      {
        isMage: attackerClass === 'Mage',
        isEsper: attackerRace === 'Esper',
        isFocused,
        targetIsCyborg: targetRace === 'Cyborg',
      }
    );
  }

  // Martial arts damage
  if (martialArt) {
    return calculateMartialArtsDamage(
      martialArt,
      attackerStats,
      targetStats.DEF,
      targetResistances || {} as ElementalResistances,
      {
        isWarrior: attackerClass === 'Warrior',
        targetIsEsper: targetRace === 'Esper',
        targetIsFae: targetRace === 'Fae',
      }
    );
  }

  // Weapon damage
  if (weapon) {
    const weaponPower = getWeaponPower(weapon);

    if (weapon.damageType === 'melee') {
      return calculateMeleeDamage(
        attackerStats.STR,
        weaponPower,
        targetStats.DEF,
        {
          isWarriorUnarmed: attackerClass === 'Warrior' && weapon.type === 'unarmed',
          isFae: attackerRace === 'Fae',
          isConsumableVsHuman: weapon.type === 'thrown' && targetRace === 'Human',
        }
      );
    }

    if (weapon.damageType === 'ranged') {
      return calculateRangedDamage(
        attackerStats.AGI,
        weaponPower,
        targetStats.DEF,
        {
          isFae: attackerRace === 'Fae',
          targetIsFae: targetRace === 'Fae',
        }
      );
    }
  }

  // Default: unarmed melee attack
  return calculateMeleeDamage(
    attackerStats.STR,
    0,
    targetStats.DEF,
    {
      isWarriorUnarmed: attackerClass === 'Warrior',
    }
  );
}
