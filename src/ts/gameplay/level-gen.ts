import { Boss, LootType, Room, fragPerLevel, gameState, moneyPerLevel } from "./gamestate";
import { createBasicDialogEvent, getRandomChoiceEvent, getRandomOutcomeEvent } from "./room-events";
import { rand, shuffle } from "../random";

import { AbilityType } from "./ability";
import { assert } from "../debug";

//#region Level Gen
const base_room =
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ];

const north_door = [5, 0];
const south_door = [5, 8];
const west_door = [0, 4];
const east_door = [10, 4];

const roomMapWidth = 9;
const roomMapHeight = 8;
const roomWidth = 11;
const roomHeight = 9;
const tileMapWidth = 110;
const tileMapHeight = 72;

let realm: Boss = Boss.Greed;
let difficulty = 0;
let fragmentDeck: LootType[] = [];

const realmToAbility = {
  [Boss.Envy]: AbilityType.Copy,
  [Boss.Greed]: AbilityType.Steal,
  [Boss.Lust]: AbilityType.Pacify,
  [Boss.Gluttony]: AbilityType.Heal,
  [Boss.Sloth]: AbilityType.Reflect,
  [Boss.Wrath]: AbilityType.DoubleStrike,
  [Boss.Pride]: AbilityType.Disable,
}

let wallDeck: number[] = [];
function getNextWall(): number
{
  if (wallDeck.length === 0)
  {
    wallDeck = shuffle([2, 2, 2, 3, 4]);
  }
  return wallDeck.pop() ?? 2;
}
let floorDeck: number[] = [];
function getNextFloor(): number
{
  if (floorDeck.length === 0)
  {
    floorDeck = shuffle([5, 5, 5, 5, 5, 5, 5, 6, 6, 7, 8]);
  }
  return floorDeck.pop() ?? 5;
}
export function setDifficulty(d: number)
{
  difficulty = d;
}
export function generateLevel(): void
{
  if (difficulty <= 7)
  {
    realm = difficulty as Boss;
  }
  else
  {
    if (gameState.realmDeck.length === 0)
    {
      gameState.realmDeck = shuffle([1, 2, 3, 4, 5, 6, 7] as Boss[]);
    }
    realm = gameState.realmDeck.pop() ?? Boss.Greed;
  }

  // Generate Room Layout
  const numberOfRooms = Math.floor(rand(0, 2) + 5 + difficulty * 2.6);
  const roomLayout: number[] = [];
  const deadEnds: number[] = [];

  const neighbourIsValid: (neighbour: number) => boolean = (neighbour: number) =>
  {
    if (neighbour <= 0 || neighbour > 79 || neighbour % 10 === 0) return false;
    if (roomLayout[neighbour] && roomLayout[neighbour] > 0) return false;
    if (roomCount >= numberOfRooms) return false;

    let numberOfNeighbours = 0;
    for (const nDir of [-1, -10, 1, 10])
    {
      const neighbourNeighbour = neighbour + nDir;
      if (roomLayout[neighbourNeighbour] && roomLayout[neighbourNeighbour] > 0)
      {
        numberOfNeighbours++;
        if (numberOfNeighbours > 1) break;
      }
    }
    if (numberOfNeighbours > 1) return false;
    return true;
  };

  let roomCount = 0;
  while (roomCount < numberOfRooms)
  {
    roomCount = 0;
    roomLayout.length = 0
    deadEnds.length = 0
    const roomQueue: number[] = [];
    roomLayout[35] = 1;
    roomQueue.push(35);
    do
    {
      let room = roomQueue.shift();
      if (room)
      {
        let roomAdded = false;
        const dirs = shuffle([10, -1, 1, -10]);
        for (const dir of dirs)
        {
          const neighbour = room + dir;
          if (!neighbourIsValid(neighbour)) continue;
          if (rand(0, 100) < 50) continue;

          roomLayout[neighbour] = 1;
          roomQueue.push(neighbour);
          roomAdded = true;
          roomCount++;
        }
        if (!roomAdded)
        {
          deadEnds.push(room);
        }
      }
    } while (roomQueue.length > 0);
  }

  // Generate Tile Map for Room Layout
  const tileMap: Int8Array = new Int8Array(tileMapWidth * tileMapHeight);
  for (let ry = 0; ry < roomMapHeight; ry++)
  {
    for (let rx = 1; rx <= roomMapWidth; rx++)
    {
      const roomIndex = ry * 10 + rx;
      if (roomLayout[roomIndex] === 1)
      {
        const x = rx * roomWidth;
        const y = ry * roomHeight;
        for (let ty = 0; ty < roomHeight; ty++)
        {
          for (let tx = 0; tx < roomWidth; tx++)
          {
            const index = ((y + ty) * tileMapWidth) + (x + tx);
            if (base_room[ty * roomWidth + tx] === 2)
            {
              tileMap[index] = getNextWall();
            }
            else if (base_room[ty * roomWidth + tx] === 5)
            {
              tileMap[index] = getNextFloor();
            }
            else
            {
              tileMap[index] = base_room[ty * roomWidth + tx];
            }
          }
        }

        // check for door to north
        if (roomLayout[roomIndex - 10] === 1) 
        {
          const nx = x + north_door[0];
          const ny = y + north_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
        }

        // check for door to east
        if (roomLayout[roomIndex + 1] === 1)
        {
          const nx = x + east_door[0];
          const ny = y + east_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
          tileMap[index - 110] = 2;
        }

        // check for door to south
        if (roomLayout[roomIndex + 10] === 1)
        {
          const nx = x + south_door[0];
          const ny = y + south_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
        }

        // check for door to west
        if (roomLayout[roomIndex - 1] === 1)
        {
          const nx = x + west_door[0];
          const ny = y + west_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
          tileMap[index - 110] = 2;
        }
      }
    }
  }

  // Generate Room Locations
  const rooms: Room[] = [];
  const roomDeck: Room[] = createRoomDeck(numberOfRooms, deadEnds.length);
  const shuffledDeadEnds = shuffle(deadEnds);
  for (let index of shuffledDeadEnds)
  {
    if (roomLayout[index] === 1)
    {
      roomLayout[index] = 2;
      rooms[index] = roomDeck.shift() || createMoneyRoom(numberOfRooms);
    }
  }

  for (let ry = 0; ry < roomMapHeight; ry++)
  {
    for (let rx = 1; rx <= roomMapWidth; rx++)
    {
      const roomIndex = ry * 10 + rx;
      if (roomLayout[roomIndex] === 1 && roomIndex != 35)
      {
        roomLayout[roomIndex] = 2;
        rooms[roomIndex] = roomDeck.shift() || createMoneyRoom(numberOfRooms);
      }
    }
  }
  rooms[35] = createEmptyRoom();
  rooms[35].seen = true;

  gameState.currentLevel = {
    difficulty: difficulty,
    realm,
    playerPosition: [60 * 16, 31 * 16],
    tileMap: tileMap,
    rooms: rooms,
    currencies: {
      sand: 0,
      glassFragments: 0,
      brassFragments: 0,
      steelFragments: 0,
      silverFragments: 0,
      goldFragments: 0,
    }
  };
}

function createRoomDeck(numberOfRooms: number, numberOfDeadEnds: number): Room[]
{
  const roomDeck: Room[] = [];
  numberOfDeadEnds -= 1;
  roomDeck.push(createBossRoom(numberOfRooms));

  const deadEndRooms: Room[] = [];
  const numberOfChoices = Math.max(0, Math.ceil(numberOfDeadEnds * 0.5));
  for (let i = 0; i < numberOfChoices; i++)
  {
    deadEndRooms.push(createChoiceRoom(numberOfRooms));
  }

  const numberOfBoonsOrCurses = Math.max(0, Math.ceil((numberOfDeadEnds - numberOfChoices) * 0.8));
  for (let i = 0; i < numberOfBoonsOrCurses; i++)
  {
    deadEndRooms.push(createBoonCurseRoom(numberOfRooms));
  }

  const numberOfDialogs = Math.max(0, numberOfDeadEnds - numberOfChoices - numberOfBoonsOrCurses);
  for (let i = 0; i < numberOfDialogs; i++)
  {
    deadEndRooms.push(createEmptyRoom());
  }

  roomDeck.push(...shuffle(deadEndRooms));

  const numberOfRoomsRemaining = numberOfRooms - numberOfChoices - numberOfBoonsOrCurses - numberOfDialogs;
  const numberOfCombat = Math.max(0, Math.ceil(numberOfRoomsRemaining * 0.5));
  const regularRooms: Room[] = [];
  for (let i = 0; i < numberOfCombat; i++)
  {
    regularRooms.push(createCombatRoom(numberOfRoomsRemaining));
  }

  const numberOfMoney = Math.max(0, Math.ceil((numberOfRoomsRemaining - numberOfCombat) * 0.6));
  for (let i = 0; i < numberOfMoney; i++)
  {
    regularRooms.push(createMoneyRoom(numberOfRoomsRemaining));
  }

  const numberOfTreasures = Math.max(0, numberOfRoomsRemaining - numberOfCombat - numberOfMoney);
  for (let i = 0; i < numberOfTreasures; i++)
  {
    regularRooms.push(createTresureRoom(numberOfRoomsRemaining));
  }

  roomDeck.push(...shuffle(regularRooms));

  // @ifdef DEBUG
  assert(numberOfRooms <= roomDeck.length, "Level generator did not make enough rooms!");
  // @endif
  return roomDeck;
}

function getNextFragment(): LootType
{
  if (fragmentDeck.length === 0)
  {
    fragmentDeck = shuffle([LootType.Glass, LootType.Glass, LootType.Glass, LootType.Glass, LootType.Brass, LootType.Steel, LootType.Gold, LootType.Silver]);
  }

  return fragmentDeck.pop() ?? LootType.Glass;
}

function createEmptyRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [],
    events: []
  }
}

function createBossRoom(numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.3));
  const frag = Math.ceil((fragPerLevel[difficulty] * 0.3));

  const hp = rand(5 + difficulty, 10 + difficulty);
  const atk = rand(1, difficulty);
  const def = rand(1, difficulty);
  const spd = rand(5, 5 * difficulty);

  const abl: [AbilityType, number][] = [];
  if (difficulty <= 3)
  {
    abl.push([realmToAbility[realm], 1]);
  }
  else if (difficulty <= 5)
  {
    abl.push([realmToAbility[realm], 2]);
  }
  else if (difficulty <= 7)
  {
    abl.push([realmToAbility[realm], 3]);
  }
  else
  {
    abl.push([realmToAbility[realm], 4]);
  }

  return {
    seen: false,
    peeked: false,
    enemy: {
      alive: true,
      health: hp,
      maxHealth: hp,
      attack: atk,
      defense: def,
      attackSpeed: 100 + spd,
      abilities: abl
    },
    exit: true,
    loot: [
      { type: LootType.Sand, amount: money },
      { type: getNextFragment(), amount: frag }
    ],
    events: []
  }
}

function createDialogRoom(numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [],
    events: [
      createBasicDialogEvent("Wow something will happen here!")
    ]
  }
}

function createChoiceRoom(numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [],
    events: [
      getRandomChoiceEvent()
    ]
  }
}

function createBoonCurseRoom(numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [],
    events: [
      getRandomOutcomeEvent()
    ]
  }
}

function createCombatRoom(numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  const frag = Math.ceil((fragPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));

  const hp = rand(3 + difficulty, 6 + difficulty);
  const atk = rand(1, Math.max(1, difficulty - 1));
  const def = rand(0, difficulty);
  const spd = rand(0, 2 * difficulty);

  const abl: [AbilityType, number][] = [];
  if (difficulty >= 9)
  {
    abl.push([realmToAbility[realm], 3]);

  }
  else if (difficulty >= 7)
  {
    abl.push([realmToAbility[realm], 2]);

  }
  else if (difficulty >= 5)
  {
    abl.push([realmToAbility[realm], 1]);

  }
  else if (difficulty >= 3 && rand(0, 100) > 50)
  {
    abl.push([realmToAbility[realm], 1]);
  }

  return {
    seen: false,
    peeked: false,
    enemy:
    {
      alive: true,
      health: hp,
      maxHealth: hp,
      attack: atk,
      defense: def,
      attackSpeed: 100 + spd,
      abilities: abl
    },
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money },
      { type: getNextFragment(), amount: frag }
    ],
    events: []
  }
}

function createMoneyRoom(numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  const frag = Math.ceil((fragPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money },
      { type: getNextFragment(), amount: frag }
    ],
    events: []
  }
}

function createTresureRoom(numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  const frag = Math.ceil((fragPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  return {
    seen: false,
    peeked: false,
    enemy: null,
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money },
      { type: getNextFragment(), amount: frag }
    ],
    events: []
  }
}
//#endregion Level Gen