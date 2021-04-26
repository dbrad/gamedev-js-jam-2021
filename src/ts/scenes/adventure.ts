import { Align, pushQuad, pushSpriteAndSave } from "../draw";
import { Currencies, LootType, floorColour, gameState, levelUpGem, levelUpPlayer, nextLevel, wallColour } from "../gamestate";
import { Direction, addChildNode, createButtonNode, createMovementButtonNode, createNode, createTextNode, createWindowNode, createXPBarNode, moveNode, node_children, node_enabled, node_second_text_line, node_size, node_sprite_timestamp, node_text, node_visible, updateTextNode, updateXPBarValues } from "../node";
import { Easing, InterpolationData, createInterpolationData, interpolate } from "../interpolate";
import { FrameMaterial, FrameQuality } from "../mirror";
import { Scenes, setScene } from "../scene-manager";
import { combat, combatRootId, prepareCombatScene, setupCombatScene } from "./combat";
import { createChoiceDialogEvent, createEventChoice, createOutcomeDialogEvent } from "../room-events";
import { eventSound, healSound, sacrificeSound, zzfxP } from "../zzfx";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { GemType } from "../ability";
import { inputContext } from "../input";
import { rand } from "../random";
import { v2 } from "../v2";

enum mode
{
  Player,
  NoAction,
  Triggers,
  Combat,
  Loot,
  Events,
}

export let adventureRootId = -1;

let sideBar = -1;
let restButtonId = -1;
let sacrificeButtonId = -1;
let leaveButtonId = -1;

let healthAmountId = -1;
let sanityAmountId = -1;

let levelAmountId = -1;
let xpBarId = -1;

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

let combatWindowId = -1;

let cameraLERP: InterpolationData | null;
let playerLERP: InterpolationData | null;
let delayedTarget: v2 | null = null;
let moneyLERP: InterpolationData | null;
let xpSmoothing: InterpolationData | null;

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

  // Side Bar
  sideBar = createWindowNode([488, 34], [150, screenHeight - 34]);
  addChildNode(adventureRootId, sideBar);

  restButtonId = createButtonNode("rest", [142, 70], "hp for sanity (10%<=>10%)");
  moveNode(restButtonId, [4, 4]);
  addChildNode(sideBar, restButtonId);

  sacrificeButtonId = createButtonNode("bleed", [142, 70], "sanity for hp (1<=>25%)");
  moveNode(sacrificeButtonId, [4, 84]);
  node_enabled[sacrificeButtonId] = false;
  addChildNode(sideBar, sacrificeButtonId);

  leaveButtonId = createButtonNode("retreat", [142, 70]);
  moveNode(leaveButtonId, [4, screenHeight - 34 - 70 - 4]);
  addChildNode(sideBar, leaveButtonId);


  // Top Bar
  const topBarSize: v2 = [screenWidth - 4, 30];
  const topBar = createWindowNode([2, 2], topBarSize);
  addChildNode(adventureRootId, topBar);

  const level = createTextNode("level", 1, Align.Left);
  moveNode(level, [12, 4]);
  addChildNode(topBar, level);

  levelAmountId = createTextNode("0", 1, Align.Right);
  moveNode(levelAmountId, [108, 4]);
  addChildNode(topBar, levelAmountId);

  xpBarId = createXPBarNode(3);
  moveNode(xpBarId, [12, 13]);
  addChildNode(topBar, xpBarId);

  const health = createTextNode("health", 1, Align.Left);
  moveNode(health, [128, 6]);
  addChildNode(topBar, health);

  healthAmountId = createTextNode("20/20", 1, Align.Right);
  moveNode(healthAmountId, [236, 6]);
  addChildNode(topBar, healthAmountId);

  const sanity = createTextNode("sanity", 1, Align.Left);
  moveNode(sanity, [128, 16]);
  addChildNode(topBar, sanity);

  sanityAmountId = createTextNode("10/10", 1, Align.Right);
  moveNode(sanityAmountId, [236, 16]);
  addChildNode(topBar, sanityAmountId);



  const sandLabelId = createTextNode("sand", 1, Align.Right);
  moveNode(sandLabelId, [topBarSize[0] - 298, 6]);
  addChildNode(topBar, sandLabelId);

  sandAmountId = createTextNode("0", 1, Align.Right);
  moveNode(sandAmountId, [topBarSize[0] - 248, 6]);
  addChildNode(topBar, sandAmountId);

  const glassLabelId = createTextNode("glass", 1, Align.Right);
  moveNode(glassLabelId, [topBarSize[0] - 298, 16]);
  addChildNode(topBar, glassLabelId);

  glassAmountId = createTextNode("0", 1, Align.Right);
  moveNode(glassAmountId, [topBarSize[0] - 248, 16]);
  addChildNode(topBar, glassAmountId);

  const brassLabelId = createTextNode("brass", 1, Align.Right);
  moveNode(brassLabelId, [topBarSize[0] - 180, 6]);
  addChildNode(topBar, brassLabelId);

  brassAmountId = createTextNode("0", 1, Align.Right);
  moveNode(brassAmountId, [topBarSize[0] - 130, 6]);
  addChildNode(topBar, brassAmountId);

  const steelLabelId = createTextNode("steel", 1, Align.Right);
  moveNode(steelLabelId, [topBarSize[0] - 180, 16]);
  addChildNode(topBar, steelLabelId);

  steelAmountId = createTextNode("0", 1, Align.Right);
  moveNode(steelAmountId, [topBarSize[0] - 130, 16]);
  addChildNode(topBar, steelAmountId);

  const silverLabelId = createTextNode("silver", 1, Align.Right);
  moveNode(silverLabelId, [topBarSize[0] - 62, 6]);
  addChildNode(topBar, silverLabelId);

  silverAmountId = createTextNode("0", 1, Align.Right);
  moveNode(silverAmountId, [topBarSize[0] - 12, 6]);
  addChildNode(topBar, silverAmountId);

  const goldLabelId = createTextNode("gold", 1, Align.Right);
  moveNode(goldLabelId, [topBarSize[0] - 62, 16]);
  addChildNode(topBar, goldLabelId);

  goldAmountId = createTextNode("0", 1, Align.Right);
  moveNode(goldAmountId, [topBarSize[0] - 12, 16]);
  addChildNode(topBar, goldAmountId);


  // Direction Buttons
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

  // Combat Window
  setupCombatScene();
  combatWindowId = createWindowNode([155, 90], [330, 180]);
  addChildNode(adventureRootId, combatWindowId);
  addChildNode(combatWindowId, combatRootId);
  node_enabled[combatWindowId] = false;
}

let playerBonusLoot = 0;
let playerSacrifice = 0;

export function resetAdventureScene(): void
{
  camera[0] = 60 * 16;
  camera[1] = 31 * 16;

  animationTimer = 1;
  frame = "01";

  playerBonusLoot = 0;
  playerSacrifice = 0;
  node_enabled[sacrificeButtonId] = false;

  cameraLERP = null;
  playerLERP = null;
  delayedTarget = null;
  moneyLERP = null;
  xpSmoothing = null;
  game_mode = mode.Player;
  levelUp = false
}

export function loadPlayerAbilities(): void
{
  switch (gameState.equippedMirror)
  {
    case FrameMaterial.Gold:
    case FrameMaterial.Coil:
      switch (gameState.mirrors[gameState.equippedMirror].frameQuality)
      {
        case FrameQuality.Tarnished:
          playerBonusLoot += 0.05;
          break;
        case FrameQuality.Polished:
          playerBonusLoot += 0.1;
          break;
        case FrameQuality.Pristine:
          playerBonusLoot += 0.15;
          break;
        case FrameQuality.Ornate:
          playerBonusLoot += 0.2;
          break;
      }
      break;
  }
  for (const gem of [0, 1, 2, 3, 4, 5, 6])
  {
    if (!gameState.gems[gem as GemType].owned) { continue; }
    switch (gem)
    {
      case GemType.Citrine:
        switch (gameState.gems[gem].level)
        {
          case 1:
            playerBonusLoot += 0.05;
            break;
          case 2:
            playerBonusLoot += 0.1;
            break;
          case 3:
            playerBonusLoot += 0.15;
            break;
          case 4:
            playerBonusLoot += 0.2;
            break;
        }
        break;
      case GemType.Morganite:
        switch (gameState.gems[gem].level)
        {
          case 1:
            playerSacrifice = 0.25;
            break;
          case 2:
            playerSacrifice = 0.20;
            break;
          case 3:
            playerSacrifice = 0.15;
            break;
          case 4:
            playerSacrifice = 0.1;
            break;
        }
        node_enabled[sacrificeButtonId] = true;
        node_second_text_line[sacrificeButtonId] = `sanity for hp (1<=>${ playerSacrifice * 100 }%)`
        break;
      case GemType.Alexandrite:
        let rooms = 1 + ((gameState.gems[gem].level - 1) * 2);
        while (rooms > 0)
        {
          let x = rand(1, 9);
          let y = rand(0, 7);
          if (gameState.currentLevel.rooms[y * 10 + x]
            && !gameState.currentLevel.rooms[y * 10 + x].peeked)
          {
            gameState.currentLevel.rooms[y * 10 + x].peeked = true;
            rooms--;
          }
        }
    }
  }
}

let levelUp: boolean = false;
export function adventure(now: number, delta: number): void
{
  const player = gameState.player;
  const currencies = gameState.currentLevel.currencies;

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
  updateTextNode(brassAmountId, `${ currencies.brassFragments }`, 1, Align.Right);
  updateTextNode(steelAmountId, `${ currencies.steelFragments }`, 1, Align.Right);
  updateTextNode(silverAmountId, `${ currencies.silverFragments }`, 1, Align.Right);
  updateTextNode(goldAmountId, `${ currencies.goldFragments }`, 1, Align.Right);

  if (levelUp)
  {
    levelUpPlayer();
    levelUp = false;
  }

  if (!xpSmoothing && player.xp / nextLevel(player.level) >= 1)
  {
    levelUp = true;
  }
  else if (!xpSmoothing && player.xpPool >= 1)
  {
    player.xpPool -= 1;
    xpSmoothing = createInterpolationData(35, [player.xp], [player.xp + 1])
  }
  else if (xpSmoothing)
  {
    let i = interpolate(now, xpSmoothing);
    player.xp = i.values[0];
    if (i.done)
    {
      xpSmoothing = null;
    }
  }
  updateXPBarValues(xpBarId, player.xp / nextLevel(player.level));
  updateTextNode(levelAmountId, `${ player.level }`, 1, Align.Right);

  const cameraTopLeft: v2 = [camera[0] - cameraHalfW, camera[1] - cameraHalfH];
  const cameraBottomRight: v2 = [camera[0] + cameraHalfW, camera[1] + cameraHalfH];

  const playerTileX = Math.floor(gameState.currentLevel.playerPosition[0] / 16);
  const playerTileY = Math.floor(gameState.currentLevel.playerPosition[1] / 16);

  const playerRoomX = Math.floor(playerTileX / 11);
  const playerRoomY = Math.floor(playerTileY / 9);

  const playerRoomIndex = playerRoomY * 10 + playerRoomX;
  const playerRoom = gameState.currentLevel.rooms[playerRoomIndex];
  if (playerRoom)
  {
    if (!playerRoom.seen)
    {
      player.sanity -= 1;
    }
    playerRoom.seen = true;
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

        let sprite = "wall_01";
        let colour = wallColour[gameState.currentLevel.realm];
        switch (gameState.currentLevel?.tileMap[tileY * 110 + tileX])
        {
          case 2:
            sprite = "wall_02";
            colour = wallColour[gameState.currentLevel.realm];
            break;
          case 3:
            sprite = "wall_03";
            colour = wallColour[gameState.currentLevel.realm];
            break;
          case 4:
            sprite = "wall_04";
            colour = wallColour[gameState.currentLevel.realm];
            break;
          case 5:
            sprite = "floor_01";
            colour = floorColour[gameState.currentLevel.realm]
            break;
          case 6:
            sprite = "floor_02";
            colour = floorColour[gameState.currentLevel.realm]
            break;
          case 7:
            sprite = "floor_03";
            colour = floorColour[gameState.currentLevel.realm]
            break;
          case 8:
            sprite = "floor_04";
            colour = floorColour[gameState.currentLevel.realm]
            break;
        }
        pushSpriteAndSave(sprite, renderX, renderY, colour, 2, 2);

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
  if (playerRoom?.enemy)
  {
    pushSpriteAndSave(`enemy_map_${ frame }`, renderX, renderY, 0xFFFFFFFF, 2, 2);
  }
  else if (playerRoom?.loot.length > 0)
  {
    //pushSpriteAndSave(`chest_closed`, renderX, renderY, 0xFFFFFFFF, 2, 2);
  }

  for (let y = 0; y < 8; y++)
  {
    for (let x = 1; x <= 9; x++)
    {
      const currentRoom = gameState.currentLevel.rooms[y * 10 + x];
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
      else if (currentRoom?.seen)
      {
        pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFF666666);
      }
      else if (currentRoom?.peeked)
      {
        pushQuad(x * 18 + 1, y * 18 + 1 + 200, 16, 16, 0xFF333333);

        if (currentRoom?.enemy && !currentRoom?.exit)
        {
          pushSpriteAndSave("map_skull", x * 18 + 6, y * 18 + 6 + 200);
        }
        else if (currentRoom?.events.length > 0)
        {
          pushSpriteAndSave("map_bang", x * 18 + 5, y * 18 + 5 + 200);
        }
      }

      if ((currentRoom?.seen || currentRoom?.peeked) && currentRoom?.exit)
      {
        pushSpriteAndSave("map_mirror", x * 18 + 5, y * 18 + 5 + 200);
      }
    }
  }
  //#endregion MAP RENDER

  if (playerRoom.exit)
  {
    node_text[leaveButtonId] = "leave";
  }
  else
  {
    node_text[leaveButtonId] = "retreat";
  }

  const sane = player.sanity > 0;
  const restable = player.health < player.maxHealth && player.sanity > Math.floor(player.maxSanity * 0.1);
  const bleedable = player.sanity < player.maxSanity && playerSacrifice > 0;

  node_enabled[restButtonId] = restable
  node_enabled[sacrificeButtonId] = bleedable
  node_enabled[sideBar] = false;
  
  if (game_mode === mode.Player)
  {
    node_enabled[sideBar] = true;
    if (inputContext.fire === restButtonId)
    {
      if (restable)
      {
        player.sanity -= Math.floor(player.maxSanity * 0.1);
        player.health += Math.floor(player.maxHealth * 0.1);
        if (player.health > player.maxHealth)
        {
          player.health = player.maxHealth;
        }
        zzfxP(healSound);
      }
    }
    else if (inputContext.fire === sacrificeButtonId)
    {
      if (bleedable)
      {
        player.sanity = Math.min(player.maxSanity, player.sanity + 1);
        player.health = Math.max(0, player.health - Math.ceil(player.maxHealth * playerSacrifice));
        zzfxP(sacrificeSound);
      }
    }
    else if (inputContext.fire === leaveButtonId)
    {
      if (playerRoom.exit)
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
        });
        const no = createEventChoice("no", () => { });
        gameState.currentEvent = createChoiceDialogEvent([yes, no], "Retreat from the dungeon and keep 50% of what you've found?", 1000);
      }
    }

    if (player.health <= 0)
    {
      gameState.currentEvent = createOutcomeDialogEvent(
        () =>
        {
          gameState.currencies.sand += Math.ceil(currencies.sand * 0.3);
          gameState.currencies.glassFragments += Math.ceil(currencies.glassFragments * 0.3);
          gameState.currencies.brassFragments += Math.ceil(currencies.brassFragments * 0.3);
          gameState.currencies.steelFragments += Math.ceil(currencies.steelFragments * 0.3);
          gameState.currencies.silverFragments += Math.ceil(currencies.silverFragments * 0.3);
          gameState.currencies.goldFragments += Math.ceil(currencies.goldFragments * 0.3);

          setScene(Scenes.Camp);
        },
        "You have fallen and will return to camp with 30% of what you found.", 1000);
      game_mode = mode.NoAction;
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
      if (room?.enemy === null)
      {
        target = [...delayedTarget];
        delayedTarget = null;
      }
      cameraLERP = createInterpolationData(500, camera, delayedTarget ?? target, Easing.EaseOutQuad);
      playerLERP = createInterpolationData(750, gameState.currentLevel.playerPosition, target, Easing.Linear, () =>
      {
        game_mode = mode.Triggers;
      });
      game_mode = mode.NoAction;
    }
  }
  else if (game_mode === mode.NoAction) { }
  else if (game_mode === mode.Triggers)
  {
    if (playerRoom.enemy)
    {
      prepareCombatScene(playerRoom.enemy);
      game_mode = mode.Combat;
    }
    else if (playerRoom?.loot.length > 0)
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
        const loot = playerRoom?.loot.pop();
        if (loot)
        {
          switch (loot.type)
          {
            case LootType.Sand:
              target[0] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
            case LootType.Glass:
              target[1] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
            case LootType.Brass:
              target[2] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
            case LootType.Steel:
              target[3] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
            case LootType.Silver:
              target[4] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
            case LootType.Gold:
              target[5] += Math.ceil(loot.amount * (1 + playerBonusLoot));
              break;
          }
        }
      } while (playerRoom?.loot.length > 0)

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
      gameState.currentEvent = playerRoom?.events.shift() ?? null;
      if (gameState.currentEvent)
      {
        zzfxP(eventSound);
      }
      game_mode = mode.Events;
    }
  }
  else if (game_mode === mode.Combat)
  {
    node_enabled[combatWindowId] = true;

    if (!combat(now, delta))
    {
      playerRoom.enemy = null;
      node_enabled[combatWindowId] = false;

      if (player.health <= 0)
      {
        gameState.currentEvent = createOutcomeDialogEvent(
          () =>
          {
            gameState.currencies.sand += Math.ceil(currencies.sand * 0.3);
            gameState.currencies.glassFragments += Math.ceil(currencies.glassFragments * 0.3);
            gameState.currencies.brassFragments += Math.ceil(currencies.brassFragments * 0.3);
            gameState.currencies.steelFragments += Math.ceil(currencies.steelFragments * 0.3);
            gameState.currencies.silverFragments += Math.ceil(currencies.silverFragments * 0.3);
            gameState.currencies.goldFragments += Math.ceil(currencies.goldFragments * 0.3);

            setScene(Scenes.Camp);
          },
          "You have fallen and will return to camp with 30% of what you found.", 1000);
        game_mode = mode.NoAction;
      }
      else
      {
        if (playerRoom.exit)
        {
          levelUpGem();

          if (gameState.currentLevel.difficulty === 3)
          {
            gameState.flags["clear_3_star"] = true
          }
          else if (gameState.currentLevel.difficulty === 5)
          {
            gameState.flags["clear_5_star"] = true
          }
          else if (gameState.currentLevel.difficulty === 7)
          {
            gameState.flags["clear_7_star"] = true
          }
          // TODO(dbrad): Set clear flags
        }
        game_mode = mode.Triggers;
      }
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
        game_mode = mode.NoAction;

        playerLERP = createInterpolationData(100, gameState.currentLevel.playerPosition, delayedTarget, Easing.Linear, () =>
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