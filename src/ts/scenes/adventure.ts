import { Align, pushQuad, pushSpriteAndSave } from "../draw";
import { Currencies, EventType, LootType, gameState } from "../gamestate";
import { Direction, addChildNode, createButtonNode, createMovementButtonNode, createNode, createTextNode, createWindowNode, moveNode, node_children, node_enabled, node_size, node_sprite_timestamp, node_text, node_visible, updateTextNode } from "../node";
import { Easing, InterpolationData, createInterpolationData, interpolate } from "../interpolate";
import { Scenes, setScene } from "../scene-manager";
import { combat, combatRootId, prepareCombatScene, setupCombatScene } from "./combat";
import { createChoiceDialogEvent, createEventChoice } from "./dialog";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { inputContext } from "../input";
import { v2 } from "../v2";

enum mode
{
  Player,
  Move,
  Triggers,
  Combat,
  Loot,
  Events,
}

export let adventureRootId = -1;

let restButton = -1;
let leaveButton = -1;

let healthAmountId = -1;
let sanityAmountId = -1;

let sandAmountId = -1;
let glassAmountId = -1;
let brassAmountId = -1;
let steelAmountId = -1;
let silverAmountId = -1;
let goldAmountId = -1;

let directionUpId = -1;
let directionDownId = -1;
let directionLeftId = -1;
let directionRightId = -1;

let combatWindow = -1;

let cameraLERP: InterpolationData | null;
let playerLERP: InterpolationData | null;
let delayedTarget: v2 | null = null;
let moneyLERP: InterpolationData | null;

const currencies: Currencies = {
  sand: 0,
  glassFragments: 0,
  brassFragments: 0,
  steelFragments: 0,
  silverFragments: 0,
  goldFragments: 0,
};

const camera: v2 = [60 * 16, 31 * 16];
const cameraSize: v2 = [41 * 16, 25 * 16];
const cameraHalfW = Math.floor(cameraSize[0] / 2);
const cameraHalfH = Math.floor(cameraSize[1] / 2);

let animationTimer = 0;
let frame = "01";
let game_mode = mode.Player;

export function setupAdventureScene()
{
  adventureRootId = createNode();
  node_visible[adventureRootId] = false;
  node_size[adventureRootId][0] = screenWidth;
  node_size[adventureRootId][1] = screenHeight;

  const sideBar = createWindowNode([488, 34], [150, screenHeight - 34]);
  addChildNode(adventureRootId, sideBar);

  restButton = createButtonNode("rest", [4, 4], [142, 70]);
  addChildNode(sideBar, restButton);

  leaveButton = createButtonNode("retreat", [4, screenHeight - 34 - 70 - 4], [142, 70]);
  addChildNode(sideBar, leaveButton);


  const topBar = createWindowNode([2, 2], [screenWidth - 4, 30]);
  addChildNode(adventureRootId, topBar);

  const health = createTextNode("health", 1, Align.Right);
  moveNode(health, [60, 6]);
  addChildNode(topBar, health);

  healthAmountId = createTextNode("20/20", 1, Align.Right);
  moveNode(healthAmountId, [120, 6]);
  addChildNode(topBar, healthAmountId);

  const sanity = createTextNode("sanity", 1, Align.Right);
  moveNode(sanity, [60, 16]);
  addChildNode(topBar, sanity);

  sanityAmountId = createTextNode("10/10", 1, Align.Right);
  moveNode(sanityAmountId, [120, 16]);
  addChildNode(topBar, sanityAmountId);

  const sandLabelId = createTextNode("sand", 1, Align.Right);
  moveNode(sandLabelId, [200, 6]);
  addChildNode(topBar, sandLabelId);

  sandAmountId = createTextNode("0", 1, Align.Right);
  moveNode(sandAmountId, [230, 6]);
  addChildNode(topBar, sandAmountId);

  const glassLabelId = createTextNode("glass", 1, Align.Right);
  moveNode(glassLabelId, [200, 16]);
  addChildNode(topBar, glassLabelId);

  glassAmountId = createTextNode("0", 1, Align.Right);
  moveNode(glassAmountId, [230, 16]);
  addChildNode(topBar, glassAmountId);


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

  setupCombatScene();
  combatWindow = createWindowNode([20, 34], [screenWidth - 40, screenHeight - 68]);
  addChildNode(adventureRootId, combatWindow);
  addChildNode(combatWindow, combatRootId);
  node_enabled[combatWindow] = false;
}

export function resetAdventureScene(): void
{
  camera[0] = 60 * 16;
  camera[1] = 31 * 16;

  currencies.sand = 0;
  currencies.glassFragments = 0;
  currencies.brassFragments = 0;
  currencies.steelFragments = 0;
  currencies.silverFragments = 0;
  currencies.goldFragments = 0;

  animationTimer = 1;
  frame = "01";

  cameraLERP = null;
  playerLERP = null;
  delayedTarget = null;
  moneyLERP = null;
  game_mode = mode.Player;
}

export function adventure(now: number, delta: number): void
{
  const player = gameState.player;

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

  updateTextNode(healthAmountId, `${ player.health }/${ player.maxHealth }`, 1, Align.Right);
  updateTextNode(sanityAmountId, `${ player.sanity }/${ player.maxSanity }`, 1, Align.Right);

  updateTextNode(sandAmountId, `${ currencies.sand }`, 1, Align.Right);
  updateTextNode(glassAmountId, `${ currencies.glassFragments }`, 1, Align.Right);

  const cameraTopLeft: v2 = [camera[0] - cameraHalfW, camera[1] - cameraHalfH];
  const cameraBottomRight: v2 = [camera[0] + cameraHalfW, camera[1] + cameraHalfH];

  const playerTileX = Math.floor(gameState.currentLevel.playerPosition[0] / 16);
  const playerTileY = Math.floor(gameState.currentLevel.playerPosition[1] / 16);

  const playerRoomX = Math.floor(playerTileX / 11);
  const playerRoomY = Math.floor(playerTileY / 9);

  const playerRoomIndex = playerRoomY * 10 + playerRoomX;
  if (gameState.currentLevel.rooms[playerRoomIndex])
  {
    if (!gameState.currentLevel.rooms[playerRoomIndex].seen)
    {
      player.sanity -= 1;
    }
    gameState.currentLevel.rooms[playerRoomIndex].seen = true;
  }
  if (gameState.currentLevel.rooms[playerRoomIndex + 10]) gameState.currentLevel.rooms[playerRoomIndex + 10].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex - 10]) gameState.currentLevel.rooms[playerRoomIndex - 10].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex + 1]) gameState.currentLevel.rooms[playerRoomIndex + 1].peeked = true;
  if (gameState.currentLevel.rooms[playerRoomIndex - 1]) gameState.currentLevel.rooms[playerRoomIndex - 1].peeked = true;

  //#region MAP RENDER
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

  pushSpriteAndSave(
    `player_map_${ frame }`,
    gameState.currentLevel.playerPosition[0] - cameraTopLeft[0] - 8,
    gameState.currentLevel.playerPosition[1] - cameraTopLeft[1] - 12,
    0xFFFFFFFF, 2, 2);

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

        if (gameState.currentLevel.rooms[y * 10 + x]?.exit)
        {
          pushSpriteAndSave("map_mirror", x * 18 + 5, y * 18 + 5 + 200);
        }
        else if (gameState.currentLevel.rooms[y * 10 + x]?.enemies.length > 0)
        {
          pushSpriteAndSave("map_skull", x * 18 + 6, y * 18 + 6 + 200);
        }
        else if (gameState.currentLevel.rooms[y * 10 + x]?.events.length > 0)
        {
          pushSpriteAndSave("map_bang", x * 18 + 5, y * 18 + 5 + 200);
        }
      }
    }
  }
  //#endregion MAP RENDER

  if (gameState.currentLevel.rooms[playerRoomIndex].exit)
  {
    node_text[leaveButton] = "leave";
  }
  else
  {
    node_text[leaveButton] = "retreat";
  }

  const sane = player.sanity > 0;

  node_enabled[restButton] = sane

  if (game_mode === mode.Player)
  {
    if (inputContext.fire === restButton)
    {

    }
    else if (inputContext.fire === leaveButton)
    {
      if (gameState.currentLevel.rooms[playerRoomIndex].exit)
      {
        const yes = createEventChoice("yes", () =>
        {
          gameState.currencies.sand += Math.ceil(currencies.sand);
          gameState.currencies.glassFragments += Math.ceil(currencies.glassFragments);
          gameState.currencies.brassFragments += Math.ceil(currencies.brassFragments);
          gameState.currencies.steelFragments += Math.ceil(currencies.steelFragments);
          gameState.currencies.silverFragments += Math.ceil(currencies.silverFragments);
          gameState.currencies.goldFragments += Math.ceil(currencies.goldFragments);

          setScene(Scenes.Camp);
          // game_mode = mode.Exit;
        });
        const no = createEventChoice("no", () => { });
        gameState.currentEvent = createChoiceDialogEvent([yes, no], "Exit the dungeon with all of your findings?", 1000);
      }
      else
      {
        const yes = createEventChoice("yes", () =>
        {
          gameState.currencies.sand += Math.ceil(currencies.sand * 0.5);
          gameState.currencies.glassFragments += Math.ceil(currencies.glassFragments * 0.5);
          gameState.currencies.brassFragments += Math.ceil(currencies.brassFragments * 0.5);
          gameState.currencies.steelFragments += Math.ceil(currencies.steelFragments * 0.5);
          gameState.currencies.silverFragments += Math.ceil(currencies.silverFragments * 0.5);
          gameState.currencies.goldFragments += Math.ceil(currencies.goldFragments * 0.5);

          setScene(Scenes.Camp);
          // game_mode = mode.Exit;
        });
        const no = createEventChoice("no", () => { });
        gameState.currentEvent = createChoiceDialogEvent([yes, no], "Retreat from the dungeon and lose 50% of what you've found?", 1000);
      }
    }

    node_enabled[directionUpId] = sane && (gameState.currentLevel.tileMap[(playerTileY - 9) * 110 + playerTileX] || 0) > 0;
    node_enabled[directionDownId] = sane && (gameState.currentLevel.tileMap[(playerTileY + 9) * 110 + playerTileX] || 0) > 0;
    node_enabled[directionLeftId] = sane && (gameState.currentLevel.tileMap[(playerTileY) * 110 + playerTileX - 11] || 0) > 0;
    node_enabled[directionRightId] = sane && (gameState.currentLevel.tileMap[(playerTileY) * 110 + playerTileX + 11] || 0) > 0;

    let target: number[] | null = null;
    if (inputContext.fire === directionUpId)
    {
      target = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] - 16 * 8];
      delayedTarget = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] - 16 * 9];
    }
    else if (inputContext.fire === directionDownId)
    {
      target = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] + 16 * 8];
      delayedTarget = [gameState.currentLevel.playerPosition[0], gameState.currentLevel.playerPosition[1] + 16 * 9];
    }
    else if (inputContext.fire === directionLeftId)
    {
      target = [gameState.currentLevel.playerPosition[0] - 16 * 10, gameState.currentLevel.playerPosition[1]];
      delayedTarget = [gameState.currentLevel.playerPosition[0] - 16 * 11, gameState.currentLevel.playerPosition[1]];
    }
    else if (inputContext.fire === directionRightId)
    {
      target = [gameState.currentLevel.playerPosition[0] + 16 * 10, gameState.currentLevel.playerPosition[1]];
      delayedTarget = [gameState.currentLevel.playerPosition[0] + 16 * 11, gameState.currentLevel.playerPosition[1]];
    }
    if (target && delayedTarget)
    {
      node_enabled[directionUpId] = false;
      node_sprite_timestamp[node_children[directionUpId][0]] = 0;

      node_enabled[directionDownId] = false;
      node_sprite_timestamp[node_children[directionDownId][0]] = 0;

      node_enabled[directionLeftId] = false;
      node_sprite_timestamp[node_children[directionLeftId][0]] = 0;

      node_enabled[directionRightId] = false;
      node_sprite_timestamp[node_children[directionRightId][0]] = 0;

      const targetRoom: v2 = [Math.floor(target[0] / 16 / 11), Math.floor(target[1] / 16 / 9)]
      const room = gameState.currentLevel.rooms[targetRoom[1] * 10 + targetRoom[0]]
      if (room?.loot.length === 0 && room?.enemies.length === 0 && room?.events.length === 0)
      {
        target = [...delayedTarget];
        delayedTarget = null;
      }
      cameraLERP = createInterpolationData(500, camera, delayedTarget ?? target, Easing.EaseOutQuad);
      playerLERP = createInterpolationData(750, gameState.currentLevel.playerPosition, target, Easing.Linear, () =>
      {
        game_mode = mode.Triggers;
      });
      game_mode = mode.Move;
    }
  }
  else if (game_mode === mode.Move) { }
  else if (game_mode === mode.Triggers)
  {
    if (gameState.currentLevel.rooms[playerRoomIndex]?.enemies.length > 0)
    {
      prepareCombatScene([...gameState.currentLevel.rooms[playerRoomIndex].enemies]);
      gameState.currentLevel.rooms[playerRoomIndex].enemies.length = 0;
      game_mode = mode.Combat;
    }
    else if (gameState.currentLevel.rooms[playerRoomIndex]?.loot.length > 0)
    {
      let target = [
        currencies.sand,
        currencies.glassFragments,
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
          currencies.glassFragments,
          currencies.brassFragments,
          currencies.steelFragments,
          currencies.silverFragments,
          currencies.goldFragments,
        ],
        target,
        Easing.Linear)
      game_mode = mode.Loot;
    }
    else
    {
      gameState.currentEvent = gameState.currentLevel.rooms[playerRoomIndex]?.events.shift() ?? null;
      game_mode = mode.Events;
    }
  }
  else if (game_mode === mode.Combat)
  {
    node_enabled[combatWindow] = true;

    if (!combat(now, delta))
    {
      game_mode = mode.Triggers;
      node_enabled[combatWindow] = false;
    }
  }
  else if (game_mode === mode.Loot)
  {
    if (moneyLERP)
    {
      let i = interpolate(now, moneyLERP);
      currencies.sand = Math.floor(i.values[0]);
      currencies.glassFragments = Math.floor(i.values[1]);
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
    if (!gameState.currentEvent)
    {
      if (delayedTarget)
      {
        game_mode = mode.Move;

        playerLERP = createInterpolationData(200, gameState.currentLevel.playerPosition, delayedTarget, Easing.Linear, () =>
        {
          game_mode = mode.Player;
        });
        delayedTarget = null;
      }
      else
      {
        game_mode = mode.Player;
      }
    }
  }
}