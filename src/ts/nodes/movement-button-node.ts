import { Frame, createSprite } from "./sprite-node";
import { addChildNode, createNode, moveNode, nodeSize, node_interactive, node_renderer, node_size, node_tag } from "../node";

import { pushQuad } from "../draw";

export enum Direction
{
  Up,
  Right,
  Down,
  Left
}
export function createMovementButtonNode(direction: Direction): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "movement-button";
  node_renderer[nodeId] = renderMovementButton;

  node_size[nodeId] = [32, 32];

  let dirStr = "up";
  if (direction === Direction.Down)
    dirStr = "down";
  else if (direction === Direction.Left)
    dirStr = "left";
  else if (direction === Direction.Right)
    dirStr = "right";

  let frames: Frame[] = [
    { spriteName: `${ dirStr }_arrow_01`, duration: 250 },
    { spriteName: `${ dirStr }_arrow_02`, duration: 250 },
    { spriteName: `${ dirStr }_arrow_03`, duration: 250 },
  ];

  const spriteId = createSprite(frames);
  node_interactive[spriteId] = false;
  moveNode(spriteId, [8, 8]);
  addChildNode(nodeId, spriteId);

  return nodeId;
}

function renderMovementButton(nodeId: number, now: number, delta: number): void
{
  const size = nodeSize(nodeId);

  pushQuad(0, 0, size[0], size[1], 0xFFFFFFFF);
  pushQuad(2, 2, size[0] - 4, size[1] - 4, 0xFF000000);
}