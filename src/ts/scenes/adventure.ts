import { Align, pushQuad, pushSpriteAndSave } from "../draw";
import { Currencies, gameState, LootType } from "../gamestate";
import { inputContext } from "../input";
import { createInterpolationData, Easing, interpolate, InterpolationData } from "../interpolate";
import { addChildNode, createMovementButtonNode, createNode, createTextNode, createWindowNode, Direction, moveNode, node_children, node_enabled, node_size, node_sprite_timestamp, node_visible, updateTextNode } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { v2 } from "../v2";
import { combat, prepareCombatScene } from "./combat";

export let adventureRootId = -1;
let sandAmountId = -1;
let mirrorAmountId = -1;
let brassAmountId = -1;
let steelAmountId = -1;
let silverAmountId = -1;
let goldAmountId = -1;

let directionUpId = -1;
let directionDownId = -1;
let directionLeftId = -1;
let directionRightId = -1;

let cameraLERP: InterpolationData | null;
let playerLERP: InterpolationData | null;

const currencies: Currencies = {
  sand: 0,
  mirrorFragments: 0,
  brassFragments: 0,
  steelFragments: 0,
  silverFragments: 0,
  goldFragments: 0,
};

let moneyLERP: InterpolationData | null;

enum mode
{
  Select,
  Move,
  Triggers,
  Combat,
  Loot,
  Events,
}

export function setupAdventureScene()
{
  adventureRootId = createNode();
  node_visible[adventureRootId] = false;
  node_size[adventureRootId][0] = screenWidth;
  node_size[adventureRootId][1] = screenHeight;

  const topBar = createWindowNode([2, 2], [screenWidth - 4, 30]);
  addChildNode(adventureRootId, topBar);

  const sideBar = createWindowNode([488, 34], [150, screenHeight - 34]);
  addChildNode(adventureRootId, sideBar);

  const health = createTextNode("health");
  moveNode(health, [4, 6]);
  addChildNode(topBar, health);

  const healthAmount = createTextNode("20/20", 1, Align.Right);
  moveNode(healthAmount, [120, 6]);
  addChildNode(topBar, healthAmount);

  const stamina = createTextNode("stamina");
  moveNode(stamina, [4, 16]);
  addChildNode(topBar, stamina);

  const staminaAmount = createTextNode("10/10", 1, Align.Right);
  moveNode(staminaAmount, [120, 16]);
  addChildNode(topBar, staminaAmount);

  sandAmountId = createTextNode("0", 1, Align.Right);
  moveNode(sandAmountId, [200, 6]);
  addChildNode(topBar, sandAmountId);


  directionUpId = createMovementButtonNode(Direction.Up);
  moveNode(directionUpId, [screenCenterX - 8, screenCenterY - 64]);
  addChildNode(adventureRootId, directionUpId);

  directionDownId = createMovementButtonNode(Direction.Down);
  moveNode(directionDownId, [screenCenterX - 8, screenCenterY + 64]);
  addChildNode(adventureRootId, directionDownId);

  directionRightId = createMovementButtonNode(Direction.Right);
  moveNode(directionRightId, [screenCenterX + 64, screenCenterY]);
  addChildNode(adventureRootId, directionRightId);

  directionLeftId = createMovementButtonNode(Direction.Left);
  moveNode(directionLeftId, [screenCenterX - 16 - 64, screenCenterY]);
  addChildNode(adventureRootId, directionLeftId);
}

const camera: v2 = [60 * 16, 31 * 16];
const cameraSize: v2 = [41 * 16, 25 * 16];
const cameraHalfW = Math.floor(cameraSize[0] / 2);
const cameraHalfH = Math.floor(cameraSize[1] / 2);

let animationTimer = 0;
let frame = "01";
let game_mode = mode.Select;

export function adventure(now: number, delta: number): void
{
  animationTimer += delta;
  if (animationTimer > 500)
  {
    if (animationTimer > 1000) animationTimer = 0;
    animationTimer -= 500;
    if (frame === "01")
      frame = "02";
    else
      frame = "01";
  }

  if (cameraLERP)
  {
    let i = interpolate(now, cameraLERP);
    camera[0] = Math.floor(i.values[0]);
    camera[1] = Math.floor(i.values[1]);
    if (i.done)
    {
      cameraLERP = null;
    }
  }

  if (playerLERP)
  {
    let i = interpolate(now, playerLERP);
    gameState.currentLevel.playerPosition[0] = Math.floor(i.values[0]);
    gameState.currentLevel.playerPosition[1] = Math.floor(i.values[1]);
    if (i.done)
    {
      playerLERP = null;
    }
  }

  updateTextNode(sandAmountId, `${ currencies.sand }`);

  const cameraTopLeft: v2 = [camera[0] - cameraHalfW, camera[1] - cameraHalfH];
  const cameraBottomRight: v2 = [camera[0] + cameraHalfW, camera[1] + cameraHalfH];

  const playerTileX = Math.floor(gameState.currentLevel.playerPosition[0] / 16);
  const playerTileY = Math.floor(gameState.currentLevel.playerPosition[1] / 16);

  const playerRoomX = Math.floor(playerTileX / 11);
  const playerRoomY = Math.floor(playerTileY / 9);

  const playerRoomIndex = playerRoomY * 10 + playerRoomX;
  if (gameState.currentLevel.rooms[playerRoomIndex]) gameState.currentLevel.rooms[playerRoomIndex].seen = true;
  if (gameState.currentLevel.rooms[playerRoomIndex + 10]) gameState.currentLevel.rooms[playerRoomIndex + 10].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex - 10]) gameState.currentLevel.rooms[playerRoomIndex - 10].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex + 1]) gameState.currentLevel.rooms[playerRoomIndex + 1].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex - 1]) gameState.currentLevel.rooms[playerRoomIndex - 1].peeked = true;

  for (let y = cameraTopLeft[1]; y <= cameraBottomRight[1]; y += 16)
  {
    for (let x = cameraTopLeft[0]; x <= cameraBottomRight[0]; x += 16)
    {
      const tileX = Math.floor(x / 16);
      const tileY = Math.floor(y / 16);

      if (tileX > 0 && tileX < 110 && tileY >= 0 && tileY < 72)
      {
        const renderX = tileX * 16 - cameraTopLeft[0] - 8;
        const renderY = tileY * 16 - cameraTopLeft[1] - 12;
        if (gameState.currentLevel?.tileMap[tileY * 110 + tileX] === 2)
        {
          pushSpriteAndSave("wall_02", renderX, renderY, 0xFF1e1e91, 2, 2);
        }
        else if (gameState.currentLevel?.tileMap[tileY * 110 + tileX] === 5)
        {
          pushSpriteAndSave("floor_01", renderX, renderY, 0xFFFFFFFF, 2, 2);
        }
        else
        {
          pushSpriteAndSave("wall_01", renderX, renderY, 0xFFFFFFFF, 2, 2);
        }

        if (playerTileX == tileX && playerTileY == tileY)
        {
          pushSpriteAndSave(`player_map_${ frame }`, renderX, renderY, 0xFFFFFFFF, 2, 2);
        }

        // Lighting
        const distance = Math.sqrt((playerTileX - tileX) ** 2 + (playerTileY - tileY) ** 2);
        if (distance >= 7)
        {
          pushQuad(renderX, renderY, 16, 16, 0xFF000000);
        }
        else if (distance >= 5)
        {
          pushQuad(renderX, renderY, 16, 16, 0xBD000000);
        }
        else if (distance >= 3)
        {
          pushQuad(renderX, renderY, 16, 16, 0x7F000000);
        }
        else if (distance >= 2)
        {
          pushQuad(renderX, renderY, 16, 16, 0x40000000);
        }
      }
    }
  }

  const renderX = playerRoomX * 11 * 16 + 5 * 16 - cameraTopLeft[0] - 8;
  const renderY = playerRoomY * 9 * 16 + 4 * 16 - cameraTopLeft[1] - 12;
  if (gameState.currentLevel.rooms[playerRoomIndex]?.enemies.length > 0)
  {
    pushSpriteAndSave(`enemy_map_${ frame }`, renderX, renderY, 0xFFFFFFFF, 2, 2);
  }
  else if (gameState.currentLevel.rooms[playerRoomIndex]?.loot.length > 0)
  {
    pushSpriteAndSave(`chest_closed`, renderX, renderY, 0xFFFFFFFF, 2, 2);
  }

  for (let y = 0; y < 8; y++)
  {
    for (let x = 1; x <= 9; x++)
    {
      if (playerRoomX === x && playerRoomY === y)
      {
        if (frame === "01")
        {
          pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFFEEEEEE);
        }
        else
        {
          pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFF666666);
        }
      }
      else if (gameState.currentLevel.rooms[y * 10 + x]?.seen)
      {
        pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFF666666);
      }
      else if (gameState.currentLevel.rooms[y * 10 + x]?.peeked)
      {
        pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFF333333);
      }
    }
  }

  if (game_mode === mode.Select)
  {
    node_enabled[directionUpId] = (gameState.currentLevel.tileMap[(playerTileY - 9) * 110 + playerTileX] || 0) > 0;
    node_enabled[directionDownId] = (gameState.currentLevel.tileMap[(playerTileY + 9) * 110 + playerTileX] || 0) > 0;
    node_enabled[directionLeftId] = (gameState.currentLevel.tileMap[(playerTileY) * 110 + playerTileX - 11] || 0) > 0;
    node_enabled[directionRightId] = (gameState.currentLevel.tileMap[(playerTileY) * 110 + playerTileX + 11] || 0) > 0;

    let target: number[] | null = null;
    if (inputContext.active === directionUpId)
    {
      target = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] - 16 * 9];
    }
    else if (inputContext.active === directionDownId)
    {
      target = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] + 16 * 9];
    }
    else if (inputContext.active === directionLeftId)
    {
      target = [gameState.currentLevel.playerPosition[0] - 16 * 11, gameState.currentLevel.playerPosition[1]];
    }
    else if (inputContext.active === directionRightId)
    {
      target = [gameState.currentLevel.playerPosition[0] + 16 * 11, gameState.currentLevel.playerPosition[1]];
    }
    if (target)
    {
      node_enabled[directionUpId] = false;
      node_sprite_timestamp[node_children[directionUpId][0]] = 0;

      node_enabled[directionDownId] = false;
      node_sprite_timestamp[node_children[directionDownId][0]] = 0;

      node_enabled[directionLeftId] = false;
      node_sprite_timestamp[node_children[directionLeftId][0]] = 0;

      node_enabled[directionRightId] = false;
      node_sprite_timestamp[node_children[directionRightId][0]] = 0;

      cameraLERP = createInterpolationData(500, camera, target, Easing.EaseOutQuad);
      playerLERP = createInterpolationData(750, gameState.currentLevel.playerPosition, target, Easing.Linear, () =>
      {
        game_mode = mode.Triggers;
      });

      game_mode = mode.Move;
    }
  }
  else if (game_mode === mode.Move)
  {
  }
  else if (game_mode === mode.Triggers)
  {
    if (gameState.currentLevel.rooms[playerRoomIndex]?.enemies.length > 0)
    {
      prepareCombatScene(gameState.currentLevel.rooms[playerRoomIndex]?.enemies);
      gameState.currentLevel.rooms[playerRoomIndex].enemies.length = 0;
      game_mode = mode.Combat;
    }
    else if (gameState.currentLevel.rooms[playerRoomIndex]?.loot.length > 0)
    {
      let target = [
        currencies.sand,
        currencies.mirrorFragments,
        currencies.brassFragments,
        currencies.steelFragments,
        currencies.silverFragments,
        currencies.goldFragments,
      ];

      do
      {
        const loot = gameState.currentLevel.rooms[playerRoomIndex]?.loot.pop();
        if (loot)
        {
          switch (loot.type)
          {
            case LootType.Sand:
              target[0] += loot.amount;
              break;
            case LootType.Mirror:
              target[1] += loot.amount;
              break;
            case LootType.Brass:
              target[2] += loot.amount;
              break;
            case LootType.Steel:
              target[3] += loot.amount;
              break;
            case LootType.Silver:
              target[4] += loot.amount;
              break;
            case LootType.Gold:
              target[5] += loot.amount;
              break;
          }
        }
      } while (gameState.currentLevel.rooms[playerRoomIndex]?.loot.length > 0)

      moneyLERP = createInterpolationData(750,
        [
          currencies.sand,
          currencies.mirrorFragments,
          currencies.brassFragments,
          currencies.steelFragments,
          currencies.silverFragments,
          currencies.goldFragments,
        ],
        target,
        Easing.Linear)
      game_mode = mode.Loot;
    }
    else if (gameState.currentLevel.rooms[playerRoomIndex]?.events.length > 0)
    {
      gameState.currentEvent = gameState.currentLevel.rooms[playerRoomIndex]?.events.shift() ?? null;
      game_mode = mode.Events;
    }
    else
    {
      game_mode = mode.Select;
    }
  }
  else if (game_mode === mode.Combat)
  {
    combat(now, delta);
    game_mode = mode.Triggers;
  }
  else if (game_mode === mode.Loot)
  {
    if (moneyLERP)
    {
      let i = interpolate(now, moneyLERP);
      currencies.sand = Math.floor(i.values[0]);
      currencies.mirrorFragments = Math.floor(i.values[1]);
      currencies.brassFragments = Math.floor(i.values[2]);
      currencies.steelFragments = Math.floor(i.values[3]);
      currencies.silverFragments = Math.floor(i.values[4]);
      currencies.goldFragments = Math.floor(i.values[5]);
      if (i.done)
      {
        moneyLERP = null;
        game_mode = mode.Triggers;
      }
    }
  }
  else if (game_mode === mode.Events)
  {
    game_mode = mode.Select;
  }
}