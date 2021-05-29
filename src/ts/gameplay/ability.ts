
export enum AbilityType
{
  BonusXp,
  Copy,
  BonusLoot,
  Steal,
  Sacrifice,
  Pacify,
  Heal,
  Reflect,
  DoubleStrike,
  RevealMap,
  Disable
}

export enum GemType
{
  Emerald,
  Citrine,
  Morganite,
  FireOpal,
  Sapphire,
  Ruby,
  Alexandrite
}
export type Gem = {
  abilitiyType: AbilityType,
  type: GemType,
  colour: number,
  owned: boolean,
  level: number
}

export const AbilityCooldown: { [key in AbilityType]: number[] } = {
  [AbilityType.BonusXp]: [0],
  [AbilityType.Copy]: [5000, 4750, 4250, 4000],
  [AbilityType.BonusLoot]: [0],
  [AbilityType.Steal]: [5000, 4750, 4250, 4000],
  [AbilityType.Sacrifice]: [0],
  [AbilityType.Pacify]: [5000, 4500, 4000, 3500],
  [AbilityType.Heal]: [2500, 2000, 1500, 1000],
  [AbilityType.Reflect]: [0],
  [AbilityType.DoubleStrike]: [3000, 2500, 2000, 1500],
  [AbilityType.RevealMap]: [0],
  [AbilityType.Disable]: [5000, 4750, 4250, 4000],
};

export const AbilityName: { [key in AbilityType]: string } = {
  [AbilityType.BonusXp]: "Bonus XP",
  [AbilityType.Copy]: "Copy",
  [AbilityType.BonusLoot]: "Bonus Loot",
  [AbilityType.Steal]: "Steal",
  [AbilityType.Sacrifice]: "Sacrifice",
  [AbilityType.Pacify]: "Pacify",
  [AbilityType.Heal]: "Heal",
  [AbilityType.Reflect]: "Reflect",
  [AbilityType.DoubleStrike]: "Strike+",
  [AbilityType.RevealMap]: "Reveal Map",
  [AbilityType.Disable]: "Disable",
} as const;

export const AbilityDescription: { [key in AbilityType]: string } = {
  [AbilityType.BonusXp]: "Gain bonus experience from combat.",
  [AbilityType.Copy]: "Copy",
  [AbilityType.BonusLoot]: "Gain bonus loot while exploring.",
  [AbilityType.Steal]: "Steal",
  [AbilityType.Sacrifice]: "Sacrifice health to regain sanity.",
  [AbilityType.Pacify]: "Pacify",
  [AbilityType.Heal]: "Heal periodically during combat.",
  [AbilityType.Reflect]: "Reflect damage back to attacking enemies.",
  [AbilityType.DoubleStrike]: "Periodically strike an extra time during combat",
  [AbilityType.RevealMap]: "Chance to reveal rooms at the start of a level.",
  [AbilityType.Disable]: "Disable",
} as const;

export const GemName: { [key in GemType]: string } = {
  [GemType.Emerald]: "Envy's Emerald",
  [GemType.Citrine]: "Greed's Citrine",
  [GemType.Morganite]: "Lust's Morganite",
  [GemType.FireOpal]: "Gluttony's Fire Opal",
  [GemType.Sapphire]: "Sloth's Sapphire",
  [GemType.Ruby]: "Wrath's Ruby",
  [GemType.Alexandrite]: "Pride's Alexandrite"
} as const;

export const AbilityColour: { [key in AbilityType]: number } = {
  [AbilityType.BonusXp]: 0xFF78c850,
  [AbilityType.Copy]: 0xFF78c850,
  [AbilityType.BonusLoot]: 0xFF0ad0e4,
  [AbilityType.Steal]: 0xFF0ad0e4,
  [AbilityType.Sacrifice]: 0xFFeb76ff,
  [AbilityType.Pacify]: 0xFFeb76ff,
  [AbilityType.Heal]: 0xFF3767ff,
  [AbilityType.Reflect]: 0xFFba520f,
  [AbilityType.DoubleStrike]: 0xFF1e119b,
  [AbilityType.RevealMap]: 0xFF813854,
  [AbilityType.Disable]: 0xFF813854,
} as const;