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
  health: number,
  maxHealth: number,
  stamina: number,
  maxStamina: number,
  attack: number,
  defense: number,
  mirror: Mirror
}
export type Enemy = {
  name: string,
  health: number,
  maxHealth: number,
  attack: number,
  defense: number,
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
  Boon,
  Curse
}
export type Event = {
  type: EventType,
  dialog: string,
  choices: EventChoice | null,
  outcome: (() => void) | null
}

export type Room = {
  seen: boolean,
  peeked: boolean,
  enemies: Enemy[],
  loot: Loot[],
  events: Event[]
}
type Level = {
  tileMap: Int8Array,
  playerPosition: v2,
  rooms: Room[],
}
export const nullLevel: Level = {
  tileMap: new Int8Array(),
  playerPosition: [0, 0],
  rooms: []
};

type GameState = {
  player: Player,
  currencies: Currencies,
  inventory: Item[],
  currentLevel: Level,
  currentEvent: Event | null,
  flags: { [index: string]: boolean }
}
export const gameState: GameState = {
  player: {
    level: 1,
    health: 10,
    maxHealth: 10,
    stamina: 10,
    maxStamina: 10,
    attack: 1,
    defense: 1,
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
  flags: {
    "clear_input": false,
    "tutorial_01": false
  }
}