import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createTextNode, moveNode, node_enabled, node_position, node_size, node_visible } from "../node";
import { createChoiceDialogEvent, createEventChoice } from "../room-events";
import { gameState, loadGameState, resetGameState } from "../gamestate";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { gl_setClear } from "../gl";
import { hasObject } from "../storage";
import { inputContext } from "../input";
import { playCampMusic } from "../music";

export let mainMenuRootId = -1;
let mainMenuTitleTextId = -1;
let startGameButtonId = -1;
let continueGameButtonId = -1;

const options: number[] = []
export function setupMainMenuScene(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  mainMenuTitleTextId = createTextNode("Rogue Reflections", 4, Align.Center);
  moveNode(mainMenuTitleTextId, [screenCenterX, 50]);
  addChildNode(mainMenuRootId, mainMenuTitleTextId);

  mainMenuTitleTextId = createTextNode("gamedev.js 2021 jam");
  moveNode(mainMenuTitleTextId, [4, screenHeight - 22]);
  addChildNode(mainMenuRootId, mainMenuTitleTextId);

  mainMenuTitleTextId = createTextNode("entry by david brad (c) 2021");
  moveNode(mainMenuTitleTextId, [4, screenHeight - 12]);
  addChildNode(mainMenuRootId, mainMenuTitleTextId);

  startGameButtonId = createButtonNode("new game", [200, 40]);
  moveNode(startGameButtonId, [220, screenCenterY + 60]);
  addChildNode(mainMenuRootId, startGameButtonId);
  options.push(startGameButtonId);

  continueGameButtonId = createButtonNode("continue", [200, 40]);
  moveNode(continueGameButtonId, [220, screenCenterY]);
  addChildNode(mainMenuRootId, continueGameButtonId);
  options.push(continueGameButtonId);
}

export function mainMenuScene(now: number, delta: number): void
{
  gl_setClear(0, 0, 0);

  node_enabled[continueGameButtonId] = hasObject("f1");

  if (inputContext.fire === startGameButtonId)
  {
    if (hasObject("f1"))
    {
      const yes = createEventChoice("yes", () =>
      {
        resetGameState();
        setScene(Scenes.Camp);
        playCampMusic();

      });
      const no = createEventChoice("no", () => { });
      gameState.currentEvent = createChoiceDialogEvent([yes, no], "A save file already exists. All progress will be lost, do you want to start a new file?");
    }
    else
    {
      resetGameState();
      setScene(Scenes.Camp);
      playCampMusic();

    }
  }

  if (inputContext.fire === continueGameButtonId)
  {
    loadGameState();
    setScene(Scenes.Camp);
    playCampMusic();
  }
}