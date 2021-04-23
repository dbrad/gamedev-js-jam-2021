import { Easing, createInterpolationData } from "./interpolate";

import { gameState } from "./gamestate";

export const enum Scenes
{
  MainMenu,
  Camp,
  Adventure,
  MissionSelect
}

export let CurrentScene: Scenes = Scenes.MainMenu;

export function setScene(scene: Scenes): void
{
  gameState.transition = createInterpolationData(250, [0], [255], Easing.EaseOutQuad, () =>
  {
    CurrentScene = scene;
    gameState.flags["clear_input"] = true;

    gameState.transition = createInterpolationData(250, [255], [0], Easing.EaseOutQuad, () =>
    {
      gameState.transition = null;
    });
  });
}