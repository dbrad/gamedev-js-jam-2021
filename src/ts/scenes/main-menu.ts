import { addChildNode, createNode, createSprite, createTextNode, moveNode, node_movement, node_position, node_size, node_visible } from "../node";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { Easing } from "../interpolate";

export let mainMenuRootId = -1;
let mainMenuTitleText = -1;
let titleState = 0;
export function setupMainMenuScene(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  mainMenuTitleText = createTextNode("Gamedev.js Jam 2021", 4, Align.Center, true);
  node_position[mainMenuTitleText][0] = screenCenterX;
  node_position[mainMenuTitleText][1] = 50;
  addChildNode(mainMenuRootId, mainMenuTitleText);
}
export function mainMenuScene(now: number, delta: number): void
{
  if (!node_movement.has(mainMenuTitleText))
  {
    if (titleState === 0)
    {
      moveNode(mainMenuTitleText, [screenCenterX, 60], Easing.Linear, 1000);
      titleState = 1;
    }
    else
    {
      moveNode(mainMenuTitleText, [screenCenterX, 50], Easing.Linear, 1000);
      titleState = 0;
    }
  }
}