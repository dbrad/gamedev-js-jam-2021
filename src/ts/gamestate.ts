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
enum ItemType
{
  Frame,
  Mirror,
  Gem
}
type Item = {
  itemType: ItemType,
}
enum FrameMaterial
{
  Brass,
  Steel,
  Silver,
  Gold
}
enum PolishLevel
{
  Tarnished,
  Polished,
  Pristine,
  Ornate
}
type Frame = Item & {
  material: FrameMaterial,
  polishLevel: PolishLevel
}
enum MirrorQuality
{
  Shattered,
  Cracked,
  Imperfect,
  Flawless,
}
type Mirror = Item & {
  level: number,
  frame: Frame,
  quality: MirrorQuality
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
  attackSpeed: number,
  mirror: Mirror
}
export type Enemy = {
  alive: boolean,
  name: string,
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
  tileMap: Int8Array,
  playerPosition: v2,
  rooms: Room[],
}
const nullLevel: Level = {
  difficulty: 0,
  tileMap: new Int8Array(),
  playerPosition: [0, 0],
  rooms: []
};

type GameState = {
  player: Player,
  currencies: Currencies,
  inventory: Item[],
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
    mirror: {
      itemType: ItemType.Mirror,
      level: 1,
      frame: {
        itemType: ItemType.Frame,
        material: FrameMaterial.Brass,
        polishLevel: PolishLevel.Tarnished
      },
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
  inventory: [],
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
  gameState.player.xp = 0;
  gameState.player.level = 1;
  gameState.player.health = gameState.player.maxHealth;
  gameState.player.sanity = gameState.player.maxSanity;
  gameState.player.attackSpeed = 100;
  gameState.player.attack = 2;
  gameState.player.defense = 2;
}

export function levelUpPlayer(): void
{
  const player = gameState.player;
  while (player.xp >= nextLevel(player.level))
  {
    player.level++;
    // TODO(dbrad): mirror based stat scaling
  }
}

export function nextLevel(level: number): number
{
  return Math.round(0.04 * (level ** 3) + 0.8 * (level ** 2) + 2 * level)
}