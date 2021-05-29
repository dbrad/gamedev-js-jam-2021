import { Easing, InterpolationData, createInterpolationData } from "./interpolate";
import { gl_restore, gl_save, gl_translate } from "./gl";
import { pushQuad, pushText } from "./draw";

import { assert } from "./debug";
import { inputContext } from "./input";
import { v2 } from "./v2";

let nextNodeId = 1;

export const node_renderer: ((nodeId: number, now: number, delta: number) => void)[] = [];
export const node_position: v2[] = [];
export const node_movement: Map<number, InterpolationData> = new Map();
export const node_size: v2[] = [];
export const node_scale: number[] = [];
export const node_enabled: boolean[] = [];
export const node_visible: boolean[] = [];
export const node_interactive: boolean[] = [];
export const node_tag: string[] = [];
export const node_parent: number[] = [0];
export const node_children: number[][] = [[]];

export function createNode(): number
{
  let id = nextNodeId++;

  node_children[id] = [];
  node_parent[id] = 0;
  node_children[0].push(id);

  node_size[id] = [1, 1];
  node_scale[id] = 1;
  node_position[id] = [0, 0];

  node_enabled[id] = true;
  node_visible[id] = true;
  node_interactive[id] = true;

  return id;
}

export function addChildNode(parentId: number, childId: number): void
{
  const arr = node_children[node_parent[childId]];
  let index = -1
  for (let i = 0; i < arr.length; i++)
  {
    if (arr[i] === childId)
    {
      index = i;
      break;
    }
  }
  // @ifdef DEBUG
  assert(index !== -1, `[${ childId }] This node was not present in its parrent's child list [${ parentId }]`)
  // @endif

  if (index > -1)
  {
    arr.splice(index, 1);
  }
  node_parent[childId] = parentId;
  node_children[parentId].push(childId);
}

export function moveNode(nodeId: number, pos: v2, ease: Easing = Easing.None, duration: number = 0): Promise<void>
{
  if (node_position[nodeId][0] === pos[0] && node_position[nodeId][1] === pos[1])
  {
    return Promise.resolve();
  }
  if (ease !== Easing.None && !node_movement.has(nodeId) && duration > 0)
  {
    return new Promise((resolve) =>
    {
      node_movement.set(nodeId, createInterpolationData(duration, node_position[nodeId], pos, ease, resolve));
    });
  }
  node_position[nodeId][0] = pos[0];
  node_position[nodeId][1] = pos[1];
  return Promise.resolve();
}

export function nodeSize(nodeId: number): v2
{
  const size = node_size[nodeId];
  const scale = node_scale[nodeId];
  return [size[0] * scale, size[1] * scale];
}

export function nodeInput(nodeId: number, cursorPosition: number[] = inputContext.cursor): void
{
  if (!node_enabled[nodeId] || !node_interactive[nodeId]) return;
  const position = node_position[nodeId];
  const size = nodeSize(nodeId);
  const relativePosition = [cursorPosition[0] - position[0], cursorPosition[1] - position[1]];

  if (cursorPosition[0] >= position[0]
    && cursorPosition[1] >= position[1]
    && cursorPosition[0] < position[0] + size[0]
    && cursorPosition[1] < position[1] + size[1])
  {
    inputContext.hot = nodeId;
    if (inputContext.active === nodeId)
    {
      if (!inputContext.mouseDown)
      {
        if (inputContext.hot === nodeId)
        {
          inputContext.fire = nodeId;
        }
        inputContext.active = -1;
      }
    }
    else if (inputContext.hot === nodeId)
    {
      if (inputContext.mouseDown)
      {
        inputContext.active = nodeId;
      }
    }

    const children = node_children[nodeId]
    for (const childId of children)
    {
      nodeInput(childId, relativePosition);
    }
  }
}

export function renderNode(nodeId: number, now: number, delta: number): void
{
  if (node_enabled[nodeId])
  {
    const pos = node_position[nodeId];

    gl_save();
    gl_translate(pos[0], pos[1]);

    if (node_visible[nodeId] && node_renderer[nodeId])
    {
      node_renderer[nodeId](nodeId, now, delta);
    }

    // @ifdef DEBUG
    // if (inputContext.hot === nodeId)
    // {
    //   const size = nodeSize(nodeId);
    //   pushQuad(0, 0, 1, size[1], 0xFF00ff00);
    //   pushQuad(0, 0, size[0], 1, 0xFF00ff00);
    //   pushQuad(size[0] - 1, 0, 1, size[1], 0xFF00ff00);
    //   pushQuad(0, size[1] - 1, size[0], 1, 0xFF00ff00);
    // }
    // @endif

    for (let childId of node_children[nodeId])
    {
      renderNode(childId, now, delta);
    }
    gl_restore();
  }
}