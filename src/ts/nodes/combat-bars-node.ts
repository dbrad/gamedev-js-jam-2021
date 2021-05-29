import { Frame, createSprite } from "./sprite-node";
import { addChildNode, createNode, node_interactive, node_renderer, node_scale, node_size, node_tag } from "../node";

import { pushQuad } from "../draw";

const node_combat_bar_values: [number, number][] = [];
export function createCombatBarNode(scale: number = 1): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "combat-bar";
  node_renderer[nodeId] = renderCombatBar;

  node_size[nodeId] = [scale * 16, scale * 16];
  node_scale[nodeId] = scale;
  node_combat_bar_values[nodeId] = [0, 0];

  const frames: Frame[] = [{ spriteName: "combat_bars", duration: 0 }];
  const spriteId = createSprite(frames, scale);
  node_interactive[spriteId] = false;
  addChildNode(nodeId, spriteId);

  return nodeId;
}

export function updateCombatBarValues(nodeId: number, health: number, swing: number): void
{
  node_combat_bar_values[nodeId] = [health, swing];
}

function renderCombatBar(nodeId: number, now: number, delta: number): void
{
  const health = Math.max(0, node_combat_bar_values[nodeId][0]);
  const swing = Math.min(1, node_combat_bar_values[nodeId][1]);
  const scale = node_scale[nodeId];

  const maxLength = 16 * scale;
  pushQuad(0, 1 * scale, Math.ceil(maxLength * health), 2 * scale, 0xFF0000FF);
  if (swing >= 1)
  {
    pushQuad(0, 4 * scale, Math.ceil(maxLength * swing), 2 * scale, 0xFFFFFFFF);
  } else
  {
    pushQuad(0, 4 * scale, Math.ceil(maxLength * swing), 2 * scale, 0xFFAAAAAA);
  }
}