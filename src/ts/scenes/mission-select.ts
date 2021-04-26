import { Music, playMusic } from "../music";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, moveNode, node_enabled, node_size, node_visible } from "../node";
import { gameState, resetPlayer } from "../gamestate";
import { generateLevel, setDifficulty } from "../level-gen";
import { loadPlayerAbilities, resetAdventureScene } from "./adventure";
import { screenHeight, screenWidth } from "../screen";

import { arrangeMirrors } from "./mirror-select";
import { gl_setClear } from "../gl";
import { inputContext } from "../input";

export let missionSelectRootId = -1;

let select1StarId = -1;
let select2StarId = -1;
let select3StarId = -1;
let select4StarId = -1;
let select5StarId = -1;
let select6StarId = -1;
let select7StarId = -1;
let select8StarId = -1;
let select9StarId = -1;
let select10StarId = -1;

let backButtonId = -1;

export function setupMissionSelect(): void
{
  missionSelectRootId = createNode();
  node_visible[missionSelectRootId] = false;
  node_size[missionSelectRootId][0] = screenWidth;
  node_size[missionSelectRootId][1] = screenHeight;

  select1StarId = createButtonNode("Envy's Lookout", [200, 70], "Threat level: 1");
  addChildNode(missionSelectRootId, select1StarId);

  select2StarId = createButtonNode("Greed's Horde", [200, 70], "Threat level: 2");
  addChildNode(missionSelectRootId, select2StarId);

  select3StarId = createButtonNode("Lust's Den", [200, 70], "Threat level: 3");
  addChildNode(missionSelectRootId, select3StarId);

  select4StarId = createButtonNode("Gluttony's Cellar", [200, 70], "Threat level: 4");
  addChildNode(missionSelectRootId, select4StarId);

  select5StarId = createButtonNode("Sloth's Haunt", [200, 70], "Threat level: 5");
  addChildNode(missionSelectRootId, select5StarId);

  select6StarId = createButtonNode("Wrath's Lair", [200, 70], "Threat level: 6");
  addChildNode(missionSelectRootId, select6StarId);

  select7StarId = createButtonNode("Pride's Hall", [200, 70], "Threat level: 7");
  addChildNode(missionSelectRootId, select7StarId);

  select8StarId = createButtonNode("???", [200, 70], "Threat level: 8");
  addChildNode(missionSelectRootId, select8StarId);

  select9StarId = createButtonNode("???", [200, 70], "Threat level: 9");
  addChildNode(missionSelectRootId, select9StarId);

  select10StarId = createButtonNode("???", [200, 70], "Threat level: 10");
  addChildNode(missionSelectRootId, select10StarId);

  backButtonId = createButtonNode("back", [70, 40]);
  moveNode(backButtonId, [2, 2]);
  addChildNode(missionSelectRootId, backButtonId);
}

export function arrangeMissionSelect(): void
{
  gl_setClear(0, 0, 0);
  if (gameState.flags["clear_7_star"])
  {
    moveNode(select1StarId, [38, 60]);
    node_size[select1StarId] = [280, 50];

    moveNode(select2StarId, [38, 120]);
    node_size[select2StarId] = [280, 50];

    moveNode(select3StarId, [38, 180]);
    node_size[select3StarId] = [280, 50];

    moveNode(select4StarId, [38, 240]);
    node_size[select4StarId] = [280, 50]

    moveNode(select5StarId, [38, 300]);
    node_size[select5StarId] = [280, 50];

    moveNode(select6StarId, [322, 60]);
    node_size[select6StarId] = [280, 50];

    moveNode(select7StarId, [322, 120]);
    node_size[select7StarId] = [280, 50];

    moveNode(select8StarId, [322, 180]);
    node_size[select8StarId] = [280, 50];

    moveNode(select9StarId, [322, 240]);
    node_size[select9StarId] = [280, 50]

    moveNode(select10StarId, [322, 300]);
    node_size[select10StarId] = [280, 50];

    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = true;
    node_enabled[select7StarId] = true;
    node_enabled[select8StarId] = true;
    node_enabled[select9StarId] = true;
    node_enabled[select10StarId] = true;
  }
  else if (gameState.flags["clear_5_star"])
  {
    moveNode(select1StarId, [38, 60]);
    node_size[select1StarId] = [280, 60];

    moveNode(select2StarId, [322, 60]);
    node_size[select2StarId] = [280, 60];

    moveNode(select3StarId, [38, 130]);
    node_size[select3StarId] = [280, 60];

    moveNode(select4StarId, [322, 130]);
    node_size[select4StarId] = [280, 60]

    moveNode(select5StarId, [38, 200]);
    node_size[select5StarId] = [280, 60];

    moveNode(select6StarId, [322, 200]);
    node_size[select6StarId] = [280, 60];

    moveNode(select7StarId, [38, 270]);
    node_size[select7StarId] = [564, 60];

    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = true;
    node_enabled[select7StarId] = true;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
  else if (gameState.flags["clear_3_star"])
  {
    moveNode(select1StarId, [38, 60]);
    node_size[select1StarId] = [280, 70];

    moveNode(select2StarId, [322, 60]);
    node_size[select2StarId] = [280, 70];

    moveNode(select3StarId, [38, 140]);
    node_size[select3StarId] = [280, 70];

    moveNode(select4StarId, [322, 140]);
    node_size[select4StarId] = [280, 70]

    moveNode(select5StarId, [38, 220]);
    node_size[select5StarId] = [564, 70];

    node_enabled[select4StarId] = true;
    node_enabled[select5StarId] = true;
    node_enabled[select6StarId] = false;
    node_enabled[select7StarId] = false;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
  else
  {
    moveNode(select1StarId, [180, 60]);
    node_size[select1StarId] = [280, 70];

    moveNode(select2StarId, [180, 140]);
    node_size[select2StarId] = [280, 70];

    moveNode(select3StarId, [180, 220]);
    node_size[select3StarId] = [280, 70];

    node_enabled[select4StarId] = false;
    node_enabled[select5StarId] = false;
    node_enabled[select6StarId] = false;
    node_enabled[select7StarId] = false;
    node_enabled[select8StarId] = false;
    node_enabled[select9StarId] = false;
    node_enabled[select10StarId] = false;
  }
}

export function missionSelect(now: number, delta: number): void
{
  let difficulty = 0;
  switch (inputContext.fire)
  {
    case backButtonId:
      setScene(Scenes.Camp);
      return;
    case select1StarId:
      difficulty = 1;
      break;
    case select2StarId:
      difficulty = 2;
      break;
    case select3StarId:
      difficulty = 3;
      break;
    case select4StarId:
      difficulty = 4;
      break;
    case select5StarId:
      difficulty = 5;
      break;
    case select6StarId:
      difficulty = 6;
      break;
    case select7StarId:
      difficulty = 7;
      break;
    case select8StarId:
      difficulty = 8;
      break;
    case select9StarId:
      difficulty = 9;
      break;
    case select10StarId:
      difficulty = 10;
      break;
  }
  if (difficulty > 0)
  {
    setDifficulty(difficulty);

    let ownedMirrors = 0;

    if (gameState.mirrors[0].owned) ownedMirrors++;
    if (gameState.mirrors[1].owned) ownedMirrors++;
    if (gameState.mirrors[2].owned) ownedMirrors++;
    if (gameState.mirrors[3].owned) ownedMirrors++;
    if (gameState.mirrors[4].owned) ownedMirrors++;

    if (ownedMirrors > 1)
    {
      arrangeMirrors();
      setScene(Scenes.MirrorSelect);
    }
    else
    {
      generateLevel();
      resetPlayer();
      resetAdventureScene();
      loadPlayerAbilities();
      playMusic(Music.Adventure);
      setScene(Scenes.Adventure);
    }
  }
}
