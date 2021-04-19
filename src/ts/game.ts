import { Align, pushText } from "./draw";
import { CurrentScene, Scenes } from "./scene-manager";
import { adventure, setupAdventureScene } from "./scenes/adventure";
import { campScene, setupCampScene } from "./scenes/camp";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl"
import { initializeInput, inputContext } from "./input";
import { mainMenuScene, mainMenuTransitionIn, setupMainMenuScene } from "./scenes/main-menu";
import { moveNode, nodeInput, node_movement, renderNode } from "./node";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "./screen";

import { getSceneRootId } from "./scene";
import { interpolate } from "./interpolate";
import { loadAsset } from "./asset";
import { showDialog } from "./dialog";
import { tickStats } from "./stats";
import { v2 } from "./v2";

window.addEventListener(`load`, async () =>
{
  const canvas = document.querySelector(`canvas`);
  // @ifdef DEBUG
  if (!canvas) throw `Unable to find canvas element on index.html`;
  // @endif
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  let context = gl_getContext(canvas);
  gl_init(context);
  initializeInput(canvas);

  await loadAsset("sheet");

  setupMainMenuScene();
  setupCampScene();
  setupAdventureScene();

  let then: number;
  let delta: number;
  let currentSceneRootId = -1;

  let playing = false;
  let playGame = () =>
  {
    playing = true;
    canvas.removeEventListener("pointerdown", playGame);
    canvas.removeEventListener("touchstart", playGame);
  };
  canvas.addEventListener("pointerdown", playGame);
  canvas.addEventListener("touchstart", playGame);

  const loop = (now: number) =>
  {
    delta = now - then;
    then = now;
    gl_clear();

    if (playing)
    {
      for (let [childId, interpolationData] of node_movement)
      {
        let i = interpolate(now, interpolationData);
        moveNode(childId, i.values as v2);
        if (i.done)
        {
          moveNode(childId, i.values as v2);
          node_movement.delete(childId);
        }
      }
      currentSceneRootId = getSceneRootId(CurrentScene);

      nodeInput(currentSceneRootId)

      switch (CurrentScene)
      {
        case Scenes.MainMenu:
          mainMenuScene(now, delta);
          break;
        case Scenes.Camp:
          campScene();
          break;
        case Scenes.Adventure:
          adventure(now, delta);
          break;
      }

      renderNode(currentSceneRootId, now, delta);
      // showDialog("Hello little reflection... Still have your wits about you, eh?", 3000, now, "The Smith");

      inputContext.fire = -1;
    }
    else
    {
      pushText("TOUCH TO START", screenCenterX, screenCenterY, { scale: 5, textAlign: Align.Center });
    }

    gl_flush();
    // @ifdef DEBUG
    tickStats(delta, now);
    gl_flush();
    // @endif

    window.requestAnimationFrame(loop);
  };

  // await mainMenuTransitionIn();
  gl_setClear(0, 0, 0);
  then = window.performance.now();
  window.requestAnimationFrame(loop);
});