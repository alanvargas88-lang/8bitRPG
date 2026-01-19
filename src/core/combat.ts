/**
 * Combat mechanics for the 8-bit RPG
 * Critical hits, dodge, turn order, and combat resolution
 */

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
  DEFENDER_THORNS_CHANCE,
  DEFENDER_THORNS_DAMAGE,
  DEFENDER_REFLECT_CHANCE,
  DEFENDER_REFLECT_DAMAGE,
  DEFENDER_RANGED_NEGATE_CHANCE,
  DEFENDER_COUNTER_CHANCE,
  DEFENDER_COUNTER_DAMAGE,
  FAE_DOUBLE_ATTACK_CHANCE,
  CYBORG_CONSUMABLE_SAVE_CHANCE,
} from './constants.js';
import type {
  Character,
  Enemy,
  TurnOrderEntry,
  AttackResult,
  DamageType,
  RaceName,
  ClassName,
  Weapon,
  Stats,
} from './types.js';
import { randomRange } from './formulas.js';

// =============================================================================
// CRITICAL HIT MECHANICS
// =============================================================================

/**
 * Calculate critical hit chance for an attacker
 * Base 5% chance, modified by class and race
 */
export function calculateCritChance(
  attackerClass: ClassName | null,
  attackerRace: RaceName | null,
  weapon?: Weapon,
  options?: {
    isConcentrated?: boolean;
    isConsumable?: boolean;
  }
): number {
  // Mage Concentrate: auto-crit (single target)
  if (options?.isConcentrated) {
    return 1.0;
  }

  let critChance = BASE_CRIT_CHANCE;

  // Warrior: 50% crit with melee or ranged weapons
  if (attackerClass === 'Warrior' && weapon) {
    if (weapon.damageType === 'melee' || weapon.damageType === 'ranged') {
      critChance = WARRIOR_CRIT_CHANCE;
    }
  }

  // Freelancer: 75% of Warrior crit chance
  if (attackerClass === 'Freelancer' && weapon) {
    if (weapon.damageType === 'melee' || weapon.damageType === 'ranged') {
      critChance = WARRIOR_CRIT_CHANCE * FREELANCER_PASSIVE_POTENCY;
    }
  }

  return critChance;
}

/**
 * Calculate critical damage multiplier
 * Base 2x, modified by race bonuses
 */
export function calculateCritMultiplier(
  attackerRace: RaceName | null,
  options?: {
    isSpellOrTome?: boolean;
    isConsumable?: boolean;
  }
): number {
  let multiplier = CRIT_DAMAGE_MULTIPLIER;

  // Esper: +25% critical damage on spells/tomes
  if (attackerRace === 'Esper' && options?.isSpellOrTome) {
    multiplier += ESPER_CRIT_DAMAGE_BONUS;
  }

  // Cyborg: 2x crit damage on consumables (total 4x)
  if (attackerRace === 'Cyborg' && options?.isConsumable) {
    multiplier *= CYBORG_CONSUMABLE_CRIT_MULTIPLIER;
  }

  return multiplier;
}

/**
 * Roll for critical hit
 */
export function rollCritical(critChance: number): boolean {
  return Math.random() < critChance;
}

// =============================================================================
// DODGE MECHANICS
// =============================================================================

/**
 * Calculate dodge chance for a defender
 * Base: AGI / 200
 * Healer Avoid: AGI / 5 (much higher)
 */
export function calculateDodgeChance(
  defenderAGI: number,
  defenderClass: ClassName | null
): number {
  // Healer Avoid ability
  if (defenderClass === 'Healer') {
    return defenderAGI / HEALER_DODGE_DIVISOR;
  }

  // Freelancer: 75% of Healer avoid
  if (defenderClass === 'Freelancer') {
    const healerAvoid = defenderAGI / HEALER_DODGE_DIVISOR;
    return healerAvoid * FREELANCER_PASSIVE_POTENCY;
  }

  // Base dodge chance
  return defenderAGI / DODGE_DIVISOR;
}

/**
 * Roll for dodge
 */
export function rollDodge(dodgeChance: number): boolean {
  return Math.random() < dodgeChance;
}

// =============================================================================
// TURN ORDER
// =============================================================================

/**
 * Sort combatants by AGI for turn order
 * Ties broken in favor of player party
 */
export function calculateTurnOrder(
  party: Character[],
  enemies: Enemy[]
): TurnOrderEntry[] {
  const entries: TurnOrderEntry[] = [];

  // Add party members
  for (const char of party) {
    if (char.currentHP > 0) {
      entries.push({
        character: char,
        effectiveAGI: char.currentStats.AGI,
        isPlayer: true,
      });
    }
  }

  // Add enemies (cast to Character for type compatibility)
  for (const enemy of enemies) {
    if (enemy.currentHP > 0) {
      entries.push({
        character: enemy as unknown as Character,
        effectiveAGI: enemy.stats.AGI,
        isPlayer: false,
      });
    }
  }

  // Sort by AGI descending, player wins ties
  entries.sort((a, b) => {
    if (a.effectiveAGI !== b.effectiveAGI) {
      return b.effectiveAGI - a.effectiveAGI;
    }
    // Tie: player wins
    if (a.isPlayer && !b.isPlayer) return -1;
    if (!a.isPlayer && b.isPlayer) return 1;
    return 0;
  });

  return entries;
}

// =============================================================================
// DEFENDER CLASS MECHANICS
// =============================================================================

/**
 * Check if Defender can cover an ally
 * Cover: Take damage for chosen ally if your AGI > enemy AGI
 */
export function canDefenderCover(
  defenderAGI: number,
  attackerAGI: number
): boolean {
  return defenderAGI > attackerAGI;
}

/**
 * Calculate Brace damage block percentage (random 25-75%)
 */
export function rollBraceBlock(): number {
  return randomRange(DEFENDER_BRACE_MIN, DEFENDER_BRACE_MAX);
}

/**
 * Check if Defender thorns triggers (25% chance)
 */
export function rollThorns(): boolean {
  return Math.random() < DEFENDER_THORNS_CHANCE;
}

/**
 * Calculate thorns damage (50% of received damage)
 */
export function calculateThornsDamage(receivedDamage: number): number {
  return Math.floor(receivedDamage * DEFENDER_THORNS_DAMAGE);
}

/**
 * Check if Defender reflects spell (10% chance)
 */
export function rollSpellReflect(): boolean {
  return Math.random() < DEFENDER_REFLECT_CHANCE;
}

/**
 * Calculate reflected spell damage (50%)
 */
export function calculateReflectDamage(spellDamage: number): number {
  return Math.floor(spellDamage * DEFENDER_REFLECT_DAMAGE);
}

/**
 * Check if Defender negates ranged attack (25% chance)
 */
export function rollRangedNegate(): boolean {
  return Math.random() < DEFENDER_RANGED_NEGATE_CHANCE;
}

/**
 * Check if Defender counters martial arts (100% chance)
 */
export function rollMartialCounter(): boolean {
  return Math.random() < DEFENDER_COUNTER_CHANCE;
}

/**
 * Calculate counter damage (100% of attacker's damage)
 */
export function calculateCounterDamage(attackerDamage: number): number {
  return Math.floor(attackerDamage * DEFENDER_COUNTER_DAMAGE);
}

// =============================================================================
// FAE RACE MECHANICS
// =============================================================================

/**
 * Check if Fae gets double attack (25% chance with martial arts)
 */
export function rollFaeDoubleAttack(): boolean {
  return Math.random() < FAE_DOUBLE_ATTACK_CHANCE;
}

// =============================================================================
// CYBORG RACE MECHANICS
// =============================================================================

/**
 * Check if Cyborg saves consumable (25% chance)
 */
export function rollCyborgConsumableSave(): boolean {
  return Math.random() < CYBORG_CONSUMABLE_SAVE_CHANCE;
}

// =============================================================================
// COMBAT RESOLUTION
// =============================================================================

/**
 * Process a complete attack and return the result
 */
export function resolveAttack(
  attacker: Character | Enemy,
  target: Character | Enemy,
  baseDamage: number,
  damageType: DamageType,
  options?: {
    isConcentrated?: boolean;
    isBracing?: boolean;
    weapon?: Weapon;
    isConsumable?: boolean;
    isSpellOrTome?: boolean;
    isMartialArt?: boolean;
  }
): AttackResult {
  const attackerStats = 'baseStats' in attacker ? attacker.currentStats : attacker.stats;
  const attackerRace = 'race' in attacker ? attacker.race : null;
  const attackerClass = 'class' in attacker ? attacker.class : null;

  const targetStats = 'baseStats' in target ? target.currentStats : target.stats;
  const targetRace = 'race' in target ? target.race : null;
  const targetClass = 'class' in target ? target.class : null;

  // Initialize result
  const result: AttackResult = {
    attacker: 'name' in attacker ? attacker.name : 'Unknown',
    target: 'name' in target ? target.name : 'Unknown',
    damageType,
    baseDamage,
    varianceMultiplier: 1,
    defenseReduction: 0,
    elementalMultiplier: 1,
    criticalMultiplier: 1,
    isCritical: false,
    finalDamage: baseDamage,
    isDodged: false,
    isNegated: false,
    isReflected: false,
    reflectDamage: 0,
    thornsDamage: 0,
    counterDamage: 0,
  };

  // Check dodge
  const dodgeChance = calculateDodgeChance(targetStats.AGI, targetClass);
  if (rollDodge(dodgeChance)) {
    result.isDodged = true;
    result.finalDamage = 0;
    return result;
  }

  // Defender: Check ranged negate
  if (targetClass === 'Defender' && damageType === 'ranged') {
    if (rollRangedNegate()) {
      result.isNegated = true;
      result.finalDamage = 0;
      return result;
    }
  }

  // Defender: Check spell reflect
  if (targetClass === 'Defender' && damageType === 'spell') {
    if (rollSpellReflect()) {
      result.isReflected = true;
      result.reflectDamage = calculateReflectDamage(baseDamage);
      result.finalDamage = 0;
      return result;
    }
  }

  // Check critical hit
  const critChance = calculateCritChance(
    attackerClass,
    attackerRace,
    options?.weapon,
    { isConcentrated: options?.isConcentrated, isConsumable: options?.isConsumable }
  );
  if (rollCritical(critChance)) {
    result.isCritical = true;
    result.criticalMultiplier = calculateCritMultiplier(
      attackerRace,
      { isSpellOrTome: options?.isSpellOrTome, isConsumable: options?.isConsumable }
    );
  }

  // Calculate final damage
  let finalDamage = baseDamage * result.criticalMultiplier;

  // Defender: Apply Brace
  if (options?.isBracing && targetClass === 'Defender') {
    const braceBlock = rollBraceBlock();
    finalDamage *= (1 - braceBlock);
  }

  result.finalDamage = Math.floor(Math.max(1, finalDamage));

  // Defender: Check thorns (only on melee)
  if (targetClass === 'Defender' && damageType === 'melee') {
    if (rollThorns()) {
      result.thornsDamage = calculateThornsDamage(result.finalDamage);
    }
  }

  // Defender: Check martial arts counter
  if (targetClass === 'Defender' && options?.isMartialArt) {
    if (rollMartialCounter()) {
      result.counterDamage = calculateCounterDamage(baseDamage);
    }
  }

  return result;
}

/**
 * Apply damage to a target (handles HP clamping)
 */
export function applyDamage(
  target: Character | Enemy,
  damage: number
): number {
  const currentHP = 'currentHP' in target ? target.currentHP : 0;
  const newHP = Math.max(0, currentHP - damage);

  if ('currentHP' in target) {
    target.currentHP = newHP;
  }

  return damage;
}

/**
 * Apply healing to a target (handles HP clamping)
 */
export function applyHealing(
  target: Character,
  healing: number
): number {
  const oldHP = target.currentHP;
  target.currentHP = Math.min(target.maxHP, target.currentHP + healing);
  return target.currentHP - oldHP;
}

/**
 * Check if a combatant is alive
 */
export function isAlive(combatant: Character | Enemy): boolean {
  return combatant.currentHP > 0;
}

/**
 * Check if entire party is defeated
 */
export function isPartyDefeated(party: Character[]): boolean {
  return party.every(char => char.currentHP <= 0);
}

/**
 * Check if all enemies are defeated
 */
export function areEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.every(enemy => enemy.currentHP <= 0);
}
