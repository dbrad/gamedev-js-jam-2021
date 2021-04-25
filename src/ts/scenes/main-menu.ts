import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createTextNode, moveNode, node_position, node_size, node_visible } from "../node";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { inputContext } from "../input";

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

  mainMenuTitleTextId = createTextNode("Gamedev.js Jam 2021", 4, Align.Center);
  moveNode(mainMenuTitleTextId, [screenCenterX, 50]);
  addChildNode(mainMenuRootId, mainMenuTitleTextId);

  startGameTextId = createButtonNode("new game", [200, 40]);
  moveNode(startGameTextId, [220, screenCenterY]);
  addChildNode(mainMenuRootId, startGameTextId);
  options.push(startGameTextId);

  const continueGameTextId = createButtonNode("continue", [200, 40]);
  moveNode(continueGameTextId, [220, screenCenterY + 60]);
  addChildNode(mainMenuRootId, continueGameTextId);
  options.push(continueGameTextId);
}

export function mainMenuScene(now: number, delta: number): void
{
  if (inputContext.fire === startGameTextId)
  {
    setScene(Scenes.Camp);
  }
}