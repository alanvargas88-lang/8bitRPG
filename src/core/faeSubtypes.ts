/**
 * Fae subtype definitions for the 8-bit RPG
 * Slime, Dino, Wolf, Goblin, and later subtypes with their unique martial arts
 */

import type {
  FaeSubtype,
  FaeSubtypeName,
  Stats,
  StatGrowth,
  MartialArt,
} from './types.js';
import { createBaseStats, calculateMaxHP } from './stats.js';

// =============================================================================
// EARLY GAME SUBTYPES (Level 1-5)
// =============================================================================

/**
 * Slime subtype
 * - Level 1: CON 30 (HP 50), others 5
 * - Growth: +2 CON/DEF, +1 STR per level
 * - Martial: Acid (ranged non-elemental, single or multi-target, 20 + AGI damage)
 * - Martial: Dissolve (single target, 30 + STR damage)
 */
export const SlimeSubtype: FaeSubtype = {
  name: 'Slime',
  baseStats: createBaseStats(5, 5, 5, 5, 30),
  baseHP: 50, // Note: This is explicitly stated, overrides normal HP calculation
  growth: {
    STR: 1,
    AGI: 0,
    MAG: 0,
    DEF: 2,
    CON: 2,
  },
  availableAt: { min: 1, max: 5 },
  martialArts: [
    {
      name: 'Acid',
      type: 'ranged',
      targeting: 'multi',
      baseDamage: 20,
      scalingStat: 'AGI',
    },
    {
      name: 'Dissolve',
      type: 'melee',
      targeting: 'single',
      baseDamage: 30,
      scalingStat: 'STR',
    },
  ],
};

/**
 * Dino subtype
 * - Level 1: STR 25 (HP 75), others 8
 * - Growth: +3 STR, +1.5 CON/AGI per level
 * - Martial: Stomp (melee AoE, 25 + STR)
 * - Martial: Tail Whip (ranged single, 20 + AGI)
 */
export const DinoSubtype: FaeSubtype = {
  name: 'Dino',
  baseStats: createBaseStats(25, 8, 8, 8, 8), // HP 75 implies CON that gives ~75 HP
  baseHP: 75,
  growth: {
    STR: 3,
    AGI: 1.5,
    MAG: 0,
    DEF: 0,
    CON: 1.5,
  },
  availableAt: { min: 1, max: 5 },
  martialArts: [
    {
      name: 'Stomp',
      type: 'melee',
      targeting: 'aoe',
      baseDamage: 25,
      scalingStat: 'STR',
    },
    {
      name: 'Tail Whip',
      type: 'ranged',
      targeting: 'single',
      baseDamage: 20,
      scalingStat: 'AGI',
    },
  ],
};

/**
 * Wolf subtype
 * - Level 1: AGI 25 (HP 60), others 7
 * - Growth: +3 AGI, +1.5 STR per level
 * - Martial: Bite (melee single, 25 + STR)
 * - Martial: Scratch (ranged multi, 15 + AGI)
 */
export const WolfSubtype: FaeSubtype = {
  name: 'Wolf',
  baseStats: createBaseStats(7, 25, 7, 7, 7),
  baseHP: 60,
  growth: {
    STR: 1.5,
    AGI: 3,
    MAG: 0,
    DEF: 0,
    CON: 0,
  },
  availableAt: { min: 1, max: 5 },
  martialArts: [
    {
      name: 'Bite',
      type: 'melee',
      targeting: 'single',
      baseDamage: 25,
      scalingStat: 'STR',
    },
    {
      name: 'Scratch',
      type: 'ranged',
      targeting: 'multi',
      baseDamage: 15,
      scalingStat: 'AGI',
    },
  ],
};

/**
 * Goblin subtype
 * - Level 1: STR 20, AGI 15 (HP 105), others 10
 * - Growth: +2 to all per level
 * - Martial: Punch (melee single, 20 + STR)
 * - Martial: Club (melee, 30 + STR)
 */
export const GoblinSubtype: FaeSubtype = {
  name: 'Goblin',
  baseStats: createBaseStats(20, 15, 10, 10, 10),
  baseHP: 105,
  growth: {
    STR: 2,
    AGI: 2,
    MAG: 2,
    DEF: 2,
    CON: 2,
  },
  availableAt: { min: 1, max: 5 },
  martialArts: [
    {
      name: 'Punch',
      type: 'melee',
      targeting: 'single',
      baseDamage: 20,
      scalingStat: 'STR',
    },
    {
      name: 'Club',
      type: 'melee',
      targeting: 'single',
      baseDamage: 30,
      scalingStat: 'STR',
    },
  ],
};

// =============================================================================
// LATER GAME SUBTYPES (Unlocked per world)
// =============================================================================

/**
 * Scorpion subtype (example later subtype)
 * - Poison sting abilities
 */
export const ScorpionSubtype: FaeSubtype = {
  name: 'Scorpion',
  baseStats: createBaseStats(15, 20, 5, 15, 10),
  baseHP: 80,
  growth: {
    STR: 1.5,
    AGI: 2.5,
    MAG: 0.5,
    DEF: 2,
    CON: 1,
  },
  availableAt: null, // Unlocked via world progression
  martialArts: [
    {
      name: 'Poison Sting',
      type: 'melee',
      targeting: 'single',
      baseDamage: 20,
      scalingStat: 'AGI',
      element: 'dark', // Poison damage treated as dark element
    },
    {
      name: 'Pincer Crush',
      type: 'melee',
      targeting: 'single',
      baseDamage: 35,
      scalingStat: 'STR',
    },
  ],
};

/**
 * Beetle subtype (example later subtype)
 * - Shell bash abilities
 */
export const BeetleSubtype: FaeSubtype = {
  name: 'Beetle',
  baseStats: createBaseStats(18, 8, 5, 25, 15),
  baseHP: 120,
  growth: {
    STR: 2,
    AGI: 0.5,
    MAG: 0,
    DEF: 3,
    CON: 2,
  },
  availableAt: null, // Unlocked via world progression
  martialArts: [
    {
      name: 'Shell Bash',
      type: 'melee',
      targeting: 'single',
      baseDamage: 25,
      scalingStat: 'DEF', // Unique: scales with defense
    },
    {
      name: 'Horn Strike',
      type: 'melee',
      targeting: 'single',
      baseDamage: 30,
      scalingStat: 'STR',
    },
  ],
};

// =============================================================================
// SUBTYPE LOOKUP
// =============================================================================

/** All subtypes indexed by name */
export const FAE_SUBTYPES: Record<FaeSubtypeName, FaeSubtype> = {
  Slime: SlimeSubtype,
  Dino: DinoSubtype,
  Wolf: WolfSubtype,
  Goblin: GoblinSubtype,
  Scorpion: ScorpionSubtype,
  Beetle: BeetleSubtype,
};

/**
 * Get a Fae subtype by name
 */
export function getFaeSubtype(name: FaeSubtypeName): FaeSubtype {
  return FAE_SUBTYPES[name];
}

// =============================================================================
// SUBTYPE UTILITY FUNCTIONS
// =============================================================================

/**
 * Get subtypes available at a given level range
 * Used for determining what forms are available at game start
 */
export function getAvailableSubtypes(level: number): FaeSubtypeName[] {
  return Object.entries(FAE_SUBTYPES)
    .filter(([_, subtype]) => {
      if (!subtype.availableAt) return false;
      return level >= subtype.availableAt.min && level <= subtype.availableAt.max;
    })
    .map(([name]) => name as FaeSubtypeName);
}

/**
 * Get all early-game subtypes (level 1-5)
 */
export function getEarlySubtypes(): FaeSubtypeName[] {
  return ['Slime', 'Dino', 'Wolf', 'Goblin'];
}

/**
 * Get martial arts for a subtype
 */
export function getSubtypeMartialArts(subtypeName: FaeSubtypeName): MartialArt[] {
  return [...FAE_SUBTYPES[subtypeName].martialArts];
}

/**
 * Get base stats for a subtype
 */
export function getSubtypeBaseStats(subtypeName: FaeSubtypeName): Stats {
  return { ...FAE_SUBTYPES[subtypeName].baseStats };
}

/**
 * Get stat growth for a subtype
 */
export function getSubtypeGrowth(subtypeName: FaeSubtypeName): StatGrowth {
  return { ...FAE_SUBTYPES[subtypeName].growth };
}

/**
 * Get the explicit base HP for a subtype
 * Note: Fae subtypes have explicit base HP values that may differ from
 * the standard HP formula
 */
export function getSubtypeBaseHP(subtypeName: FaeSubtypeName): number {
  return FAE_SUBTYPES[subtypeName].baseHP;
}

// =============================================================================
// TRANSFORMATION FUNCTIONS
// =============================================================================

/**
 * Calculate stats when transforming to a new subtype at a given level
 * Stats reset to the new subtype's values for that level
 */
export function calculateTransformStats(
  targetSubtype: FaeSubtypeName,
  level: number
): Stats {
  const subtype = FAE_SUBTYPES[targetSubtype];
  const baseStats = { ...subtype.baseStats };
  const growth = subtype.growth;

  // Apply growth for each level above 1
  const levelsGained = Math.max(0, level - 1);

  return {
    STR: Math.floor(baseStats.STR + growth.STR * levelsGained),
    AGI: Math.floor(baseStats.AGI + growth.AGI * levelsGained),
    MAG: Math.floor(baseStats.MAG + growth.MAG * levelsGained),
    DEF: Math.floor(baseStats.DEF + growth.DEF * levelsGained),
    CON: Math.floor(baseStats.CON + growth.CON * levelsGained),
  };
}

/**
 * Calculate HP when transforming to a new subtype at a given level
 * Uses the subtype's explicit base HP and grows based on CON growth
 */
export function calculateTransformHP(
  targetSubtype: FaeSubtypeName,
  level: number
): number {
  const stats = calculateTransformStats(targetSubtype, level);
  // Use standard HP formula based on transformed CON
  return calculateMaxHP(stats.CON);
}

/**
 * Transform a Fae to a new subtype (returns new stats and martial arts)
 * Called when a Fae eats meat
 */
export function transformFae(
  currentLevel: number,
  targetSubtype: FaeSubtypeName
): {
  newStats: Stats;
  newMaxHP: number;
  newMartialArts: MartialArt[];
} {
  return {
    newStats: calculateTransformStats(targetSubtype, currentLevel),
    newMaxHP: calculateTransformHP(targetSubtype, currentLevel),
    newMartialArts: getSubtypeMartialArts(targetSubtype),
  };
}

// =============================================================================
// SUBTYPE DESCRIPTIONS
// =============================================================================

/** Human-readable subtype descriptions */
export const SUBTYPE_DESCRIPTIONS: Record<FaeSubtypeName, string> = {
  Slime: 'A gelatinous creature with high constitution and acid-based attacks',
  Dino: 'A mighty dinosaur with tremendous strength and devastating stomps',
  Wolf: 'A swift predator with high agility and pack-hunting abilities',
  Goblin: 'A balanced trickster with decent stats all around',
  Scorpion: 'A venomous arthropod with poison stings and crushing pincers',
  Beetle: 'An armored insect with exceptional defense and powerful charges',
};

/**
 * Get description for a subtype
 */
export function getSubtypeDescription(subtypeName: FaeSubtypeName): string {
  return SUBTYPE_DESCRIPTIONS[subtypeName];
}

/**
 * Get martial art descriptions for a subtype
 */
export function getSubtypeMartialArtDescriptions(
  subtypeName: FaeSubtypeName
): string[] {
  const martialArts = FAE_SUBTYPES[subtypeName].martialArts;

  return martialArts.map(art => {
    const targetDesc =
      art.targeting === 'single'
        ? 'single target'
        : art.targeting === 'multi'
          ? 'multiple targets'
          : 'all enemies';

    const elementDesc = art.element ? ` (${art.element})` : '';

    return `${art.name}: ${art.type} ${targetDesc}, ${art.baseDamage} + ${art.scalingStat} damage${elementDesc}`;
  });
}
