import { Scenes } from "./scene-manager";
import { adventureRootId } from "./scenes/adventure";
import { campRootId } from "./scenes/camp";
import { gemInventoryRootId } from "./scenes/gem-inventory";
import { mainMenuRootId } from "./scenes/main-menu";
import { mirrorSelectRootId } from "./scenes/mirror-select";
import { missionSelectRootId } from "./scenes/mission-select";
import { smithRootId } from "./scenes/smith";

export function getSceneRootId(scene: Scenes): number 
{
  switch (scene)
  {
    case Scenes.Adventure:
      return adventureRootId;
    case Scenes.Camp:
      return campRootId;
    case Scenes.Smith:
      return smithRootId;
    case Scenes.Gems:
      return gemInventoryRootId;
    case Scenes.MissionSelect:
      return missionSelectRootId;
    case Scenes.MirrorSelect:
      return mirrorSelectRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}