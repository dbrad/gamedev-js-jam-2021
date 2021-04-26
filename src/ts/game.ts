import { Align, pushQuad, pushText } from "./draw";
import { CurrentScene, Scenes } from "./scene-manager";
import { adventure, setupAdventureScene } from "./scenes/adventure";
import { campScene, setupCampScene } from "./scenes/camp";
import { dialogSystem, dialogSystemRootId, setupDialogScene } from "./scenes/dialog";
import { gameState, stepBackGroundFade } from "./gamestate";
import { gemInventory, setupGemInventory } from "./scenes/gem-inventory";
import { gl_clear, gl_flush, gl_getContext, gl_init, gl_setClear } from "./gl"
import { initializeInput, inputContext } from "./input";
import { mainMenuScene, setupMainMenuScene } from "./scenes/main-menu";
import { mirrorSelect, setupMirrorSelect } from "./scenes/mirror-select";
import { missionSelect, setupMissionSelect } from "./scenes/mission-select";
import { moveNode, nodeInput, node_movement, renderNode } from "./node";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "./screen";
import { setupSmithScene, smith } from "./scenes/smith";

import { colourToHex } from "./util";
import { getSceneRootId } from "./scene";
import { interpolate } from "./interpolate";
import { loadAsset } from "./asset";
import { setupMusic } from "./music";
import { setupSoundEffects } from "./zzfx";
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
  await loadAsset("sheet");

  let then: number;
  let delta: number;
  let currentSceneRootId = -1;

  let playing = false;
  let playGame = () =>
  {
    playing = true;
    canvas.removeEventListener("pointerdown", playGame);
    canvas.removeEventListener("touchstart", playGame);

    initializeInput(canvas);

    setupMusic();
    setupSoundEffects();
    setupMainMenuScene();
    setupCampScene();
    setupSmithScene();
    setupGemInventory();
    setupMissionSelect();
    setupMirrorSelect();
    setupAdventureScene();
    setupDialogScene();
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
      stepBackGroundFade(now);

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

      if (!gameState.transition)
      {
        if (gameState.currentEvent)
        {
          nodeInput(dialogSystemRootId)
        }
        else
        {
          nodeInput(currentSceneRootId)
        }
      }

      switch (CurrentScene)
      {
        case Scenes.MainMenu:
          mainMenuScene(now, delta);
          break;
        case Scenes.Camp:
          campScene();
          break;
        case Scenes.Smith:
          smith(now, delta);
          break;
        case Scenes.Gems:
          gemInventory(now, delta);
          break;
        case Scenes.Adventure:
          adventure(now, delta);
          break;
        case Scenes.MissionSelect:
          missionSelect(now, delta);
          break;
        case Scenes.MirrorSelect:
          mirrorSelect(now, delta);
          break;
      }

      renderNode(currentSceneRootId, now, delta);

      if (gameState.currentEvent)
      {
        dialogSystem(now, delta);
        renderNode(dialogSystemRootId, now, delta);
      }

      if (gameState.transition)
      {
        let i = interpolate(now, gameState.transition);
        const colour = colourToHex(i.values[0], 0, 0, 0);
        pushQuad(0, 0, screenWidth + 2, screenHeight + 2, colour);
      }

      inputContext.fire = -1;

      if (gameState.flags["clear_input"])
      {
        inputContext.hot = -1;
        inputContext.active = -1;
        inputContext.mouseDown = false;
        gameState.flags["clear_input"] = false;
      }
    }
    else
    {
      pushText("TOUCH TO START", screenCenterX, screenCenterY - 20, { scale: 5, textAlign: Align.Center });
    }

    gl_flush();

    // @ifdef DEBUG
    // tickStats(delta, now);
    // gl_flush();
    // @endif

    window.requestAnimationFrame(loop);
  };

  gl_setClear(0, 0, 0);
  then = window.performance.now();
  window.requestAnimationFrame(loop);
});