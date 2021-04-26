import { FrameQuality, Mirror, MirrorQuality, costForNextLevel, craftCost, frameMatNames, frameMatSprite, getMirrorName, getSpecialText, getSummaryText } from "../mirror";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_enabled, node_interactive, node_size, node_visible, updateTextNode } from "../node";
import { backgroundFade, fadeBackgroundTo, frameMetalFragment, gameState } from "../gamestate";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { createBasicDialogEvent } from "../room-events";
import { gl_setClear } from "../gl";
import { inputContext } from "../input";
import { v2 } from "../v2";

export let smithRootId = -1;

let backButtonId = -1;

let brassBuyRootId = -1;
let brassBuyId = -1;
let brassCreateTextIds: number[] = [];

let brassUpgradeRootId = -1;
let brassUpgradeTextIds: number[] = [];
let brassUpgradeFrameId = -1;
let brassUpgradeMirrorId = -1;

let steelBuyRootId = -1;
let steelBuyId = -1;
let steelCreateTextIds: number[] = [];

let steelUpgradeRootId = -1;
let steelUpgradeTextIds: number[] = [];
let steelUpgradeFrameId = -1;
let steelUpgradeMirrorId = -1;

let silverBuyRootId = -1;
let silverBuyId = -1;
let silverCreateTextIds: number[] = [];

let silverUpgradeRootId = -1;
let silverUpgradeTextIds: number[] = [];
let silverUpgradeFrameId = -1;
let silverUpgradeMirrorId = -1;

let goldBuyRootId = -1;
let goldBuyId = -1;
let goldCreateTextIds: number[] = [];

let goldUpgradeRootId = -1;
let goldUpgradeTextIds: number[] = [];
let goldUpgradeFrameId = -1;
let goldUpgradeMirrorId = -1;

let sandAmountId = -1;
let glassAmountId = -1;
let brassAmountId = -1;
let steelAmountId = -1;
let silverAmountId = -1;
let goldAmountId = -1;

export function setupSmithScene(): void
{
  smithRootId = createNode();
  node_visible[smithRootId] = false;
  node_size[smithRootId][0] = screenWidth;
  node_size[smithRootId][1] = screenHeight;

  const topBarSize: v2 = [350, 30];
  const topBar = createWindowNode([screenWidth - 352, 2], topBarSize);
  addChildNode(smithRootId, topBar);

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


  const smith = createSprite(
    [
      { spriteName: "smith_01", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
      { spriteName: "smith_03", duration: 75 },
      { spriteName: "smith_04", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
    ], 4);
  moveNode(smith, [screenCenterX - 40, 20]);
  addChildNode(smithRootId, smith);

  backButtonId = createButtonNode("back", [70, 40]);
  moveNode(backButtonId, [2, 2])
  addChildNode(smithRootId, backButtonId);


  [brassBuyRootId, brassBuyId, ...brassCreateTextIds] = createSmithingPanel(gameState.mirrors[1]);
  moveNode(brassBuyRootId, [15, 90]);
  addChildNode(smithRootId, brassBuyRootId);

  [brassUpgradeRootId, brassUpgradeFrameId, brassUpgradeMirrorId, ...brassUpgradeTextIds] = upgradeSmithingPanel(gameState.mirrors[1]);
  moveNode(brassUpgradeRootId, [15, 90]);
  addChildNode(smithRootId, brassUpgradeRootId);


  [steelBuyRootId, steelBuyId, ...steelCreateTextIds] = createSmithingPanel(gameState.mirrors[2]);
  moveNode(steelBuyRootId, [325, 90]);
  addChildNode(smithRootId, steelBuyRootId);

  [steelUpgradeRootId, steelUpgradeFrameId, steelUpgradeMirrorId, ...steelUpgradeTextIds] = upgradeSmithingPanel(gameState.mirrors[2]);
  moveNode(steelUpgradeRootId, [325, 90]);
  addChildNode(smithRootId, steelUpgradeRootId);


  [silverBuyRootId, silverBuyId, ...silverCreateTextIds] = createSmithingPanel(gameState.mirrors[3]);
  moveNode(silverBuyRootId, [15, 220]);
  addChildNode(smithRootId, silverBuyRootId);

  [silverUpgradeRootId, silverUpgradeFrameId, silverUpgradeMirrorId, ...silverUpgradeTextIds] = upgradeSmithingPanel(gameState.mirrors[3]);
  moveNode(silverUpgradeRootId, [15, 220]);
  addChildNode(smithRootId, silverUpgradeRootId);


  [goldBuyRootId, goldBuyId, ...goldCreateTextIds] = createSmithingPanel(gameState.mirrors[4]);
  moveNode(goldBuyRootId, [325, 220]);
  addChildNode(smithRootId, goldBuyRootId);

  [goldUpgradeRootId, goldUpgradeFrameId, goldUpgradeMirrorId, ...goldUpgradeTextIds] = upgradeSmithingPanel(gameState.mirrors[4]);
  moveNode(goldUpgradeRootId, [325, 220]);
  addChildNode(smithRootId, goldUpgradeRootId);
}

function createSmithingPanel(mirror: Mirror): number[]
{
  const root = createWindowNode([0, 0], [300, 120]);

  const sprite = createSprite([{ spriteName: frameMatSprite[mirror.material], duration: 0 }], 4);
  moveNode(sprite, [4, 28]);
  node_interactive[sprite] = false;
  addChildNode(root, sprite);

  const title = createTextNode(getMirrorName(mirror), 1);
  moveNode(title, [4, 4]);
  node_interactive[title] = false;
  addChildNode(root, title);

  const craftingCost = createTextNode("crafting cost");
  moveNode(craftingCost, [72, 40]);
  addChildNode(root, craftingCost);

  const sandCost = createTextNode(`${ craftCost[0] } sand`);
  moveNode(sandCost, [72, 50]);
  addChildNode(root, sandCost);

  const glassCost = createTextNode(`${ craftCost[1] } glass`);
  moveNode(glassCost, [72, 60]);
  addChildNode(root, glassCost);

  const metalCost = createTextNode(`${ craftCost[1] } ${ frameMatNames[mirror.material] }`);
  moveNode(metalCost, [72, 70]);
  addChildNode(root, metalCost);

  const summary = createTextNode(getSummaryText(mirror), 1, Align.Center, 0xFF4d4d4d);
  moveNode(summary, [150, 92]);
  addChildNode(root, summary);

  const special = createTextNode(getSpecialText(mirror), 1, Align.Center, 0xFF4d4d4d);
  moveNode(special, [150, 102]);
  addChildNode(root, special);

  const createButton = createButtonNode("Create", [80, 40], "", 1);
  moveNode(createButton, [216, 40])
  addChildNode(root, createButton);

  return [root, createButton, sandCost, glassCost, metalCost];
}

function upgradeSmithingPanel(mirror: Mirror): number[]
{
  const root = createWindowNode([0, 0], [300, 120]);

  const sprite = createSprite([{ spriteName: frameMatSprite[mirror.material], duration: 0 }], 4);
  moveNode(sprite, [4, 28]);
  node_interactive[sprite] = false;
  addChildNode(root, sprite);

  const title = createTextNode(getMirrorName(mirror), 1);
  moveNode(title, [4, 4]);
  node_interactive[title] = false;
  addChildNode(root, title);


  const frameUpgradeCost = createTextNode("upgrade frame");
  moveNode(frameUpgradeCost, [72, 20]);
  addChildNode(root, frameUpgradeCost);

  const frameSandCost = createTextNode(`${ costForNextLevel(mirror.frameQuality)[0] } sand`);
  moveNode(frameSandCost, [72, 30]);
  addChildNode(root, frameSandCost);

  const frameGlassCost = createTextNode(`${ costForNextLevel(mirror.frameQuality)[1] } ${ frameMatNames[mirror.material] }`);
  moveNode(frameGlassCost, [72, 40]);
  addChildNode(root, frameGlassCost);

  const upgradeFrameButton = createButtonNode("upgrade", [80, 40], "", 1);
  moveNode(upgradeFrameButton, [216, 15]);
  addChildNode(root, upgradeFrameButton);


  const mirrorUpgradeCost = createTextNode("upgrade mirror");
  moveNode(mirrorUpgradeCost, [72, 70]);
  addChildNode(root, mirrorUpgradeCost);

  const mirrorSandCost = createTextNode(`${ costForNextLevel(mirror.frameQuality)[0] } sand`);
  moveNode(mirrorSandCost, [72, 80]);
  addChildNode(root, mirrorSandCost);

  const mirrorGlassCost = createTextNode(`${ costForNextLevel(mirror.frameQuality)[1] } glass`);
  moveNode(mirrorGlassCost, [72, 90]);
  addChildNode(root, mirrorGlassCost);

  const upgradeMirrorButton = createButtonNode("upgrade", [80, 40], "", 1);
  moveNode(upgradeMirrorButton, [216, 65]);
  addChildNode(root, upgradeMirrorButton);

  return [root, upgradeFrameButton, upgradeMirrorButton, title, frameSandCost, frameGlassCost, mirrorSandCost, mirrorGlassCost];
}

function updateCreateLabels(textIds: number[], mirror: Mirror): void
{
  let sandColour = 0xFFFFFFFF;
  let gFragColour = 0xFFFFFFFF;
  let mFragColour = 0xFFFFFFFF;
  const cost = craftCost;

  if (gameState.currencies.sand < cost[0])
  {
    sandColour = 0xFF0000FF;
  }
  if (gameState.currencies.glassFragments < cost[1])
  {
    gFragColour = 0xFF0000FF;
  }
  if (gameState.currencies[frameMetalFragment[mirror.material]] < cost[1])
  {
    mFragColour = 0xFF0000FF;
  }

  updateTextNode(textIds[0], `${ cost[0] } sand`, 1, Align.Left, sandColour);
  updateTextNode(textIds[1], `${ cost[1] } glass`, 1, Align.Left, gFragColour);
  updateTextNode(textIds[2], `${ cost[1] } ${ frameMatNames[mirror.material] }`, 1, Align.Left, mFragColour);
}

function updateUpgradeLabels(textIds: number[], upgradeFrameButton: number, upgradeMirrorButton: number, mirror: Mirror): void
{
  updateTextNode(textIds[0], getMirrorName(mirror));
  if (mirror.frameQuality === FrameQuality.Ornate)
  {
    node_enabled[upgradeFrameButton] = false;
    updateTextNode(textIds[1], `fully upgraded`, 1, Align.Left, 0xFF4d4d4d);
    updateTextNode(textIds[2], ``);
  }
  else
  {
    let sandColour = 0xFFFFFFFF;
    let fragColour = 0xFFFFFFFF;
    const cost = costForNextLevel(mirror.frameQuality);

    if (gameState.currencies.sand < cost[0])
    {
      sandColour = 0xFF0000FF;
    }
    if (gameState.currencies[frameMetalFragment[mirror.material]] < cost[1])
    {
      fragColour = 0xFF0000FF;
    }
    updateTextNode(textIds[1], `${ costForNextLevel(mirror.frameQuality)[0] } sand`, 1, Align.Left, sandColour);
    updateTextNode(textIds[2], `${ costForNextLevel(mirror.frameQuality)[1] } ${ frameMatNames[mirror.material] }`, 1, Align.Left, fragColour);
  }

  if (mirror.quality === MirrorQuality.Flawless)
  {
    node_enabled[upgradeMirrorButton] = false;
    updateTextNode(textIds[3], `fully upgraded`, 1, Align.Left, 0xFF4d4d4d);
    updateTextNode(textIds[4], ``);
  }
  else
  {
    let sandColour = 0xFFFFFFFF;
    let fragColour = 0xFFFFFFFF;
    const cost = costForNextLevel(mirror.quality);

    if (gameState.currencies.sand < cost[0])
    {
      sandColour = 0xFF0000FF;
    }
    if (gameState.currencies.glassFragments < cost[1])
    {
      fragColour = 0xFF0000FF;
    }

    updateTextNode(textIds[3], `${ costForNextLevel(mirror.quality)[0] } sand`, 1, Align.Left, sandColour);
    updateTextNode(textIds[4], `${ costForNextLevel(mirror.quality)[1] } glass`, 1, Align.Left, fragColour);
  }
}
export function updateSmithScreen(): void
{
  gl_setClear(10, 10, 10);
  bgState = 0;
  if (gameState.mirrors[1].owned)
  {
    node_enabled[brassBuyRootId] = false;
    node_enabled[brassUpgradeRootId] = true;

    const mirror = gameState.mirrors[1];
    updateUpgradeLabels(brassUpgradeTextIds, brassUpgradeFrameId, brassUpgradeMirrorId, mirror);
  }
  else
  {
    node_enabled[brassBuyRootId] = true;
    node_enabled[brassUpgradeRootId] = false;

    const mirror = gameState.mirrors[1];
    updateCreateLabels(brassCreateTextIds, mirror);
  }

  if (gameState.mirrors[2].owned)
  {
    node_enabled[steelBuyRootId] = false;
    node_enabled[steelUpgradeRootId] = true;

    const mirror = gameState.mirrors[2];
    updateUpgradeLabels(steelUpgradeTextIds, steelUpgradeFrameId, steelUpgradeMirrorId, mirror);
  }
  else
  {
    node_enabled[steelBuyRootId] = true;
    node_enabled[steelUpgradeRootId] = false;

    const mirror = gameState.mirrors[2];
    updateCreateLabels(steelCreateTextIds, mirror);
  }

  if (gameState.mirrors[3].owned)
  {
    node_enabled[silverBuyRootId] = false;
    node_enabled[silverUpgradeRootId] = true;

    const mirror = gameState.mirrors[3];
    updateUpgradeLabels(silverUpgradeTextIds, silverUpgradeFrameId, silverUpgradeMirrorId, mirror);
  }
  else
  {
    node_enabled[silverBuyRootId] = true;
    node_enabled[silverUpgradeRootId] = false;

    const mirror = gameState.mirrors[3];
    updateCreateLabels(silverCreateTextIds, mirror);
  }

  if (gameState.mirrors[4].owned)
  {
    node_enabled[goldBuyRootId] = false;
    node_enabled[goldUpgradeRootId] = true;

    const mirror = gameState.mirrors[4];
    updateUpgradeLabels(goldUpgradeTextIds, goldUpgradeFrameId, goldUpgradeMirrorId, mirror);
  }
  else
  {
    node_enabled[goldBuyRootId] = true;
    node_enabled[goldUpgradeRootId] = false;

    const mirror = gameState.mirrors[4];
    updateCreateLabels(goldCreateTextIds, mirror);
  }
}

let bgState = 0;
export function smith(now: number, delta: number): void
{
  if (bgState === 0)
  {
    fadeBackgroundTo([172, 32, 32], 2000, () => { bgState = 1; });
  }
  else
  {
    fadeBackgroundTo([10, 10, 10], 4000, () => { bgState = 0; })
  }
  const currencies = gameState.currencies;

  if (!gameState.currentEvent && !gameState.flags["tutorial_smith_01"])
  {
    gameState.flags["tutorial_smith_01"] = true;
    gameState.currentEvent = createBasicDialogEvent("You can create and upgrade mirrors here with me using the sand, glass, and metals you find during self-reflection.")
  }
  else if (!gameState.currentEvent && !gameState.flags["tutorial_smith_02"])
  {
    gameState.flags["tutorial_smith_02"] = true;
    gameState.currentEvent = createBasicDialogEvent("Upgrading the frame will strengthen the unique ability of the mirror, ya see.")
  }
  else if (!gameState.currentEvent && !gameState.flags["tutorial_smith_03"])
  {
    gameState.flags["tutorial_smith_03"] = true;
    gameState.currentEvent = createBasicDialogEvent("Where as upgrading the mirror itself will allow you to see a clearer, stronger image of yourself. Allowing you to take on stronger foes.")
  }

  updateTextNode(sandAmountId, `${ currencies.sand }`, 1, Align.Right);
  updateTextNode(glassAmountId, `${ currencies.glassFragments }`, 1, Align.Right);
  updateTextNode(brassAmountId, `${ currencies.brassFragments }`, 1, Align.Right);
  updateTextNode(steelAmountId, `${ currencies.steelFragments }`, 1, Align.Right);
  updateTextNode(silverAmountId, `${ currencies.silverFragments }`, 1, Align.Right);
  updateTextNode(goldAmountId, `${ currencies.goldFragments }`, 1, Align.Right);

  if (inputContext.fire === backButtonId)
  {
    setScene(Scenes.Camp);
  }

  let buyMirror: 0 | 1 | 2 | 3 | 4 = 0;
  let upgradeFrame: 0 | 1 | 2 | 3 | 4 = 0;
  let upgradeMirror: 0 | 1 | 2 | 3 | 4 = 0;

  if (inputContext.fire === brassBuyId)
  {
    buyMirror = 1;
  }
  else if (inputContext.fire === brassUpgradeFrameId)
  {
    upgradeFrame = 1;
  }
  else if (inputContext.fire === brassUpgradeMirrorId)
  {
    upgradeMirror = 1
  }
  else if (inputContext.fire === steelBuyId)
  {
    buyMirror = 2;
  }
  else if (inputContext.fire === steelUpgradeFrameId)
  {
    upgradeFrame = 2;
  }
  else if (inputContext.fire === steelUpgradeMirrorId)
  {
    upgradeMirror = 2;
  }
  else if (inputContext.fire === silverBuyId)
  {
    buyMirror = 3;
  }
  else if (inputContext.fire === silverUpgradeFrameId)
  {
    upgradeFrame = 3;
  }
  else if (inputContext.fire === silverUpgradeMirrorId)
  {
    upgradeMirror = 3;
  }
  else if (inputContext.fire === goldBuyId)
  {
    buyMirror = 4;
  }
  else if (inputContext.fire === goldUpgradeFrameId)
  {
    upgradeFrame = 4;
  }
  else if (inputContext.fire === goldUpgradeMirrorId)
  {
    upgradeMirror = 4;
  }

  if (buyMirror !== 0)
  {
    const mirror = gameState.mirrors[buyMirror];
    if (currencies.sand >= craftCost[0]
      && currencies.glassFragments >= craftCost[1]
      && currencies[frameMetalFragment[mirror.material]] >= craftCost[1])
    {
      currencies.sand -= craftCost[0];
      currencies.glassFragments -= craftCost[1];
      currencies[frameMetalFragment[mirror.material]] -= craftCost[1];
      mirror.owned = true;
      updateSmithScreen();
    }
  }
  else if (upgradeFrame !== 0)
  {
    const mirror = gameState.mirrors[upgradeFrame];
    const cost = costForNextLevel(mirror.frameQuality);
    if (currencies.sand >= cost[0]
      && currencies[frameMetalFragment[mirror.material]] >= cost[1])
    {
      currencies.sand -= cost[0];
      currencies[frameMetalFragment[mirror.material]] -= cost[1];
      increaseFrameQuality(mirror);
      updateSmithScreen();
    }
  }
  else if (upgradeMirror !== 0)
  {
    const mirror = gameState.mirrors[upgradeMirror];
    const cost = costForNextLevel(mirror.quality);

    if (currencies.sand >= cost[0]
      && currencies.glassFragments >= cost[1])
    {
      currencies.sand -= cost[0];
      currencies.glassFragments -= cost[1];
      increaseMirrorQuality(mirror);
      updateSmithScreen();
    }
  }
}

function increaseFrameQuality(mirror: Mirror): void
{
  if (mirror.frameQuality === FrameQuality.Tarnished)
  {
    mirror.frameQuality = FrameQuality.Polished;
  }
  else if (mirror.frameQuality === FrameQuality.Polished)
  {
    mirror.frameQuality = FrameQuality.Pristine;
  }
  else if (mirror.frameQuality === FrameQuality.Pristine)
  {
    mirror.frameQuality = FrameQuality.Ornate;
  }
}

function increaseMirrorQuality(mirror: Mirror): void
{
  if (mirror.quality === MirrorQuality.Shattered)
  {
    mirror.quality = MirrorQuality.Cracked;
  }
  else if (mirror.quality === MirrorQuality.Cracked)
  {
    mirror.quality = MirrorQuality.Imperfect;
  }
  else if (mirror.quality === MirrorQuality.Imperfect)
  {
    mirror.quality = MirrorQuality.Flawless;
  }
}