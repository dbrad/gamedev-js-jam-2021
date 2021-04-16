
type Currencies = {
  sand: number,
  mirrorFragments: number,
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
type GameState = {
  player: Player,
  currencies: Currencies,
  inventory: Item[],
  currentMap: [],
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
    mirrorFragments: 0,
    brassFragments: 0,
    steelFragments: 0,
    silverFragments: 0,
    goldFragments: 0,
  },
  inventory: [],
  currentMap: []
}