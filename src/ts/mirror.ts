export enum FrameMaterial
{
  Coil,
  Brass,
  Steel,
  Silver,
  Gold,
};
export enum FrameQuality
{
  Tarnished,
  Polished,
  Pristine,
  Ornate
};
export enum MirrorQuality
{
  Shattered,
  Cracked,
  Imperfect,
  Flawless,
};
export type Mirror = {
  owned: boolean,
  material: FrameMaterial,
  frameQuality: FrameQuality
  quality: MirrorQuality
}

export enum StatRating
{
  E = 1,
  D,
  C,
  B,
  A,
  S
}

export type MirrorStats = {
  health: StatRating,
  sanity: StatRating,
  attack: StatRating,
  defense: StatRating,
  attackSpeed: StatRating
}

const frameQualNames: { [key in FrameQuality]: string } =
{
  [FrameQuality.Tarnished]: "Tarnished",
  [FrameQuality.Polished]: "Polished",
  [FrameQuality.Pristine]: "Pristine",
  [FrameQuality.Ornate]: "Ornate"
};

const mirrorQualNames: { [key in MirrorQuality]: string } =
{
  [MirrorQuality.Shattered]: "Shattered",
  [MirrorQuality.Cracked]: "Cracked",
  [MirrorQuality.Imperfect]: "Imperfect",
  [MirrorQuality.Flawless]: "Flawless"
};

export const frameMatNames: { [key in FrameMaterial]: string } =
{
  [FrameMaterial.Coil]: "Coiled Gold Leaf",
  [FrameMaterial.Brass]: "Brass",
  [FrameMaterial.Steel]: "Steel",
  [FrameMaterial.Silver]: "Silver",
  [FrameMaterial.Gold]: "Gold"
};

export const frameMatSprite: { [key in FrameMaterial]: string } =
{
  [FrameMaterial.Coil]: "coil_mirror",
  [FrameMaterial.Brass]: "brass_mirror",
  [FrameMaterial.Steel]: "steel_mirror",
  [FrameMaterial.Silver]: "silver_mirror",
  [FrameMaterial.Gold]: "gold_mirror"
};

export function getMirrorName(mirror: Mirror): string
{
  if (mirror.material === FrameMaterial.Coil)
  {
    return `${ frameMatNames[mirror.material] } Mirror`;
  }
  return `${ frameQualNames[mirror.frameQuality] } ${ mirrorQualNames[mirror.quality] } ${ frameMatNames[mirror.material] } Mirror`;
}

export const MirrorStatRatings: { [key in FrameMaterial]: MirrorStats } =
{
  [FrameMaterial.Coil]: {
    health: StatRating.E,
    sanity: StatRating.C,
    attack: StatRating.E,
    defense: StatRating.E,
    attackSpeed: StatRating.D
  },
  [FrameMaterial.Brass]: {
    health: StatRating.D,
    sanity: StatRating.D,
    attack: StatRating.D,
    defense: StatRating.D,
    attackSpeed: StatRating.E
  },
  [FrameMaterial.Steel]: {
    health: StatRating.C,
    sanity: StatRating.E,
    attack: StatRating.E,
    defense: StatRating.C,
    attackSpeed: StatRating.E
  },
  [FrameMaterial.Silver]: {
    health: StatRating.E,
    sanity: StatRating.E,
    attack: StatRating.C,
    defense: StatRating.E,
    attackSpeed: StatRating.C
  },
  [FrameMaterial.Gold]: {
    health: StatRating.E,
    sanity: StatRating.C,
    attack: StatRating.E,
    defense: StatRating.E,
    attackSpeed: StatRating.D
  }
}

const RatingToString: { [index: number]: string } = {
  0: "F",
  1: "E",
  2: "D",
  3: "C",
  4: "B",
  5: "A",
  6: "S",
  7: "S+",
}

export function getSummaryText(mirror: Mirror): string
{
  let text = "";
  if (mirror.material === FrameMaterial.Coil || mirror.material === FrameMaterial.Gold)
  {
    text = "Focused on looting and exploring."
  } else if (mirror.material === FrameMaterial.Brass)
  {
    text = "Overall balanced stats."
  } else if (mirror.material === FrameMaterial.Silver)
  {
    text = "Focused on aggressively attacking."
  } else if (mirror.material === FrameMaterial.Steel)
  {
    text = "Focused on defense and surviving."
  }
  return text;
}

export function getSpecialText(mirror: Mirror): string
{
  let speical = "";
  if (mirror.material === FrameMaterial.Coil || mirror.material === FrameMaterial.Gold)
  {
    speical = "Recieve more loot."
  } else if (mirror.material === FrameMaterial.Brass)
  {
    speical = "Recieve more expierence from combat."
  } else if (mirror.material === FrameMaterial.Silver)
  {
    speical = "Periodically attack an extra time."
  } else if (mirror.material === FrameMaterial.Steel)
  {
    speical = "Attacking enemies recieve damage."
  }
  return speical;
}

export function getDescription(mirror: Mirror): string[]
{
  const statRating = MirrorStatRatings[mirror.material];

  const speical = getSpecialText(mirror);

  return [
    getMirrorName(mirror),
    `health:  ${ RatingToString[statRating.health + (mirror.quality)] }   sanity:  ${ RatingToString[statRating.sanity + (mirror.quality)] }`,
    `attack:  ${ RatingToString[statRating.attack + (mirror.quality)] }   defense: ${ RatingToString[statRating.defense + (mirror.quality)] }`,
    `attack speed:  ${ RatingToString[statRating.attackSpeed + (mirror.quality)] }`,
    speical
  ];
}

export type RawStats = {
  health: number,
  sanity: number,
  attack: number,
  defense: number,
  attackSpeed: number,
}

export function getBaseStatsForMirror(mirror: Mirror): RawStats
{
  const statRating = MirrorStatRatings[mirror.material];
  return {
    health: (statRating.health + (mirror.quality)) * 10,
    sanity: (statRating.sanity + (mirror.quality)) * 5,
    attack: (statRating.attack + (mirror.quality)),
    defense: (statRating.defense + (mirror.quality)),
    attackSpeed: 100 + (statRating.attackSpeed + (mirror.quality)) * 2
  }
}

export function getStatIncreaseForMirror(mirror: Mirror): RawStats
{
  const statRating = MirrorStatRatings[mirror.material];
  return {
    health: (statRating.health + (mirror.quality)),
    sanity: (statRating.sanity + (mirror.quality)),
    attack: (statRating.attack + (mirror.quality)),
    defense: (statRating.defense + (mirror.quality)),
    attackSpeed: (statRating.attackSpeed + (mirror.quality)) * 2
  }
}

export const craftCost: [number, number] = [100, 20]

export function costForNextLevel(quality: number): number[]
{
  if (quality === 0)
  {
    return [300, 50];
  }
  else if (quality === 1)
  {
    return [600, 100];
  }
  else if (quality === 2)
  {
    return [1200, 200];
  }
  return [-1, -1];
}