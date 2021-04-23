import { Scenes } from "./scene-manager";
import { adventureRootId } from "./scenes/adventure";
import { campRootId } from "./scenes/camp";
import { mainMenuRootId } from "./scenes/main-menu";
import { missionSelectRootId } from "./scenes/mission-select";

export function getSceneRootId(scene: Scenes): number 
{
  switch (scene)
  {
    case Scenes.Adventure:
      return adventureRootId;
    case Scenes.Camp:
      return campRootId;
    case Scenes.MissionSelect:
      return missionSelectRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}