import { gameState } from "./gamestate";

export const enum Scenes
{
  MainMenu,
  Camp,
  Adventure,
}

export let CurrentScene: Scenes = Scenes.MainMenu;

export function setScene(scene: Scenes): void
{
  CurrentScene = scene;
  gameState.flags["clear_input"] = true
}