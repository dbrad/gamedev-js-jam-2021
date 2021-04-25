import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createSprite, createWindowNode, moveNode, node_size, node_visible } from "../node";
import { pushQuad, pushSpriteAndSave } from "../draw";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

import { arrangeMissionSelect } from "./mission-select";
import { inputContext } from "../input";
import { updateSmithScreen } from "./smith";

export let campRootId = -1;
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

  const window = createWindowNode([420, 4], [186, 352]);
  addChildNode(campRootId, window);

  option01 = createButtonNode("delve", [170, 70], "into self-reflection");
  moveNode(option01, [8, 8]);
  addChildNode(window, option01);
  option02 = createButtonNode("smith", [170, 70], "craft + update");
  moveNode(option02, [8, 98]);
  addChildNode(window, option02);
  option03 = createButtonNode("quit", [170, 40]);
  moveNode(option03, [8, 304]);
  addChildNode(window, option03);
}

export function campScene(): void
{
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
