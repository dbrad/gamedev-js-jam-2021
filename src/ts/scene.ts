import { campRootId } from "./scenes/camp";
import { mainMenuRootId } from "./scenes/main-menu";

export const enum Scenes
{
  MainMenu,
  Camp,
  Game,
  GameOver
}

export let CurrentScene: Scenes = Scenes.Camp;

export function setScene(scene: Scenes): void
{
  CurrentScene = scene;
}

export function getSceneRootId(scene: Scenes): number 
{
  switch (scene)
  {
    case Scenes.Game:
    case Scenes.GameOver:
    case Scenes.Camp:
      return campRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}