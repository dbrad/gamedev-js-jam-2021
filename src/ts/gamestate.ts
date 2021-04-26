import { AbilityType, Gem, GemType } from "./ability"
import { Easing, InterpolationData, createInterpolationData, interpolate } from "./interpolate"
import { FrameMaterial, FrameQuality, Mirror, MirrorQuality, getBaseStatsForMirror, getStatIncreaseForMirror } from "./mirror"
import { gl_getClear, gl_setClear } from "./gl"
import { levelUp, zzfxP } from "./zzfx"
import { loadObject, saveObject } from "./storage"

import { DialogEvent } from "./room-events"
import { v2 } from "./v2"

export type Currencies = {
  sand: number,
  glassFragments: number,
  brassFragments: number,
  steelFragments: number,
  silverFragments: number,
  goldFragments: number,
}

export const CurrencyKeys: (keyof Currencies)[] = [
  "sand",
  "glassFragments",
  "brassFragments",
  "steelFragments",
  "silverFragments",
  "goldFragments",
];

export enum Boss
{
  Envy = 1,
  Greed,
  Lust,
  Gluttony,
  Sloth,
  Wrath,
  Pride
}

type Player = {
  level: number,
  xp: number,
  xpPool: number,
  health: number,
  maxHealth: number,
  sanity: number,
  maxSanity: number,
  attack: number,
  defense: number,
  attackSpeed: number
}
export type Enemy = {
  alive: boolean,
  health: number,
  maxHealth: number,
  attack: number,
  defense: number,
  attackSpeed: number,
  abilities: [AbilityType, number][]
}

export enum LootType
{
  Sand,
  Glass,
  Brass,
  Steel,
  Silver,
  Gold
}
type Loot = {
  type: LootType,
  amount: number
}

export type Room = {
  seen: boolean,
  peeked: boolean,
  enemy: Enemy | null,
  exit: boolean,
  loot: Loot[],
  events: DialogEvent[]
}
type Level = {
  difficulty: number,
  realm: Boss,
  tileMap: Int8Array,
  playerPosition: v2,
  rooms: Room[],
  currencies: Currencies
}
const nullLevel: Level = {
  difficulty: 0,
  realm: Boss.Greed,
  tileMap: new Int8Array(),
  playerPosition: [0, 0],
  rooms: [],
  currencies: {
    sand: 0,
    glassFragments: 0,
    brassFragments: 0,
    steelFragments: 0,
    silverFragments: 0,
    goldFragments: 0,
  }
};

export const frameMetalFragment: { [key in FrameMaterial]: keyof Currencies } =
{
  [FrameMaterial.Coil]: "goldFragments",
  [FrameMaterial.Brass]: "brassFragments",
  [FrameMaterial.Steel]: "steelFragments",
  [FrameMaterial.Silver]: "silverFragments",
  [FrameMaterial.Gold]: "goldFragments"
};

type GameState = {
  timestamp: Date,
  player: Player,
  equippedMirror: FrameMaterial,
  mirrors: { [key in FrameMaterial]: Mirror },
  currencies: Currencies,
  gems: { [key in GemType]: Gem },
  realmDeck: Boss[],
  currentLevel: Level,
  currentEvent: DialogEvent | null,
  transition: InterpolationData | null,
  flags: { [index: string]: boolean }
}

export let gameState: GameState = {
  timestamp: new Date(),
  player: {
    level: 1,
    xp: 0,
    xpPool: 0,
    health: 20,
    maxHealth: 20,
    sanity: 10,
    maxSanity: 10,
    attack: 2,
    defense: 2,
    attackSpeed: 100,
  },
  equippedMirror: FrameMaterial.Brass,
  mirrors: {
    [FrameMaterial.Coil]: {
      owned: false,
      material: FrameMaterial.Coil,
      frameQuality: FrameQuality.Tarnished,
      quality: MirrorQuality.Shattered
    },
    [FrameMaterial.Brass]: {
      owned: true,
      material: FrameMaterial.Brass,
      frameQuality: FrameQuality.Tarnished,
      quality: MirrorQuality.Shattered
    },
    [FrameMaterial.Steel]: {
      owned: false,
      material: FrameMaterial.Steel,
      frameQuality: FrameQuality.Tarnished,
      quality: MirrorQuality.Shattered
    },
    [FrameMaterial.Silver]: {
      owned: false,
      material: FrameMaterial.Silver,
      frameQuality: FrameQuality.Tarnished,
      quality: MirrorQuality.Shattered
    },
    [FrameMaterial.Gold]: {
      owned: false,
      material: FrameMaterial.Gold,
      frameQuality: FrameQuality.Tarnished,
      quality: MirrorQuality.Shattered
    }
  },
  currencies: {
    sand: 0,
    glassFragments: 0,
    brassFragments: 0,
    steelFragments: 0,
    silverFragments: 0,
    goldFragments: 0,
  },
  gems: {
    [GemType.Emerald]: {
      type: GemType.Emerald,
      colour: 0xFF00FF00,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.BonusXp
    },
    [GemType.Citrine]: {
      type: GemType.Citrine,
      colour: 0xFF00FFFF,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.BonusLoot
    },
    [GemType.Morganite]: {
      type: GemType.Morganite,
      colour: 0xFF0000FF,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.Sacrifice
    },
    [GemType.FireOpal]: {
      type: GemType.FireOpal,
      colour: 0xFF00FF00,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.Heal
    },
    [GemType.Sapphire]: {
      type: GemType.Sapphire,
      colour: 0xFF00FF00,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.Reflect
    },
    [GemType.Ruby]: {
      type: GemType.Ruby,
      colour: 0xFF00FF00,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.DoubleStrike
    },
    [GemType.Alexandrite]: {
      type: GemType.Alexandrite,
      colour: 0xFFFF00FF,
      owned: false,
      level: 1,
      abilitiyType: AbilityType.RevealMap
    }
  },
  realmDeck: [],
  currentLevel: nullLevel,
  currentEvent: null,
  transition: null,
  flags: {
    "clear_input": false,
    "clear_3_star": false,
    "clear_5_star": false,
    "clear_7_star": false,
    "smith_reveal": false,
    "tutorial_intro_01": false,
    "tutorial_intro_02": false,
    "tutorial_smith_01": false,
    "tutorial_smith_02": false,
    "tutorial_smith_03": false,
  }
}

export function resetGameState(): void
{
  gameState = {
    timestamp: new Date(),
    player: {
      level: 1,
      xp: 0,
      xpPool: 0,
      health: 20,
      maxHealth: 20,
      sanity: 10,
      maxSanity: 10,
      attack: 2,
      defense: 2,
      attackSpeed: 100,
    },
    equippedMirror: FrameMaterial.Brass,
    mirrors: {
      [FrameMaterial.Coil]: {
        owned: false,
        material: FrameMaterial.Coil,
        frameQuality: FrameQuality.Tarnished,
        quality: MirrorQuality.Shattered
      },
      [FrameMaterial.Brass]: {
        owned: true,
        material: FrameMaterial.Brass,
        frameQuality: FrameQuality.Tarnished,
        quality: MirrorQuality.Shattered
      },
      [FrameMaterial.Steel]: {
        owned: false,
        material: FrameMaterial.Steel,
        frameQuality: FrameQuality.Tarnished,
        quality: MirrorQuality.Shattered
      },
      [FrameMaterial.Silver]: {
        owned: false,
        material: FrameMaterial.Silver,
        frameQuality: FrameQuality.Tarnished,
        quality: MirrorQuality.Shattered
      },
      [FrameMaterial.Gold]: {
        owned: false,
        material: FrameMaterial.Gold,
        frameQuality: FrameQuality.Tarnished,
        quality: MirrorQuality.Shattered
      }
    },
    currencies: {
      sand: 0,
      glassFragments: 0,
      brassFragments: 0,
      steelFragments: 0,
      silverFragments: 0,
      goldFragments: 0,
    },
    gems: {
      [GemType.Emerald]: {
        type: GemType.Emerald,
        colour: 0xFF00FF00,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.BonusXp
      },
      [GemType.Citrine]: {
        type: GemType.Citrine,
        colour: 0xFF00FFFF,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.BonusLoot
      },
      [GemType.Morganite]: {
        type: GemType.Morganite,
        colour: 0xFF0000FF,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.Sacrifice
      },
      [GemType.FireOpal]: {
        type: GemType.FireOpal,
        colour: 0xFF00FF00,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.Heal
      },
      [GemType.Sapphire]: {
        type: GemType.Sapphire,
        colour: 0xFF00FF00,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.Reflect
      },
      [GemType.Ruby]: {
        type: GemType.Ruby,
        colour: 0xFF00FF00,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.DoubleStrike
      },
      [GemType.Alexandrite]: {
        type: GemType.Alexandrite,
        colour: 0xFFFF00FF,
        owned: false,
        level: 1,
        abilitiyType: AbilityType.RevealMap
      }
    },
    realmDeck: [],
    currentLevel: nullLevel,
    currentEvent: null,
    transition: null,
    flags: {
      "clear_input": false,
      "clear_3_star": false,
      "clear_5_star": false,
      "clear_7_star": false,
      "smith_reveal": false,
      "tutorial_intro_01": false,
      "tutorial_intro_02": false,
      "tutorial_smith_01": false,
      "tutorial_smith_02": false,
      "tutorial_smith_03": false,
    }
  };
};

export let backgroundFade: InterpolationData | null;

export function cancelFade(): void
{
  backgroundFade = null;
  gl_setClear(0, 0, 0);
}
export function stepBackGroundFade(now: number): void
{
  if (backgroundFade)
  {
    const i = interpolate(now, backgroundFade);
    gl_setClear(Math.floor(i.values[0]), Math.floor(i.values[1]), Math.floor(i.values[2]));
    if (i.done)
    {
      backgroundFade = null;
    }
  }
}
export function fadeBackgroundTo(targetColour: [number, number, number], duration: number, callback: () => void): void
{
  if (!backgroundFade)
  {
    const current = gl_getClear();
    backgroundFade = createInterpolationData(duration, current, targetColour, Easing.Linear, callback);
  }
}

export function saveGameState(): void
{
  gameState.timestamp = new Date();
  const save = JSON.parse(JSON.stringify(gameState,
    (key: string, value: any) =>
    {
      if (key == "currentLevel") return undefined;
      else if (key == "currentEvent") return undefined;
      else if (key == "player") return undefined;
      else if (key == "transition") return undefined;
      else return value;
    }));
  saveObject("f1", save);
}

export function loadGameState(): void
{
  const saveFile = loadObject("f1") as GameState;
  gameState.timestamp = saveFile.timestamp;
  gameState.equippedMirror = saveFile.equippedMirror;
  gameState.mirrors = saveFile.mirrors;
  gameState.currencies = saveFile.currencies;
  gameState.gems = saveFile.gems;
  gameState.realmDeck = saveFile.realmDeck;
  gameState.flags = saveFile.flags;
}

/////////////////////////////////////////////////////

export function resetPlayer(): void
{
  const stats = getBaseStatsForMirror(gameState.mirrors[gameState.equippedMirror]);
  gameState.player.xp = 0;
  gameState.player.xpPool = 0;
  gameState.player.level = 1;
  gameState.player.maxHealth = stats.health;
  gameState.player.maxSanity = stats.sanity;
  gameState.player.health = gameState.player.maxHealth;
  gameState.player.sanity = gameState.player.maxSanity;
  gameState.player.attackSpeed = stats.attackSpeed;
  gameState.player.attack = stats.attack;
  gameState.player.defense = stats.defense;
}

export function levelUpPlayer(): void
{
  const player = gameState.player;
  if (player.xp >= nextLevel(player.level))
  {
    zzfxP(levelUp);
    player.xp -= nextLevel(player.level);
    player.level += 1;
    const stats = getStatIncreaseForMirror(gameState.mirrors[gameState.equippedMirror]);
    gameState.player.maxHealth += stats.health;
    gameState.player.health += stats.health;

    gameState.player.maxSanity += stats.sanity;
    gameState.player.sanity += stats.sanity;

    gameState.player.attackSpeed += stats.attackSpeed;
    gameState.player.attack += stats.attack;
    gameState.player.defense += stats.defense;
  }
}

export function nextLevel(level: number): number
{
  return Math.round(0.04 * (level ** 3) + 0.8 * (level ** 2) + 2 * level)
}

/////////////////////////////////////////////////////

export const moneyPerLevel = [
  0,
  15,
  50,
  145,
  330,
  635,
  1090,
  1725,
  2570,
  3500,
  4000,
  5000,
] as const;

export const fragPerLevel = [
  0,
  5,
  15,
  30,
  45,
  65,
  90,
  125,
  162,
  205,
  252,
  305,
] as const;

export const wallColour = [
  0xFFFFFFFF,
  0xFF78c850, // Green - 50c878
  0xFF0ad0e4, // Yellow - e4d00a 
  0xFFeb76ff, // Pink - ff76eb
  0xFF3767ff, // Orange - #ff6737
  0xFFba520f, // Blue - 0f52ba 
  0xFF1e119b, // Red - 9b111e
  0xFF813854, // Violet - 543881
];

export const floorColour = [
  0xFFFFFFFF,
  0xFFEEFFEE, // Green - 50c878
  0xFFEEFFFF, // Yellow - 
  0xFFEEDDFF, // Pink - 
  0xFFAACCFF, // Orange
  0xFFFFEEEE, // Blue
  0xFFEEEEFF, // Red
  0xFFFFEEFF, // Violet
];

export const enemyColour = [
  0xFFFFFFFF,
  0xFF78c850, // Green - 50c878
  0xFF0ad0e4, // Yellow - e4d00a 
  0xFFeb76ff, // Pink - ff76eb
  0xFF3767ff, // Orange - #ff6737
  0xFFba520f, // Blue - 0f52ba 
  0xFF1e119b, // Red - 9b111e
  0xFF813854, // Violet - 543881
];

/////////////////////////////////////////////////////

export function levelUpGem(): void
{
  let gemType: GemType;
  switch (gameState.currentLevel.realm)
  {
    case Boss.Envy:
      gemType = GemType.Emerald;
      break;
    case Boss.Greed:
      gemType = GemType.Citrine;
      break;
    case Boss.Lust:
      gemType = GemType.Morganite;
      break;
    case Boss.Gluttony:
      gemType = GemType.FireOpal;
      break;
    case Boss.Sloth:
      gemType = GemType.Sapphire;
      break;
    case Boss.Wrath:
      gemType = GemType.Ruby;
      break;
    case Boss.Pride:
      gemType = GemType.Alexandrite;
      break;
  }
  const gem = gameState.gems[gemType];
  if (!gem.owned)
  {
    gem.owned = true;
  }
  else if (gem.level === 1 && gameState.currentLevel.difficulty > 7)
  {
    gem.level = 2;
  }
  else if (gem.level === 2 && gameState.currentLevel.difficulty > 8)
  {
    gem.level = 3;
  }
  else if (gem.level === 3 && gameState.currentLevel.difficulty > 9)
  {
    gem.level = 4;
  }
}