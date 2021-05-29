import { Frame, createSprite, node_sprite_colour } from "./sprite-node";
import { addChildNode, createNode, moveNode, node_interactive, node_renderer, node_size, node_tag } from "../node";
import { pushQuad, pushText } from "../draw";

import { node_text } from "./text-node";

const node_ability_bar_gem: number[] = [];
const node_ability_bar_colour: number[] = [];
const node_ability_bar_values: number[] = [];

export function createAbilityBarNode(): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "ability-bar";
  node_renderer[nodeId] = renderAbilityBar;

  node_size[nodeId] = [64, 16];
  node_ability_bar_values[nodeId] = 0;
  node_ability_bar_colour[nodeId] = 0xFFFFFFFF;
  node_text[nodeId] = "Test";

  const barFrames: Frame[] = [{ spriteName: "empty_bar", duration: 0 }];
  const barId = createSprite(barFrames, 2);
  node_interactive[barId] = false;
  moveNode(barId, [16, 8]);
  addChildNode(nodeId, barId);

  const gemFrames: Frame[] = [{ spriteName: "gem", duration: 0 }];
  const gemId = createSprite(gemFrames, 1);
  node_interactive[gemId] = false;
  moveNode(gemId, [0, 0]);
  addChildNode(nodeId, gemId);
  node_ability_bar_gem[nodeId] = gemId;

  return nodeId;
}

export function updateAbilityBar(nodeId: number, label: string, colour: number, value: number): void
{
  node_text[nodeId] = label;
  node_ability_bar_colour[nodeId] = colour;
  node_sprite_colour[node_ability_bar_gem[nodeId]] = colour;
  node_ability_bar_values[nodeId] = value;
}

function renderAbilityBar(nodeId: number, now: number, delta: number): void
{
  pushText(node_text[nodeId], 16, 0);
  const value = Math.min(1, node_ability_bar_values[nodeId]);

  pushQuad(16, 10, Math.ceil(64 * value), 4, node_ability_bar_colour[nodeId]);
}