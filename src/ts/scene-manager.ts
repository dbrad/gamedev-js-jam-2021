export const enum Scenes
{
  MainMenu,
  Camp,
  Game,
  GameOver
}

export let CurrentScene: Scenes = Scenes.MainMenu;

export function setScene(scene: Scenes): void
{
  CurrentScene = scene;
}