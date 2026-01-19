/**
 * Stat calculation formulas for the 8-bit RPG
 * HP max, MP max, and stat calculations
 */

import {
  MAX_STAT,
  MAX_HP,
  MAX_MP,
  BASE_HP,
  HP_PER_CON,
  BASE_MP,
  MP_PER_MAG,
  CYBORG_MAX_MP,
  DEFENDER_AGI_REDUCTION,
} from './constants.js';
import type {
  Stats,
  StatName,
  Character,
  Equipment,
  RaceName,
  ClassName,
  ElementalResistances,
  Element,
} from './types.js';
import { ELEMENTS } from './constants.js';

// =============================================================================
// CORE STAT CALCULATIONS
// =============================================================================

/**
 * Calculate maximum HP based on Constitution
 * Formula: HP max = 100 + (CON * 50), capped at 9999
 */
export function calculateMaxHP(con: number): number {
  const hp = BASE_HP + con * HP_PER_CON;
  return Math.min(hp, MAX_HP);
}

/**
 * Calculate maximum MP based on Magic
 * Formula: MP max = 100 + (MAG * 50), capped at 9999
 * Cyborgs are capped at 50 MP (effective MAG max 50)
 */
export function calculateMaxMP(mag: number, race: RaceName): number {
  if (race === 'Cyborg') {
    // Cyborg MP is capped at 50
    const effectiveMag = Math.min(mag, CYBORG_MAX_MP);
    const mp = BASE_MP + effectiveMag * MP_PER_MAG;
    return Math.min(mp, CYBORG_MAX_MP);
  }

  const mp = BASE_MP + mag * MP_PER_MAG;
  return Math.min(mp, MAX_MP);
}

/**
 * Clamp a stat value to valid range (0 to MAX_STAT)
 */
export function clampStat(value: number): number {
  return Math.max(0, Math.min(Math.floor(value), MAX_STAT));
}

/**
 * Clamp HP/MP to valid range
 */
export function clampHP(value: number): number {
  return Math.max(0, Math.min(Math.floor(value), MAX_HP));
}

export function clampMP(value: number, race: RaceName): number {
  const max = race === 'Cyborg' ? CYBORG_MAX_MP : MAX_MP;
  return Math.max(0, Math.min(Math.floor(value), max));
}

// =============================================================================
// EQUIPMENT STAT CALCULATIONS
// =============================================================================

/**
 * Calculate total stat bonuses from equipment
 */
export function calculateEquipmentStats(equipment: Equipment): Partial<Stats> {
  const bonuses: Partial<Stats> = {};

  // Helper to add stat bonuses
  const addBonuses = (statBonuses?: Partial<Stats>) => {
    if (!statBonuses) return;
    for (const [stat, value] of Object.entries(statBonuses)) {
      const statName = stat as StatName;
      bonuses[statName] = (bonuses[statName] || 0) + value;
    }
  };

  // Weapon bonuses
  if (equipment.weapon?.statBonuses) {
    addBonuses(equipment.weapon.statBonuses);
  }
  if (equipment.secondWeapon?.statBonuses) {
    addBonuses(equipment.secondWeapon.statBonuses);
  }

  // Shield bonuses
  if (equipment.shield?.statBonuses) {
    addBonuses(equipment.shield.statBonuses);
  }
  if (equipment.secondShield?.statBonuses) {
    addBonuses(equipment.secondShield.statBonuses);
  }

  // Armor bonuses
  for (const armor of Object.values(equipment.armor)) {
    if (armor?.statBonuses) {
      addBonuses(armor.statBonuses);
    }
  }

  return bonuses;
}

/**
 * Calculate total DEF bonus from equipment
 * Note: Fae ignore DEF from armor
 */
export function calculateEquipmentDEF(equipment: Equipment, race: RaceName): number {
  let totalDEF = 0;

  // Shield DEF
  if (equipment.shield) {
    totalDEF += equipment.shield.defenseBonus;
  }
  if (equipment.secondShield) {
    totalDEF += equipment.secondShield.defenseBonus;
  }

  // Armor DEF (ignored for Fae)
  if (race !== 'Fae') {
    for (const armor of Object.values(equipment.armor)) {
      if (armor) {
        totalDEF += armor.defenseBonus;
      }
    }
  }

  return totalDEF;
}

/**
 * Calculate total elemental resistances from equipment
 */
export function calculateEquipmentResistances(equipment: Equipment): ElementalResistances {
  const resistances = createEmptyResistances();

  // Helper to add resistances
  const addResistances = (itemResists?: Partial<ElementalResistances>) => {
    if (!itemResists) return;
    for (const [element, value] of Object.entries(itemResists)) {
      resistances[element as Element] += value;
    }
  };

  // Shield resistances
  if (equipment.shield?.resistances) {
    addResistances(equipment.shield.resistances);
  }
  if (equipment.secondShield?.resistances) {
    addResistances(equipment.secondShield.resistances);
  }

  // Armor resistances
  for (const armor of Object.values(equipment.armor)) {
    if (armor?.resistances) {
      addResistances(armor.resistances);
    }
  }

  return resistances;
}

// =============================================================================
// COMBINED STAT CALCULATIONS
// =============================================================================

/**
 * Calculate final stats for a character including equipment and class modifiers
 */
export function calculateFinalStats(character: Character): Stats {
  const { baseStats, equipment, race, class: charClass } = character;

  // Start with base stats
  const finalStats: Stats = { ...baseStats };

  // Add equipment stat bonuses
  const equipBonuses = calculateEquipmentStats(equipment);
  for (const [stat, value] of Object.entries(equipBonuses)) {
    finalStats[stat as StatName] += value || 0;
  }

  // Add equipment DEF
  finalStats.DEF += calculateEquipmentDEF(equipment, race);

  // Apply Defender AGI reduction
  if (charClass === 'Defender') {
    finalStats.AGI = Math.floor(finalStats.AGI * (1 - DEFENDER_AGI_REDUCTION));
  }

  // Clamp all stats
  for (const stat of Object.keys(finalStats) as StatName[]) {
    finalStats[stat] = clampStat(finalStats[stat]);
  }

  return finalStats;
}

/**
 * Recalculate max HP and MP based on current stats
 */
export function recalculateResources(character: Character): { maxHP: number; maxMP: number } {
  const finalStats = calculateFinalStats(character);

  return {
    maxHP: calculateMaxHP(finalStats.CON),
    maxMP: calculateMaxMP(finalStats.MAG, character.race),
  };
}

// =============================================================================
// RESISTANCE CALCULATIONS
// =============================================================================

/**
 * Create an empty resistances object (all 0)
 */
export function createEmptyResistances(): ElementalResistances {
  const resistances = {} as ElementalResistances;
  for (const element of ELEMENTS) {
    resistances[element] = 0;
  }
  return resistances;
}

/**
 * Calculate final resistances including class bonuses (Defender)
 */
export function calculateFinalResistances(
  character: Character
): ElementalResistances {
  // Start with equipment resistances
  const resistances = calculateEquipmentResistances(character.equipment);

  // Defender: +1% resistance to all elements per level
  if (character.class === 'Defender') {
    const defenderBonus = character.level * 0.01;
    for (const element of ELEMENTS) {
      resistances[element] += defenderBonus;
    }
  }

  // Clamp resistances (can't exceed 100% or go below 0% for most elements)
  for (const element of ELEMENTS) {
    resistances[element] = Math.max(0, Math.min(1, resistances[element]));
  }

  return resistances;
}

// =============================================================================
// STAT DISPLAY HELPERS
// =============================================================================

/**
 * Get display string for a stat value (Fae shows "X" for DEF from armor)
 */
export function getStatDisplay(
  character: Character,
  stat: StatName
): string {
  if (character.race === 'Fae' && stat === 'DEF') {
    // For Fae, show base DEF + shield only, armor DEF shows as "X"
    const baseDEF = character.baseStats.DEF;
    const shieldDEF = (character.equipment.shield?.defenseBonus || 0) +
                     (character.equipment.secondShield?.defenseBonus || 0);
    const armorDEF = Object.values(character.equipment.armor)
      .reduce((sum, armor) => sum + (armor?.defenseBonus || 0), 0);

    if (armorDEF > 0) {
      return `${baseDEF + shieldDEF} (${armorDEF}X)`;
    }
    return `${baseDEF + shieldDEF}`;
  }

  return `${calculateFinalStats(character)[stat]}`;
}

/**
 * Create a character's base stats object initialized to a value
 */
export function createBaseStats(
  str: number = 0,
  agi: number = 0,
  mag: number = 0,
  def: number = 0,
  con: number = 0
): Stats {
  return {
    STR: clampStat(str),
    AGI: clampStat(agi),
    MAG: clampStat(mag),
    DEF: clampStat(def),
    CON: clampStat(con),
  };
}

/**
 * Add two stat objects together
 */
export function addStats(a: Stats, b: Partial<Stats>): Stats {
  return {
    STR: clampStat(a.STR + (b.STR || 0)),
    AGI: clampStat(a.AGI + (b.AGI || 0)),
    MAG: clampStat(a.MAG + (b.MAG || 0)),
    DEF: clampStat(a.DEF + (b.DEF || 0)),
    CON: clampStat(a.CON + (b.CON || 0)),
  };
}

/**
 * Multiply stats by growth rates (for leveling)
 */
export function multiplyStatGrowth(growth: Partial<Stats>, levels: number): Partial<Stats> {
  const result: Partial<Stats> = {};
  for (const [stat, rate] of Object.entries(growth)) {
    result[stat as StatName] = Math.floor((rate || 0) * levels);
  }
  return result;
}
