import { Mirror, craftCost, frameMatNames, frameMatSprite, getMirrorName } from "../mirror";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_enabled, node_interactive, node_size, node_visible } from "../node";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { gameState } from "../gamestate";
import { gl_setClear } from "../gl";
import { inputContext } from "../input";

export let smithRootId = -1;

let backButtonId = -1;

let brassBuyRootId = -1;
let brassBuyId = -1;

let brassUpgradeRootId = -1;
let brassTextIds: number[] = [];
let brassUpgradeFrameId = -1;
let brassUpgradeMirrorId = -1;

let steelBuyRootId = -1;
let steelBuyId = -1;

let steelUpgradeRootId = -1;
let steelTextIds: number[] = [];
let steelUpgradeFrameId = -1;
let steelUpgradeMirrorId = -1;

let silverBuyRootId = -1;
let silverBuyId = -1;

let silverUpgradeRootId = -1;
let silverTextIds: number[] = [];
let silverUpgradeFrameId = -1;
let silverUpgradeMirrorId = -1;

let goldBuyRootId = -1;
let goldBuyId = -1;

let goldUpgradeRootId = -1;
let goldTextIds: number[] = [];
let goldUpgradeFrameId = -1;
let goldUpgradeMirrorId = -1;

export function setupSmithScene(): void
{
  smithRootId = createNode();
  node_visible[smithRootId] = false;
  node_size[smithRootId][0] = screenWidth;
  node_size[smithRootId][1] = screenHeight;


  const title = createTextNode("The Smithy", 2, Align.Center);
  moveNode(title, [screenCenterX, 2]);
  addChildNode(smithRootId, title);

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

  [brassBuyRootId, brassBuyId] = createSmithingPanel(gameState.mirrors[1]);
  moveNode(brassBuyRootId, [15, 90]);
  addChildNode(smithRootId, brassBuyRootId);

  [brassUpgradeRootId, brassUpgradeFrameId, brassUpgradeMirrorId, ...brassTextIds] = upgradeSmithingPanel(gameState.mirrors[1]);
  moveNode(brassUpgradeRootId, [15, 90]);
  addChildNode(smithRootId, brassUpgradeRootId);


  [steelBuyRootId, steelBuyId] = createSmithingPanel(gameState.mirrors[2]);
  moveNode(steelBuyRootId, [325, 90]);
  addChildNode(smithRootId, steelBuyRootId);

  [steelUpgradeRootId, steelUpgradeFrameId, steelUpgradeMirrorId, ...steelTextIds] = upgradeSmithingPanel(gameState.mirrors[2]);
  moveNode(steelUpgradeRootId, [325, 90]);
  addChildNode(smithRootId, steelUpgradeRootId);


  [silverBuyRootId, silverBuyId] = createSmithingPanel(gameState.mirrors[3]);
  moveNode(silverBuyRootId, [15, 220]);
  addChildNode(smithRootId, silverBuyRootId);

  [silverUpgradeRootId, silverUpgradeFrameId, silverUpgradeMirrorId, ...silverTextIds] = upgradeSmithingPanel(gameState.mirrors[3]);
  moveNode(silverUpgradeRootId, [15, 220]);
  addChildNode(smithRootId, silverUpgradeRootId);


  [goldBuyRootId, goldBuyId] = createSmithingPanel(gameState.mirrors[4]);
  moveNode(goldBuyRootId, [325, 220]);
  addChildNode(smithRootId, goldBuyRootId);

  [goldUpgradeRootId, goldUpgradeFrameId, goldUpgradeMirrorId, ...goldTextIds] = upgradeSmithingPanel(gameState.mirrors[4]);
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

  const craftingCost = createTextNode("crafting cost:");
  addChildNode(root, craftingCost);

  const sandCost = createTextNode(`${ craftCost[0] } sand`);
  addChildNode(root, sandCost);

  const glassCost = createTextNode(`${ craftCost[1] } glass fragments`);
  addChildNode(root, glassCost);

  const metalCost = createTextNode(`${ craftCost[1] } ${ frameMatNames[mirror.material] } fragments`);
  addChildNode(root, metalCost);

  const createButton = createButtonNode("Create", [120, 40]);
  addChildNode(root, createButton);

  return [root, createButton];
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



  const frameUpgradeCost = createTextNode("upgrade frame:");
  addChildNode(root, frameUpgradeCost);

  const frameSandCost = createTextNode(`${ craftCost[0] } sand`);
  addChildNode(root, frameSandCost);

  const frameGlassCost = createTextNode(`${ craftCost[1] } ${ frameMatNames[mirror.material] } fragments`);
  addChildNode(root, frameGlassCost);

  const upgradeFrameButton = createButtonNode("upgrade", [120, 40]);
  addChildNode(root, upgradeFrameButton);



  const mirrorUpgradeCost = createTextNode("upgrade mirror:");
  addChildNode(root, mirrorUpgradeCost);

  const mirrorSandCost = createTextNode(`${ craftCost[0] } sand`);
  addChildNode(root, mirrorSandCost);

  const mirrorGlassCost = createTextNode(`${ craftCost[1] } glass fragments`);
  addChildNode(root, mirrorGlassCost);

  const upgradeMirrorButton = createButtonNode("upgrade", [120, 40]);
  addChildNode(root, upgradeMirrorButton);

  return [root, upgradeFrameButton, upgradeMirrorButton, title, frameSandCost, frameGlassCost, mirrorSandCost, mirrorGlassCost];
}

export function updateSmithScreen(): void
{
  gl_setClear(170, 32, 32);

  if (gameState.mirrors[1].owned)
  {
    node_enabled[brassBuyRootId] = false;
    node_enabled[brassUpgradeRootId] = true;
  }
  else
  {
    node_enabled[brassBuyRootId] = true;
    node_enabled[brassUpgradeRootId] = false;
  }

  if (gameState.mirrors[2].owned)
  {
    node_enabled[steelBuyRootId] = false;
    node_enabled[steelUpgradeRootId] = true;
  }
  else
  {
    node_enabled[steelBuyRootId] = true;
    node_enabled[steelUpgradeRootId] = false;
  }

  if (gameState.mirrors[3].owned)
  {
    node_enabled[silverBuyRootId] = false;
    node_enabled[silverUpgradeRootId] = true;
  }
  else
  {
    node_enabled[silverBuyRootId] = true;
    node_enabled[silverUpgradeRootId] = false;
  }

  if (gameState.mirrors[4].owned)
  {
    node_enabled[goldBuyRootId] = false;
    node_enabled[goldUpgradeRootId] = true;
  }
  else
  {
    node_enabled[goldBuyRootId] = true;
    node_enabled[goldUpgradeRootId] = false;
  }
}

export function smith(now: number, delta: number): void
{
  if (inputContext.fire === backButtonId)
  {
    setScene(Scenes.Camp);
  }

  if (inputContext.fire === brassBuyId)
  {

  }
  else if (inputContext.fire === brassUpgradeFrameId)
  {

  }
  else if (inputContext.fire === brassUpgradeMirrorId)
  {

  }
  else if (inputContext.fire === steelBuyId)
  {

  }
  else if (inputContext.fire === steelUpgradeFrameId)
  {

  }
  else if (inputContext.fire === steelUpgradeMirrorId)
  {

  }
  else if (inputContext.fire === silverBuyId)
  {

  }
  else if (inputContext.fire === silverUpgradeFrameId)
  {

  }
  else if (inputContext.fire === silverUpgradeMirrorId)
  {

  }
  else if (inputContext.fire === goldBuyId)
  {

  }
  else if (inputContext.fire === goldUpgradeFrameId)
  {

  }
  else if (inputContext.fire === goldUpgradeMirrorId)
  {

  }
}
