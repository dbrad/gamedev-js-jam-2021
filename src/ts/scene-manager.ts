import { Easing, createInterpolationData } from "./interpolate";
import { gameState, saveGameState } from "./gamestate";

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

export function setScene(scene: Scenes): void
{
  gameState.transition = createInterpolationData(250, [0], [255], Easing.EaseOutQuad, () =>
  {
    CurrentScene = scene;
    saveGameState();
    gameState.flags["clear_input"] = true;

    gameState.transition = createInterpolationData(250, [255], [0], Easing.EaseOutQuad, () =>
    {
      gameState.transition = null;
    });
  });
}