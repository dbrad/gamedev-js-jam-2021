import { InterpolationData } from "./interpolate"
import { v2 } from "./v2"

export type Currencies = {
  sand: number,
  glassFragments: number,
  brassFragments: number,
  steelFragments: number,
  silverFragments: number,
  goldFragments: number,
}

export enum Boss
{
  Greed = 1,
  Envy,
  Lust,
  Gluttony,
  Sloth,
  Wrath,
  Pride
}

type Gem = {
  name: string,
  owned: boolean,
  level: number
}

enum FrameMaterial
{
  Coil,
  Brass,
  Steel,
  Silver,
  Gold
};
enum FrameQuality
{
  Tarnished,
  Polished,
  Pristine,
  Ornate
};
enum MirrorQuality
{
  Shattered,
  Cracked,
  Imperfect,
  Flawless,
};
type Mirror = {
  owned: boolean,
  material: FrameMaterial,
  frameQuality: FrameQuality
  quality: MirrorQuality
}

type Stats = {
  health: number,
  sanity: number,
  attack: number,
  defense: number,
  attackSpeed: number
}
type Player = {
  level: number,
  xp: number,
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
  abilities: null
}

export enum LootType
{
  Sand,
  Mirror,
  Brass,
  Steel,
  Silver,
  Gold
}
type Loot = {
  type: LootType,
  amount: number
}

export type EventChoice = {
  label: string,
  outcome: () => void
}
export enum EventType
{
  Dialog,
  Choice,
  Outcome
}
export type DialogEvent = {
  type: EventType,
  dialog: string,
  dialogTime: number,
  choices: EventChoice[],
  outcome: (() => void) | null
}

export type Room = {
  seen: boolean,
  peeked: boolean,
  enemies: Enemy[],
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
}
const nullLevel: Level = {
  difficulty: 0,
  realm: Boss.Greed,
  tileMap: new Int8Array(),
  playerPosition: [0, 0],
  rooms: []
};

type GameState = {
  player: Player,
  equippedMirror: FrameMaterial,
  mirrors: { [key in FrameMaterial]: Mirror },
  currencies: Currencies,
  gems: Gem[],
  realmDeck: Boss[],
  currentLevel: Level,
  currentEvent: DialogEvent | null,
  transition: InterpolationData | null,
  flags: { [index: string]: boolean }
}
export const gameState: GameState = {
  player: {
    level: 1,
    xp: 0,
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
  gems: [],
  realmDeck: [],
  currentLevel: nullLevel,
  currentEvent: null,
  transition: null,
  flags: {
    "clear_3_star": false,
    "clear_5_star": false,
    "clear_7_star": false,
    "clear_8_obs": false,
    "clear_9_obs": false,
    "clear_10_obs": false,
    "clear_input": false,
    "tutorial_01": false,
    "tutorial_02": false,
    "tutorial_03": false,
    "tutorial_04": false,
    "tutorial_05": false,
  }
}

export function resetPlayer(): void
{
  const stats = getBaseStatsForMirror(gameState.mirrors[gameState.equippedMirror]);
  gameState.player.xp = 0;
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
  while (player.xp >= nextLevel(player.level))
  {
    player.level++;
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

function getBaseStatsForMirror(mirror: Mirror): Stats
{
  return {
    health: 20,
    sanity: 10,
    attack: 2,
    defense: 2,
    attackSpeed: 100
  }
}


function getStatIncreaseForMirror(mirror: Mirror): Stats
{
  return {
    health: 2,
    sanity: 1,
    attack: 1,
    defense: 1,
    attackSpeed: 5
  }
}

// TODO(dbrad): Wall tones
export const wallColour = [
  0xFFFFFFFF,
  0xFF00FF00,
  0xFF00FFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
];

// TODO(dbrad): Floor tones
export const floorColour = [
  0xFFFFFFFF,
  0xFF00FF00,
  0xFF00FFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
];

// TODO(dbrad): Enemy tones
export const enemyColour = [
  0xFFFFFFFF,
  0xFF00FF00,
  0xFF00FFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
  0xFFFFFFFF,
];