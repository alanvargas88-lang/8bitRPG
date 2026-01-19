/**
 * Leveling and EXP system for the 8-bit RPG
 * EXP tables, level up logic, and stat growth
 */

import {
  MAX_LEVEL,
  EXP_PER_ENEMY_LEVEL,
  EXP_VARIANCE,
  DUNGEON_EXP_MULTIPLIER,
} from './constants.js';
import type {
  Character,
  Enemy,
  LevelUpResult,
  ExpTableEntry,
  Stats,
  StatGrowth,
  RaceName,
  ClassName,
  ArmorSlot,
} from './types.js';
import {
  calculateMaxHP,
  calculateMaxMP,
  clampStat,
  addStats,
} from './stats.js';
import { getClassGrowth } from './classes.js';
import { getRaceGrowth, getCyborgGearSlots } from './races.js';
import { getSubtypeGrowth } from './faeSubtypes.js';
import { randomRange } from './formulas.js';

// =============================================================================
// EXP TABLE GENERATION
// =============================================================================

/**
 * Generate the EXP table for all levels
 * Starts low (lvl 2: 100, lvl 3: 250), doubles early, tapers to lvl 50: 500,000 total
 *
 * The formula creates a curve that:
 * - Starts with small EXP requirements
 * - Roughly doubles in the early game
 * - Gradually tapers to a total of ~500,000 at level 50
 */
export function generateExpTable(): ExpTableEntry[] {
  const table: ExpTableEntry[] = [];

  // Level 1 requires 0 EXP (starting level)
  table.push({
    level: 1,
    totalExp: 0,
    expFromPrevious: 0,
  });

  // Base values for the curve
  // We want: level 2 = 100, level 3 = 250, and total at 50 = ~500,000
  // Using a modified exponential curve
  let totalExp = 0;

  for (let level = 2; level <= MAX_LEVEL; level++) {
    // Custom formula that matches the requirements:
    // Early game: roughly doubles
    // Late game: tapers off
    // Total at 50: ~500,000

    let expRequired: number;

    if (level <= 10) {
      // Early game: exponential growth
      // Level 2: 100, Level 3: 250, etc.
      expRequired = Math.floor(100 * Math.pow(1.5, level - 2) + (level - 2) * 50);
    } else if (level <= 30) {
      // Mid game: slower growth
      expRequired = Math.floor(3000 + (level - 10) * 800 + Math.pow(level - 10, 2) * 50);
    } else {
      // Late game: even slower, approaching cap
      expRequired = Math.floor(25000 + (level - 30) * 2000);
    }

    totalExp += expRequired;

    table.push({
      level,
      totalExp,
      expFromPrevious: expRequired,
    });
  }

  return table;
}

/** Cached EXP table */
let _expTable: ExpTableEntry[] | null = null;

/**
 * Get the EXP table (cached)
 */
export function getExpTable(): ExpTableEntry[] {
  if (!_expTable) {
    _expTable = generateExpTable();
  }
  return _expTable;
}

/**
 * Get EXP required for a specific level
 */
export function getExpForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > MAX_LEVEL) return getExpTable()[MAX_LEVEL - 1].totalExp;

  return getExpTable()[level - 1].totalExp;
}

/**
 * Get EXP needed to reach the next level from current level
 */
export function getExpToNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;

  const table = getExpTable();
  return table[currentLevel].expFromPrevious;
}

/**
 * Calculate what level a character should be at given total EXP
 */
export function calculateLevelFromExp(totalExp: number): number {
  const table = getExpTable();

  for (let i = table.length - 1; i >= 0; i--) {
    if (totalExp >= table[i].totalExp) {
      return table[i].level;
    }
  }

  return 1;
}

// =============================================================================
// EXP REWARDS
// =============================================================================

/**
 * Calculate EXP reward from an enemy
 * Formula: enemy_level * 20 + random(-10% to +10%)
 */
export function calculateEnemyExpReward(
  enemy: Enemy,
  isDungeonBattle: boolean = false
): number {
  const baseExp = enemy.level * EXP_PER_ENEMY_LEVEL;

  // Apply variance (-10% to +10%)
  const variance = randomRange(1 - EXP_VARIANCE, 1 + EXP_VARIANCE);
  let exp = Math.floor(baseExp * variance);

  // Dungeon battles give 2x EXP
  if (isDungeonBattle) {
    exp *= DUNGEON_EXP_MULTIPLIER;
  }

  return Math.max(1, exp);
}

/**
 * Calculate total EXP from a battle
 */
export function calculateBattleExpReward(
  enemies: Enemy[],
  isDungeonBattle: boolean = false
): number {
  return enemies.reduce(
    (total, enemy) => total + calculateEnemyExpReward(enemy, isDungeonBattle),
    0
  );
}

// =============================================================================
// STAT GROWTH CALCULATION
// =============================================================================

/**
 * Get effective stat growth for a character
 * Combines race and class growth, handles special cases
 */
export function getEffectiveGrowth(
  race: RaceName,
  className: ClassName,
  faeSubtype?: string
): StatGrowth {
  // Cyborgs have no level growth (stats from gear)
  if (race === 'Cyborg') {
    return {
      STR: 0,
      AGI: 0,
      MAG: 0,
      DEF: 0,
      CON: 0,
    };
  }

  // Fae use subtype growth
  if (race === 'Fae' && faeSubtype) {
    return getSubtypeGrowth(faeSubtype as any);
  }

  // Normal races: combine race and class growth
  const raceGrowth = getRaceGrowth(race);
  const classGrowth = getClassGrowth(className);

  // For Humans, race growth is 0, so class growth is the total
  // For Espers, they add their race growth to class growth
  if (raceGrowth) {
    return {
      STR: raceGrowth.STR + classGrowth.STR,
      AGI: raceGrowth.AGI + classGrowth.AGI,
      MAG: raceGrowth.MAG + classGrowth.MAG,
      DEF: raceGrowth.DEF + classGrowth.DEF,
      CON: raceGrowth.CON + classGrowth.CON,
    };
  }

  return classGrowth;
}

/**
 * Calculate stat gains for leveling up
 */
export function calculateStatGains(
  growth: StatGrowth,
  levelsGained: number = 1
): Partial<Stats> {
  return {
    STR: Math.floor(growth.STR * levelsGained),
    AGI: Math.floor(growth.AGI * levelsGained),
    MAG: Math.floor(growth.MAG * levelsGained),
    DEF: Math.floor(growth.DEF * levelsGained),
    CON: Math.floor(growth.CON * levelsGained),
  };
}

// =============================================================================
// LEVEL UP LOGIC
// =============================================================================

/**
 * Check if a character can level up
 */
export function canLevelUp(character: Character): boolean {
  if (character.level >= MAX_LEVEL) return false;

  const expNeeded = getExpForLevel(character.level + 1);
  return character.exp >= expNeeded;
}

/**
 * Process a level up for a character
 * Returns the level up result with stat gains
 */
export function processLevelUp(character: Character): LevelUpResult | null {
  if (!canLevelUp(character)) {
    return null;
  }

  const previousLevel = character.level;
  const newLevel = previousLevel + 1;

  // Calculate stat gains
  const growth = getEffectiveGrowth(
    character.race,
    character.class,
    character.faeSubtype
  );
  const statGains = calculateStatGains(growth);

  // Apply stat gains
  character.baseStats = addStats(character.baseStats, statGains);
  character.level = newLevel;

  // Recalculate max HP and MP
  const newMaxHP = calculateMaxHP(character.baseStats.CON);
  const newMaxMP = calculateMaxMP(character.baseStats.MAG, character.race);

  character.maxHP = newMaxHP;
  character.maxMP = newMaxMP;

  // Build result
  const result: LevelUpResult = {
    previousLevel,
    newLevel,
    statGains,
    newMaxHP,
    newMaxMP,
    newAbilities: [],
  };

  // Check for Cyborg gear slot unlocks
  if (character.race === 'Cyborg') {
    const previousSlots = getCyborgGearSlots(previousLevel);
    const newSlots = getCyborgGearSlots(newLevel);

    if (newSlots.length > previousSlots.length) {
      result.newGearSlots = newSlots.filter(
        slot => !previousSlots.includes(slot)
      );
    }
  }

  // Check for new abilities (spell/tome slots for Mages/Healers)
  if (newLevel % 10 === 0) {
    if (character.class === 'Mage' || character.class === 'Healer') {
      result.newAbilities.push('+1 Spell Slot');
      result.newAbilities.push('+1 Tome Slot');
    }
  }

  return result;
}

/**
 * Grant EXP to a character and process any level ups
 * Returns array of level up results (can level multiple times)
 */
export function grantExp(
  character: Character,
  expAmount: number
): LevelUpResult[] {
  const results: LevelUpResult[] = [];

  character.exp += expAmount;

  // Process multiple level ups if needed
  while (canLevelUp(character)) {
    const result = processLevelUp(character);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Grant EXP to entire party from a battle
 * Each party member gains the full EXP amount
 */
export function grantBattleExp(
  party: Character[],
  enemies: Enemy[],
  isDungeonBattle: boolean = false
): Map<string, LevelUpResult[]> {
  const totalExp = calculateBattleExpReward(enemies, isDungeonBattle);
  const results = new Map<string, LevelUpResult[]>();

  for (const character of party) {
    // Only living characters gain EXP
    if (character.currentHP > 0) {
      const levelUps = grantExp(character, totalExp);
      results.set(character.id, levelUps);
    }
  }

  return results;
}

// =============================================================================
// EXP DISPLAY HELPERS
// =============================================================================

/**
 * Get EXP progress to next level as a percentage
 */
export function getExpProgressPercent(character: Character): number {
  if (character.level >= MAX_LEVEL) return 100;

  const currentLevelExp = getExpForLevel(character.level);
  const nextLevelExp = getExpForLevel(character.level + 1);
  const expIntoLevel = character.exp - currentLevelExp;
  const expNeeded = nextLevelExp - currentLevelExp;

  return Math.floor((expIntoLevel / expNeeded) * 100);
}

/**
 * Get remaining EXP needed for next level
 */
export function getExpRemaining(character: Character): number {
  if (character.level >= MAX_LEVEL) return 0;

  const nextLevelExp = getExpForLevel(character.level + 1);
  return nextLevelExp - character.exp;
}

/**
 * Format EXP display string
 */
export function formatExpDisplay(character: Character): string {
  if (character.level >= MAX_LEVEL) {
    return `${character.exp} (MAX)`;
  }

  const currentLevelExp = getExpForLevel(character.level);
  const nextLevelExp = getExpForLevel(character.level + 1);
  const expIntoLevel = character.exp - currentLevelExp;
  const expNeeded = nextLevelExp - currentLevelExp;

  return `${expIntoLevel} / ${expNeeded}`;
}
