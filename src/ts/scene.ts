import { Scenes } from "./scene-manager";
import { campRootId } from "./scenes/camp";
import { mainMenuRootId } from "./scenes/main-menu";

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