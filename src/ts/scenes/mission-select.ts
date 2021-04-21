import { LootType, Room, gameState } from "../gamestate";
import { rand, shuffle } from "../random";

import { assert } from "../debug";

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

export function gameSetup(): void
{
  generateLevel(10);
}

function generateLevel(difficulty: number): void
{
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
            tileMap[index] = base_room[ty * roomWidth + tx];
          }
        }

        if (roomLayout[roomIndex - 10] === 1) 
        {
          const nx = x + north_door[0];
          const ny = y + north_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
        }
        if (roomLayout[roomIndex + 1] === 1)
        {
          const nx = x + east_door[0];
          const ny = y + east_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
          tileMap[index - 110] = 2;

        }
        if (roomLayout[roomIndex + 10] === 1)
        {
          const nx = x + south_door[0];
          const ny = y + south_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 5;
        }
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
      rooms[index] = roomDeck.shift() || createMoneyRoom();
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
        rooms[roomIndex] = roomDeck.shift() || createMoneyRoom();
      }
    }
  }
  rooms[35] = createEmptyRoom();

  gameState.currentLevel = {
    playerPosition: [60 * 16, 31 * 16],
    tileMap: tileMap,
    rooms: rooms
  };

}


function createRoomDeck(numberOfRooms: number, numberOfDeadEnds: number): Room[]
{
  const roomDeck: Room[] = [];
  numberOfDeadEnds -= 1;
  roomDeck.push(createBossRoom());

  const deadEndRooms: Room[] = [];
  const numberOfChoices = Math.max(0, Math.ceil(numberOfDeadEnds * 0.5));
  for (let i = 0; i < numberOfChoices; i++)
  {
    deadEndRooms.push(createChoiceRoom());
  }

  const numberOfBoonsOrCurses = Math.max(0, Math.ceil((numberOfDeadEnds - numberOfChoices) * 0.8));
  for (let i = 0; i < numberOfBoonsOrCurses; i++)
  {
    deadEndRooms.push(createBoonCurseRoom());
  }

  const numberOfDialogs = Math.max(0, numberOfDeadEnds - numberOfChoices - numberOfBoonsOrCurses);
  for (let i = 0; i < numberOfDialogs; i++)
  {
    deadEndRooms.push(createDialogRoom());
  }

  roomDeck.push(...shuffle(deadEndRooms));


  const numberOfRoomsRemaining = numberOfRooms - numberOfChoices - numberOfBoonsOrCurses - numberOfDialogs;
  const numberOfCombat = Math.max(0, Math.ceil(numberOfRoomsRemaining * 0.5));
  const regularRooms: Room[] = [];
  for (let i = 0; i < numberOfCombat; i++)
  {
    regularRooms.push(createCombatRoom());
  }

  const numberOfMoney = Math.max(0, Math.ceil((numberOfRoomsRemaining - numberOfCombat) * 0.6));
  for (let i = 0; i < numberOfMoney; i++)
  {
    regularRooms.push(createBoonCurseRoom());
  }

  const numberOfTreasures = Math.max(0, numberOfRoomsRemaining - numberOfCombat - numberOfMoney);
  for (let i = 0; i < numberOfTreasures; i++)
  {
    regularRooms.push(createTresureRoom());
  }

  roomDeck.push(...shuffle(regularRooms));

  // @ifdef DEBUG
  assert(numberOfRooms <= roomDeck.length, "Level generator did not make enough rooms!");
  // @endif
  return roomDeck;
}

function createEmptyRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [],
    events: []
  }
}

function createBossRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [
      { type: LootType.Sand, amount: 50 }
    ],
    events: []
  }
}

function createDialogRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [],
    events: []
  }
}


function createChoiceRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [],
    events: []
  }
}


function createBoonCurseRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [],
    events: []
  }
}

function createCombatRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [
      {
        name: "goblin",
        health: 10,
        maxHealth: 10,
        attack: 1,
        defense: 1,
        attackSpeed: 105,
        abilities: null
      }
    ],
    loot: [
      { type: LootType.Sand, amount: 10 }
    ],
    events: []
  }
}

function createMoneyRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [
      { type: LootType.Sand, amount: 10 }
    ],
    events: []
  }
}
function createTresureRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    loot: [
      { type: LootType.Sand, amount: 10 }
    ],
    events: []
  }
}

