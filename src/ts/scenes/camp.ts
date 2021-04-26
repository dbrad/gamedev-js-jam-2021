import { Align, pushQuad, pushSpriteAndSave } from "../draw";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_size, node_visible, updateTextNode } from "../node";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

import { arrangeMissionSelect } from "./mission-select";
import { createBasicDialogEvent } from "../room-events";
import { gameState } from "../gamestate";
import { gl_setClear } from "../gl";
import { inputContext } from "../input";
import { updateSmithScreen } from "./smith";
import { v2 } from "../v2";

export let campRootId = -1;

let sandAmountId = -1;
let glassAmountId = -1;
let brassAmountId = -1;
let steelAmountId = -1;
let silverAmountId = -1;
let goldAmountId = -1;

let option01 = -1;
let option02 = -1;
let option03 = -1;

export function setupCampScene(): void
{
  campRootId = createNode();
  node_visible[campRootId] = false;
  node_size[campRootId][0] = screenWidth;
  node_size[campRootId][1] = screenHeight;

  const fire = createSprite(
    [
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_03", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_03", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
    ], 5);
  moveNode(fire, [screenCenterX - 128, 236]);
  addChildNode(campRootId, fire);

  const player = createSprite([{ spriteName: "player_left_02", duration: 0 }], 5);
  moveNode(player, [screenCenterX - 64, 236]);
  addChildNode(campRootId, player);

  const smith = createSprite(
    [
      { spriteName: "smith_01", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
      { spriteName: "smith_03", duration: 75 },
      { spriteName: "smith_04", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
    ], 4);
  moveNode(smith, [screenCenterX - 240, 240 - 64]);
  addChildNode(campRootId, smith);

  const moon = createSprite([{ spriteName: "moon", duration: 0 }], 4);
  moveNode(moon, [16, 16]);
  addChildNode(campRootId, moon);

  const topBarSize: v2 = [350, 30];
  const topBar = createWindowNode([screenWidth - 352, 2], topBarSize);
  addChildNode(campRootId, topBar);

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

  const window = createWindowNode([452, 34], [186, 324]);
  addChildNode(campRootId, window);

  option01 = createButtonNode("delve", [170, 70], "into self-reflection");
  moveNode(option01, [8, 8]);
  addChildNode(window, option01);
  option02 = createButtonNode("smith", [170, 70], "craft + update");
  moveNode(option02, [8, 98]);
  addChildNode(window, option02);
  option03 = createButtonNode("quit", [170, 40]);
  moveNode(option03, [8, 276]);
  addChildNode(window, option03);
}

export function campScene(): void
{
  if (document.monetization && document.monetization.state === "pending")
  {
    gameState.mirrors[0].owned = false;
  }
  else if (document.monetization && document.monetization.state === "started")
  {
    if (!gameState.mirrors[0].owned)
    {
      gameState.currentEvent = createBasicDialogEvent("Thanks for supporting my game! You can now use the 'Coiled Gold Leaf Mirror'!", 750);
      gameState.mirrors[0].owned = true;
    }
  }
  else
  {
    gameState.mirrors[0].owned = false;
  }

  updateTextNode(sandAmountId, `${ gameState.currencies.sand }`, 1, Align.Right);
  updateTextNode(glassAmountId, `${ gameState.currencies.glassFragments }`, 1, Align.Right);
  updateTextNode(brassAmountId, `${ gameState.currencies.brassFragments }`, 1, Align.Right);
  updateTextNode(steelAmountId, `${ gameState.currencies.steelFragments }`, 1, Align.Right);
  updateTextNode(silverAmountId, `${ gameState.currencies.silverFragments }`, 1, Align.Right);
  updateTextNode(goldAmountId, `${ gameState.currencies.goldFragments }`, 1, Align.Right);

  pushQuad(0, 0, 640, 120, 0xFF3B2006);
  pushQuad(0, 120, 640, 80, 0xFF3B3006);
  pushQuad(0, 200, 640, 40, 0xFF3B4006);
  pushQuad(0, 240, 640, 120, 0XFF000000);

  for (let i = 0; i < 640 / 16; i++)
  {
    pushSpriteAndSave(`grass_0${ i % 3 + 1 }`, i * 16, 232);
  }

  if (inputContext.fire === option01)
  {
    // gameSetup();
    // setScene(Scenes.Adventure);
    arrangeMissionSelect();
    setScene(Scenes.MissionSelect);
  }

  if (inputContext.fire === option02)
  {
    updateSmithScreen();
    setScene(Scenes.Smith);
  }

  if (inputContext.fire === option03)
  {
    setScene(Scenes.MainMenu);
  }

}
