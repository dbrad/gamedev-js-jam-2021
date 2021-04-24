import { Boss, LootType, Room, gameState, resetPlayer } from "../gamestate";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, moveNode, node_enabled, node_size, node_visible } from "../node";
import { rand, shuffle } from "../random";
import { screenHeight, screenWidth } from "../screen";

import { assert } from "../debug";
import { createBasicDialogEvent } from "./dialog";
import { inputContext } from "../input";
import { resetAdventureScene } from "./adventure";

export let missionSelectRootId = -1;

let select1StarId = -1;
let select2StarId = -1;
let select3StarId = -1;
let select4StarId = -1;
let select5StarId = -1;
let select6StarId = -1;
let select7StarId = -1;
let select8StarId = -1;
let select9StarId = -1;
let select10StarId = -1;

let backButtonId = -1;

export function setupMissionSelect(): void
{
  missionSelectRootId = createNode();
  node_visible[missionSelectRootId] = false;
  node_size[missionSelectRootId][0] = screenWidth;
  node_size[missionSelectRootId][1] = screenHeight;

  select1StarId = createButtonNode("Envy's Lookout", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select1StarId);

  select2StarId = createButtonNode("Greed's Horde", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select2StarId);

  select3StarId = createButtonNode("Lust's Den", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select3StarId);

  select4StarId = createButtonNode("Gluttony's Cellar", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select4StarId);

  select5StarId = createButtonNode("Sloth's Haunt", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select5StarId);

  select6StarId = createButtonNode("Wrath's Lair", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select6StarId);

  select7StarId = createButtonNode("Pride's Hall", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select7StarId);

  select8StarId = createButtonNode("???", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select8StarId);

  select9StarId = createButtonNode("???", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select9StarId);

  select10StarId = createButtonNode("???", [0, 0], [200, 70]);
  addChildNode(missionSelectRootId, select10StarId);

  backButtonId = createButtonNode("back", [0, 0], [70, 46]);
  addChildNode(missionSelectRootId, backButtonId);
}

export function arrangeMissionSelect(): void
{
  if (gameState.flags["clear_7_star"])
  {
    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = true;
    node_enabled[select7StarId] = true;
    node_enabled[select8StarId] = true;
    node_enabled[select9StarId] = true;
    node_enabled[select10StarId] = true;
  }
  else if (gameState.flags["clear_5_star"])
  {
    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = true;
    node_enabled[select7StarId] = true;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
  else if (gameState.flags["clear_3_star"])
  {
    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = false;
    node_enabled[select7StarId] = false;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
  else
  {
    moveNode(select1StarId, [195, 65]);
    node_size[select1StarId] = [250, 70];

    moveNode(select2StarId, [195, 145]);
    node_size[select2StarId] = [250, 70];

    moveNode(select3StarId, [195, 225]);
    node_size[select3StarId] = [250, 70];

    node_enabled[select4StarId] = false;
    node_enabled[select5StarId] = false;
    node_enabled[select6StarId] = false;
    node_enabled[select7StarId] = false;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
}

export function missionSelect(now: number, delta: number): void
{
  let difficulty = 0;
  switch (inputContext.fire)
  {
    case backButtonId:
      setScene(Scenes.Camp);
      return;
    case select1StarId:
      difficulty = 1;
      break;
    case select2StarId:
      difficulty = 2;
      break;
    case select3StarId:
      difficulty = 3;
      break;
    case select4StarId:
      difficulty = 4;
      break;
    case select5StarId:
      difficulty = 5;
      break;
    case select6StarId:
      difficulty = 6;
      break;
    case select7StarId:
      difficulty = 7;
      break;
    case select8StarId:
      difficulty = 8;
      break;
    case select9StarId:
      difficulty = 9;
      break;
    case select10StarId:
      difficulty = 10;
      break;
  }
  if (difficulty > 0)
  {
    generateLevel(difficulty);
    resetAdventureScene();
    resetPlayer();
    setScene(Scenes.Adventure);
  }
}

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

function generateLevel(difficulty: number): void
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
  const roomDeck: Room[] = createRoomDeck(difficulty, numberOfRooms, deadEnds.length);
  const shuffledDeadEnds = shuffle(deadEnds);
  for (let index of shuffledDeadEnds)
  {
    if (roomLayout[index] === 1)
    {
      roomLayout[index] = 2;
      rooms[index] = roomDeck.shift() || createMoneyRoom(difficulty, numberOfRooms);
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
        rooms[roomIndex] = roomDeck.shift() || createMoneyRoom(difficulty, numberOfRooms);
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
    rooms: rooms
  };
}

function createRoomDeck(difficulty: number, numberOfRooms: number, numberOfDeadEnds: number): Room[]
{
  const roomDeck: Room[] = [];
  numberOfDeadEnds -= 1;
  roomDeck.push(createBossRoom(difficulty, numberOfRooms));

  const deadEndRooms: Room[] = [];
  const numberOfChoices = Math.max(0, Math.ceil(numberOfDeadEnds * 0.5));
  for (let i = 0; i < numberOfChoices; i++)
  {
    deadEndRooms.push(createChoiceRoom(difficulty, numberOfRooms));
  }

  const numberOfBoonsOrCurses = Math.max(0, Math.ceil((numberOfDeadEnds - numberOfChoices) * 0.8));
  for (let i = 0; i < numberOfBoonsOrCurses; i++)
  {
    deadEndRooms.push(createBoonCurseRoom(difficulty, numberOfRooms));
  }

  const numberOfDialogs = Math.max(0, numberOfDeadEnds - numberOfChoices - numberOfBoonsOrCurses);
  for (let i = 0; i < numberOfDialogs; i++)
  {
    deadEndRooms.push(createDialogRoom(difficulty, numberOfRooms));
  }

  roomDeck.push(...shuffle(deadEndRooms));

  const numberOfRoomsRemaining = numberOfRooms - numberOfChoices - numberOfBoonsOrCurses - numberOfDialogs;
  const numberOfCombat = Math.max(0, Math.ceil(numberOfRoomsRemaining * 0.5));
  const regularRooms: Room[] = [];
  for (let i = 0; i < numberOfCombat; i++)
  {
    regularRooms.push(createCombatRoom(difficulty, numberOfRoomsRemaining));
  }

  const numberOfMoney = Math.max(0, Math.ceil((numberOfRoomsRemaining - numberOfCombat) * 0.6));
  for (let i = 0; i < numberOfMoney; i++)
  {
    regularRooms.push(createMoneyRoom(difficulty, numberOfRoomsRemaining));
  }

  const numberOfTreasures = Math.max(0, numberOfRoomsRemaining - numberOfCombat - numberOfMoney);
  for (let i = 0; i < numberOfTreasures; i++)
  {
    regularRooms.push(createTresureRoom(difficulty, numberOfRoomsRemaining));
  }

  roomDeck.push(...shuffle(regularRooms));

  // @ifdef DEBUG
  assert(numberOfRooms <= roomDeck.length, "Level generator did not make enough rooms!");
  // @endif
  return roomDeck;
}

const moneyPerLevel = [
  0,
  15,
  50,
  145,
  330,
  635,
  1090,
  1725,
  2570,
  3655,
  5010,
  6665,
];

const fragPerLevel = [
  0,
  5,
  12,
  25,
  42,
  65,
  92,
  125,
  162,
  205,
  252,
  305,
];

function createEmptyRoom(): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [],
    events: []
  }
}

function createBossRoom(difficulty: number, numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.3));
  return {
    seen: false,
    peeked: false,
    enemies: [{
      alive: true,
      health: 10,
      maxHealth: 10,
      attack: 1,
      defense: 1,
      attackSpeed: 105,
      abilities: null
    }],
    exit: true,
    loot: [
      { type: LootType.Sand, amount: money }
    ],
    events: []
  }
}

function createDialogRoom(difficulty: number, numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [],
    events: [
      createBasicDialogEvent("Wow something will happen here!")
    ]
  }
}

function createChoiceRoom(difficulty: number, numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [],
    events: [
      createBasicDialogEvent("Wow something will happen here!")
    ]
  }
}

function createBoonCurseRoom(difficulty: number, numberOfRooms: number): Room
{
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [],
    events: [
      createBasicDialogEvent("Wow something will happen here!")
    ]
  }
}

function createCombatRoom(difficulty: number, numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  return {
    seen: false,
    peeked: false,
    enemies: [
      {
        alive: true,
        health: 10,
        maxHealth: 10,
        attack: 1,
        defense: 1,
        attackSpeed: 105,
        abilities: null
      }
    ],
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money }
    ],
    events: []
  }
}

function createMoneyRoom(difficulty: number, numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money }
    ],
    events: []
  }
}

function createTresureRoom(difficulty: number, numberOfRooms: number): Room
{
  const money = Math.ceil((moneyPerLevel[difficulty] * 0.7) / (numberOfRooms - 1));
  return {
    seen: false,
    peeked: false,
    enemies: [],
    exit: false,
    loot: [
      { type: LootType.Sand, amount: money }
    ],
    events: []
  }
}
