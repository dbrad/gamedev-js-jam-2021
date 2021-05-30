import { Frame, createSprite } from "./sprite-node";
import { addChildNode, createNode, node_interactive, node_renderer, node_scale, node_size, node_tag } from "../node";

import { pushQuad } from "../draw";

//#region XP Bar
const node_xp_bar_values: number[] = [];
export function createXPBarNode(scale: number = 2): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "xp-bar";
  node_renderer[nodeId] = renderXPBar;
  node_size[nodeId] = [scale * 32, scale * 4];
  node_scale[nodeId] = scale;
  node_xp_bar_values[nodeId] = 0;

  const frames: Frame[] = [{ spriteName: "empty_bar", duration: 0 }];
  const spriteId = createSprite(frames, scale);
  node_interactive[spriteId] = false;
  addChildNode(nodeId, spriteId);

  return nodeId;
}

export function updateXPBarValues(nodeId: number, value: number): void
{
  node_xp_bar_values[nodeId] = value;
}

function renderXPBar(nodeId: number): void
{
  const xp = Math.min(1, node_xp_bar_values[nodeId]);
  const scale = node_scale[nodeId];

  const maxLength = 32 * scale;
  pushQuad(0, 1 * scale, Math.ceil(maxLength * xp), 2 * scale, 0xFFe09626);
}