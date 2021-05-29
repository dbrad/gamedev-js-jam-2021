import { createNode, nodeSize, node_position, node_renderer, node_size, node_tag } from "../node";

import { pushQuad } from "../draw";
import { v2 } from "../v2";

export const node_window_colour: number[] = [];
export function createWindowNode(pos: v2, size: v2): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "window";
  node_renderer[nodeId] = renderWindow;

  node_position[nodeId] = pos;
  node_size[nodeId] = size;
  return nodeId;
}

function renderWindow(nodeId: number, now: number, delta: number): void
{
  const size = nodeSize(nodeId);

  pushQuad(0, 0, size[0], size[1], 0xFFFFFFFF);
  if (node_window_colour[nodeId])
  {
    pushQuad(2, 2, size[0] - 4, size[1] - 4, node_window_colour[nodeId]);
  }
  else
  {
    pushQuad(2, 2, size[0] - 4, size[1] - 4, 0xFF000000);
  }
}