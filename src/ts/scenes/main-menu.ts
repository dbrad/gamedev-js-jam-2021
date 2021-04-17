import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createTextNode, moveNode, node_movement, node_position, node_size, node_visible } from "../node";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { Align, pushQuad } from "../draw";
import { inputContext } from "../input";
import { gameSetup } from "./mission-select";
import { gameState } from "../gamestate";

export let mainMenuRootId = -1;
let mainMenuTitleTextId = -1;
let startGameTextId = -1;

const options: number[] = []
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

  startGameTextId = createButtonNode("new game", [220, screenCenterY], [200, 40]);
  addChildNode(mainMenuRootId, startGameTextId);
  options.push(startGameTextId);

  const continueGameTextId = createButtonNode("continue", [220, screenCenterY + 60], [200, 40]);
  addChildNode(mainMenuRootId, continueGameTextId);
  options.push(continueGameTextId);
}

export function mainMenuTransitionIn(): Promise<void>
{
  return new Promise((resolve) =>
  {
    resolve();
  });
}

export function mainMenuTransitionOut(): Promise<void>
{
  return new Promise((resolve) =>
  {
    resolve();
  });
}
export function mainMenuScene(now: number, delta: number): void
{
  if (inputContext.fire === startGameTextId)
  {
    gameSetup();
    //setScene(Scenes.Camp);
  }
  for (let y = 0; y < 72; y++)
  {
    for (let x = 0; x < 110; x++)
    {
      let qx = x * 2 - 8;
      let qy = y * 2 + 180;
      let col = gameState.currentMap[y * 110 + x] === 2 ? 0xFFFFFFFF : gameState.currentMap[y * 110 + x] === 1 ? 0xFFBBBBBB : 0xFF000000;
      pushQuad(qx, qy, 2, 2, col);
    }
  }
}