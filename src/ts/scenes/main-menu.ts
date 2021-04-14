import { addChildNode, createNode, createSprite, createTextNode, moveNode, node_movement, node_position, node_size, node_visible } from "../node";
import { buttonHover, zzfxP } from "../zzfx";
import { screenCenterX, screenHeight, screenWidth } from "../screen";
import { subscribe, unsubscribe } from "../event";

import { Align } from "../draw";
import { Easing } from "../interpolate";
import { Key } from "../input";

export let mainMenuRootId = -1;
let mainMenuTitleTextId = -1;
let titleState = 0;

const options: number[] = []

const arrowX = screenCenterX - 110;
let selectedIndex = 0;
let selectArrowId = -1;
let arrowState = 0;
export function setupMainMenuScene(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  mainMenuTitleTextId = createTextNode("Gamedev.js Jam 2021", 4, Align.Center, true);
  node_position[mainMenuTitleTextId][0] = screenCenterX;
  node_position[mainMenuTitleTextId][1] = 50;
  addChildNode(mainMenuRootId, mainMenuTitleTextId);

  const startGameTextId = createTextNode("new game", 3, Align.Center, true);
  node_position[startGameTextId][0] = screenCenterX;
  node_position[startGameTextId][1] = 200;
  addChildNode(mainMenuRootId, startGameTextId);
  options.push(startGameTextId);

  const continueGameTextId = createTextNode("continue", 3, Align.Center, true);
  node_position[continueGameTextId][0] = screenCenterX;
  node_position[continueGameTextId][1] = 250;
  addChildNode(mainMenuRootId, continueGameTextId);
  options.push(continueGameTextId);

  selectArrowId = createTextNode(">", 3, Align.Center, true);
  node_position[selectArrowId][0] = arrowX;
  node_position[selectArrowId][1] = 200;
  addChildNode(mainMenuRootId, selectArrowId);
}

const keyboardHandler = (key: Key) =>
{
  if (key === Key.DOWN || key === Key.UP)
  {
    const selectedNodeId = options[selectedIndex];
    let pos = node_position[selectedNodeId];
    node_movement.delete(selectedNodeId);
    moveNode(selectedNodeId, [pos[0], 200 + selectedIndex * 50], Easing.Linear, 25);
    arrowState = 0;

    if (key === Key.DOWN)
      selectedIndex = Math.min(++selectedIndex, options.length - 1);
    else if (key === Key.UP)
      selectedIndex = Math.max(--selectedIndex, 0);

    zzfxP(buttonHover);
    moveNode(selectArrowId, [arrowX, 200 + (selectedIndex * 50)], Easing.Linear, 50);
  }
};

export function mainMenuTransitionIn(): Promise<void>
{
  return new Promise((resolve) =>
  {
    subscribe("key_pressed", keyboardHandler);
    resolve();
  });
}

export function mainMenuTransitionOut(): Promise<void>
{
  return new Promise((resolve) =>
  {
    unsubscribe("key_pressed", keyboardHandler);
    resolve();
  });
}
export function mainMenuScene(now: number, delta: number): void
{
  // if (!node_movement.has(mainMenuTitleTextId))
  // {
  //   if (titleState === 0)
  //   {
  //     moveNode(mainMenuTitleTextId, [screenCenterX, 60], Easing.Linear, 1000);
  //     titleState = 1;
  //   }
  //   else
  //   {
  //     moveNode(mainMenuTitleTextId, [screenCenterX, 50], Easing.Linear, 1000);
  //     titleState = 0;
  //   }
  // }

  const selectedNodeId = options[selectedIndex];
  if (!node_movement.has(selectedNodeId))
  {
    let pos = node_position[selectedNodeId];
    if (arrowState === 0)
    {
      moveNode(selectedNodeId, [pos[0], pos[1] + 4], Easing.Linear, 500);
      arrowState = 1;
    }
    else
    {
      moveNode(selectedNodeId, [pos[0], pos[1] - 4], Easing.Linear, 500);
      arrowState = 0;
    }
  }


}