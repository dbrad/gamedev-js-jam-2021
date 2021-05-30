import { AbilityDescription, Gem, GemName, GemType } from "../gameplay/ability";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createNode, moveNode, node_enabled, node_size, node_visible } from "../node";
import { createTextNode, updateTextNode } from "../nodes/text-node";
import { screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { createButtonNode } from "../nodes/button-node";
import { createWindowNode } from "../nodes/window-node";
import { gameState } from "../gameplay/gamestate";
import { gl_setClear } from "../gl";
import { inputContext } from "../input";

export let gemInventoryRootId = -1;

type GemPanel = {
  rootId: number,
  nameId: number,
  rankId: number,
  descriptionId: number
}

let gemPanels: GemPanel[] = [];
let backButtonId = -1;

export function setupGemInventory(): void
{
  gemInventoryRootId = createNode();
  node_visible[gemInventoryRootId] = false;
  node_size[gemInventoryRootId][0] = screenWidth;
  node_size[gemInventoryRootId][1] = screenHeight;

  backButtonId = createButtonNode("back", [70, 30]);
  moveNode(backButtonId, [2, 2])
  addChildNode(gemInventoryRootId, backButtonId);

  for (let g = 0; g < 7; g++)
  {
    const rootId = createWindowNode([95, 2 + 50 * g], [450, 40]);
    addChildNode(gemInventoryRootId, rootId);

    const nameId = createTextNode("");
    moveNode(nameId, [4, 4]);
    addChildNode(rootId, nameId);

    const rankId = createTextNode("");
    moveNode(rankId, [4, 14]);
    addChildNode(rootId, rankId);

    const descriptionId = createTextNode("");
    moveNode(descriptionId, [4, 24]);
    addChildNode(rootId, descriptionId);

    gemPanels.push({ rootId, nameId, rankId, descriptionId });
  }
}

export function gemInventory(now: number, delta: number): void
{
  gl_setClear(0, 0, 0);
  if (inputContext.fire === backButtonId)
  {
    setScene(Scenes.Camp);
  }

  for (const panel of gemPanels)
  {
    node_enabled[panel.rootId] = false;
  }

  let index = 0;
  for (const gemIndex of [0, 1, 2, 3, 4, 5, 6])
  {
    const gem: Gem = gameState.gems[gemIndex as GemType];
    if (gem && gem.owned)
    {
      const gemPanel = gemPanels[index];
      node_enabled[gemPanel.rootId] = true;
      updateTextNode(gemPanel.nameId, GemName[gem.type]);
      updateTextNode(gemPanel.rankId, `Level: ${ gem.level }`);
      updateTextNode(gemPanel.descriptionId, AbilityDescription[gem.abilitiyType], 1, Align.Left, 0xFF6D6D6D);
      index++;
    }
  }
  if (index === 0)
  {

  }
}