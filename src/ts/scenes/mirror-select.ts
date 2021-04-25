import { FrameMaterial, Mirror, frameMatSprite, getDescription, getMirrorName } from "../mirror";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_colour, node_enabled, node_interactive, node_size, node_visible, updateTextNode } from "../node";
import { gameState, resetPlayer } from "../gamestate";
import { screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { generateLevel } from "../level-gen";
import { inputContext } from "../input";
import { resetAdventureScene } from "./adventure";

export let mirrorSelectRootId = -1;

let coilMirrorId = -1;
let coilTextIds: number[] = [];

let brassMirrorId = -1;
let brassTextIds: number[] = [];

let steelMirrorId = -1;
let steelTextIds: number[] = [];

let silverMirrorId = -1;
let silverTextIds: number[] = [];

let goldMirrorId = -1;
let goldTextIds: number[] = [];

let backButtonId = -1;

export function setupMirrorSelect(): void
{
  mirrorSelectRootId = createNode();
  node_visible[mirrorSelectRootId] = false;
  node_size[mirrorSelectRootId][0] = screenWidth;
  node_size[mirrorSelectRootId][1] = screenHeight;

  [coilMirrorId, ...coilTextIds] = createMirrorInfoPanel(gameState.mirrors[0]);
  moveNode(coilMirrorId, [100, 5]);
  addChildNode(mirrorSelectRootId, coilMirrorId);

  [brassMirrorId, ...brassTextIds] = createMirrorInfoPanel(gameState.mirrors[1]);
  moveNode(brassMirrorId, [100, 75]);
  addChildNode(mirrorSelectRootId, brassMirrorId);

  [steelMirrorId, ...steelTextIds] = createMirrorInfoPanel(gameState.mirrors[2]);
  moveNode(steelMirrorId, [100, 145]);
  addChildNode(mirrorSelectRootId, steelMirrorId);

  [silverMirrorId, ...silverTextIds] = createMirrorInfoPanel(gameState.mirrors[3]);
  moveNode(silverMirrorId, [100, 215]);
  addChildNode(mirrorSelectRootId, silverMirrorId);

  [goldMirrorId, ...goldTextIds] = createMirrorInfoPanel(gameState.mirrors[4]);
  moveNode(goldMirrorId, [100, 285]);
  addChildNode(mirrorSelectRootId, goldMirrorId);

  backButtonId = createButtonNode("back", [70, 40]);
  moveNode(backButtonId, [2, 2])
  addChildNode(mirrorSelectRootId, backButtonId);
}

function createMirrorInfoPanel(mirror: Mirror): number[]
{
  const root = createWindowNode([0, 0], [440, 60]);
  const sprite = createSprite([{ spriteName: frameMatSprite[mirror.material], duration: 0 }], 2);
  moveNode(sprite, [14, 14]);
  node_interactive[sprite] = false;
  addChildNode(root, sprite);

  const frameName = createTextNode(getMirrorName(mirror), 1);
  moveNode(frameName, [60, 4]);
  node_interactive[frameName] = false;
  addChildNode(root, frameName);

  const description = getDescription(mirror);
  const statLine1 = createTextNode(description[0], 1);
  moveNode(statLine1, [60, 18]);
  node_interactive[statLine1] = false;
  addChildNode(root, statLine1);

  const statLine2 = createTextNode(description[1], 1);
  moveNode(statLine2, [60, 28]);
  node_interactive[statLine2] = false;
  addChildNode(root, statLine2);

  const statLine3 = createTextNode(description[2], 1);
  moveNode(statLine3, [60, 38]);
  node_interactive[statLine3] = false;
  addChildNode(root, statLine3);

  const special = createTextNode(description[3], 1, Align.Left, 0xFF888888);
  moveNode(special, [60, 48]);
  node_interactive[special] = false;
  addChildNode(root, special);

  return [root, statLine1, statLine2, statLine3, special];
}

export function arrangeMirrors(): void
{
  let y = 5;
  if (gameState.mirrors[0].owned)
  {
    node_enabled[coilMirrorId] = true;
    moveNode(coilMirrorId, [100, y]);
    y += 70;

    const description = getDescription(gameState.mirrors[0]);
    for (const [i, d] of description.entries()) updateTextNode(coilTextIds[i], d);
  }
  else
  {
    node_enabled[coilMirrorId] = false;
  }

  if (gameState.mirrors[1].owned)
  {
    node_enabled[brassMirrorId] = true;
    moveNode(brassMirrorId, [100, y]);
    y += 70;

    const description = getDescription(gameState.mirrors[1]);
    for (const [i, d] of description.entries()) updateTextNode(coilTextIds[i], d);
  }
  else
  {
    node_enabled[brassMirrorId] = false;
  }

  if (gameState.mirrors[2].owned)
  {
    node_enabled[steelMirrorId] = true;
    moveNode(steelMirrorId, [100, y]);
    y += 70;

    const description = getDescription(gameState.mirrors[2]);
    for (const [i, d] of description.entries()) updateTextNode(coilTextIds[i], d);
  }
  else
  {
    node_enabled[steelMirrorId] = false;
  }

  if (gameState.mirrors[3].owned)
  {
    node_enabled[silverMirrorId] = true;
    moveNode(silverMirrorId, [100, y]);
    y += 70;

    const description = getDescription(gameState.mirrors[3]);
    for (const [i, d] of description.entries()) updateTextNode(coilTextIds[i], d);
  }
  else
  {
    node_enabled[silverMirrorId] = false;
  }

  if (gameState.mirrors[4].owned)
  {
    node_enabled[goldMirrorId] = true;
    moveNode(goldMirrorId, [100, y]);
    y += 70;

    const description = getDescription(gameState.mirrors[4]);
    for (const [i, d] of description.entries()) updateTextNode(coilTextIds[i], d);
  }
  else
  {
    node_enabled[goldMirrorId] = false;
  }
}

export function mirrorSelect(now: number, delta: number): void
{
  if (inputContext.fire === backButtonId)
  {
    setScene(Scenes.MissionSelect);
  }

  if (inputContext.hot === coilMirrorId)
  {
    node_colour[coilMirrorId] = 0xFF2d2d2d;
  } else
  {
    node_colour[coilMirrorId] = 0xFF000000;
  }

  if (inputContext.hot === brassMirrorId)
  {
    node_colour[brassMirrorId] = 0xFF2d2d2d;
  } else
  {
    node_colour[brassMirrorId] = 0xFF000000;
  }

  if (inputContext.hot === steelMirrorId)
  {
    node_colour[steelMirrorId] = 0xFF2d2d2d;
  } else
  {
    node_colour[steelMirrorId] = 0xFF000000;
  }

  if (inputContext.hot === silverMirrorId)
  {
    node_colour[silverMirrorId] = 0xFF2d2d2d;
  } else
  {
    node_colour[silverMirrorId] = 0xFF000000;
  }

  if (inputContext.hot === goldMirrorId)
  {
    node_colour[goldMirrorId] = 0xFF2d2d2d;
  } else
  {
    node_colour[goldMirrorId] = 0xFF000000;
  }

  let mirrorSelected = false;
  if (inputContext.fire === coilMirrorId)
  {
    gameState.equippedMirror = FrameMaterial.Coil;
    mirrorSelected = true;
  }
  else if (inputContext.fire === brassMirrorId)
  {
    gameState.equippedMirror = FrameMaterial.Brass;
    mirrorSelected = true;
  }
  else if (inputContext.fire === steelMirrorId)
  {
    gameState.equippedMirror = FrameMaterial.Steel;
    mirrorSelected = true;
  }
  else if (inputContext.fire === silverMirrorId)
  {
    gameState.equippedMirror = FrameMaterial.Silver;
    mirrorSelected = true;
  }
  else if (inputContext.fire === goldMirrorId)
  {
    gameState.equippedMirror = FrameMaterial.Gold;
    mirrorSelected = true;
  }

  if (mirrorSelected)
  {
    mirrorSelected = false;
    generateLevel();
    resetAdventureScene();
    resetPlayer();
    setScene(Scenes.Adventure);
  }
}