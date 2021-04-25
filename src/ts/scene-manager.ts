import { Easing, createInterpolationData } from "./interpolate";

import { gameState } from "./gamestate";
import { saveObject } from "./storage";

export const enum Scenes
{
  MainMenu,
  Camp,
  Smith,
  Adventure,
  MissionSelect,
  MirrorSelect
}

export let CurrentScene: Scenes = Scenes.MainMenu;

function replacer(key: string, value: any): any
{
  if (key == "currentLevel") return undefined;
  else if (key == "currentEvent") return undefined;
  else if (key == "player") return undefined;
  else if (key == "transition") return undefined;
  else return value;
}

export function setScene(scene: Scenes): void
{
  gameState.transition = createInterpolationData(250, [0], [255], Easing.EaseOutQuad, () =>
  {
    CurrentScene = scene;
    const save = JSON.parse(JSON.stringify(gameState, replacer));
    saveObject("f1", save);
    gameState.flags["clear_input"] = true;

    gameState.transition = createInterpolationData(250, [255], [0], Easing.EaseOutQuad, () =>
    {
      gameState.transition = null;
    });
  });
}