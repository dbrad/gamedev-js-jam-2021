import { Align, pushQuad, pushSpriteAndSave, pushText } from "../draw";
import { gameState } from "../gamestate";
import { inputContext } from "../input";
import { createInterpolationData, Easing, interpolate, InterpolationData } from "../interpolate";
import { addChildNode, createMovementButtonNode, createNode, createTextNode, createWindowNode, Direction, moveNode, node_children, node_enabled, node_movement, node_size, node_sprite_timestamp, node_visible } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { v2 } from "../v2";

export let adventureRootId = -1;
let directionUpId = -1;
let directionDownId = -1;
let directionLeftId = -1;
let directionRightId = -1;

let cameraLERP: InterpolationData | null;
let playerLERP: InterpolationData | null;

enum mode
{
  Select,
  Move,
  Trigger,
  Combat,
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

const player: v2 = [60 * 16, 31 * 16];
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
    player[0] = Math.floor(i.values[0]);
    player[1] = Math.floor(i.values[1]);
    if (i.done)
    {
      playerLERP = null;
    }
  }

  const cameraTopLeft: v2 = [camera[0] - cameraHalfW, camera[1] - cameraHalfH];
  const cameraBottomRight: v2 = [camera[0] + cameraHalfW, camera[1] + cameraHalfH];

  const playerTileX = Math.floor(player[0] / 16);
  const playerTileY = Math.floor(player[1] / 16);

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
        if (gameState.currentMap[tileY * 110 + tileX] === 2)
        {
          pushSpriteAndSave("wall_02", renderX, renderY, 0xFF1e1e91, 2, 2);
        }
        else if (gameState.currentMap[tileY * 110 + tileX] === 5)
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

  for (let y = 0; y < 72; y++)
  {
    for (let x = 0; x < 110; x++)
    {
      let qx = x * 1;
      let qy = y * 1 + 288;
      let col = gameState.currentMap[y * 110 + x] === 2 || gameState.currentMap[y * 110 + x] === 1 ? 0xFFFFFFFF : gameState.currentMap[y * 110 + x] === 5 ? 0xFFBBBBBB : 0xFF000000;
      pushQuad(qx, qy, 1, 1, col);
      if (x === playerTileX && y === playerTileY)
      {
        pushQuad(qx, qy, 1, 1, 0xFF00FF00);
      }
    }
  }

  if (game_mode === mode.Select)
  {
    node_enabled[directionUpId] = gameState.currentMap[(playerTileY - 9) * 110 + playerTileX] > 0;
    node_enabled[directionDownId] = gameState.currentMap[(playerTileY + 9) * 110 + playerTileX] > 0;
    node_enabled[directionLeftId] = gameState.currentMap[(playerTileY) * 110 + playerTileX - 11] > 0;
    node_enabled[directionRightId] = gameState.currentMap[(playerTileY) * 110 + playerTileX + 11] > 0;

    let target: number[] | null = null;
    if (inputContext.active === directionUpId)
    {
      target = [player[0], player[1] - 16 * 9];
    }
    else if (inputContext.active === directionDownId)
    {
      target = [player[0], player[1] + 16 * 9];
    }
    else if (inputContext.active === directionLeftId)
    {
      target = [player[0] - 16 * 11, player[1]];
    }
    else if (inputContext.active === directionRightId)
    {
      target = [player[0] + 16 * 11, player[1]];
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

      playerLERP = createInterpolationData(500, player, target, Easing.Linear, () =>
      {
        cameraLERP = createInterpolationData(500, camera, player, Easing.EaseOutQuad, () =>
        {
          game_mode = mode.Select;
        });
      });

      game_mode = mode.Move;
    }
  }
  else if (game_mode === mode.Move)
  {
  }
  else if (game_mode === mode.Trigger)
  {
  }
  else if (game_mode === mode.Combat)
  {
  }
}