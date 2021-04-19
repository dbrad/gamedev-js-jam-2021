import { Scenes } from "./scene-manager";
import { adventureRootId } from "./scenes/adventure";
import { campRootId } from "./scenes/camp";
import { mainMenuRootId } from "./scenes/main-menu";

export function getSceneRootId(scene: Scenes): number 
{
  switch (scene)
  {
    case Scenes.Adventure:
      return adventureRootId;
    case Scenes.Camp:
      return campRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}