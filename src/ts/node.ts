import { Align, parseText, pushQuad, pushSprite, pushSpriteAndSave, pushText, textHeight, textWidth } from "./draw";
import { Easing, InterpolationData, createInterpolationData } from "./interpolate";
import { buttonHover, zzfxP } from "./zzfx";
import { cursor, inputContext, mouseDown } from "./input";
import { gl_restore, gl_save, gl_translate } from "./gl";

import { TEXTURE_CACHE } from "./texture";
import { assert } from "./debug";
import { v2 } from "./v2";

export const enum TAG
{
  NONE,
  TEXT,
  SPRITE,
  WINDOW,
  BUTTON
}

//#region Base Node Data
let nextNodeId = 1;

export const node_position: v2[] = [];
export const node_movement: Map<number, InterpolationData> = new Map();
export const node_size: v2[] = [];
export const node_scale: number[] = [];
export const node_enabled: boolean[] = [];
export const node_tags: TAG[] = [];
export const node_visible: boolean[] = [];
export const node_parent: number[] = [0];
export const node_children: number[][] = [[]];

//#endregion Base Node Data

//#region Extended Node Data
export const node_text: string[] = [];
export const node_text_align: Align[] = [];
export const node_drop_shadow: boolean[] = [];

//#endregion Extended Node Data

//#region Base Node
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

  assert(index !== -1, `[${ childId }] This node was not present in its parrent's child list [${ parentId }]`)

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

export function nodeInput(nodeId: number, cursorPosition: number[] = cursor): void
{
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
      if (!mouseDown)
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

      if (mouseDown)
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

    if (node_visible[nodeId])
    {
      switch (node_tags[nodeId])
      {
        case TAG.TEXT:
          renderTextNode(nodeId);
          break;
        case TAG.SPRITE:
          renderSprite(nodeId, delta);
          break;
        case TAG.WINDOW:
          renderWindow(nodeId);
          break;
        case TAG.BUTTON:
          renderButton(nodeId);
          break;
        case TAG.NONE:
        default:
      }
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
//#endregion Base Node

//#region Text Node
export function createTextNode(text: string, scale: number = 1, align: Align = Align.Left, shadow: boolean = false): number
{
  const nodeId = createNode();
  node_tags[nodeId] = TAG.TEXT;
  updateTextNode(nodeId, text, scale, align, shadow);
  return nodeId;
}

export function updateTextNode(nodeId: number, text: string, scale: number = 1, align: Align = Align.Left, shadow: boolean = false): void
{
  const lines = parseText(text);
  const width = textWidth(text.length, 1);
  const height = textHeight(lines, 1);
  node_size[nodeId] = [width, height];
  node_text_align[nodeId] = align;
  node_drop_shadow[nodeId] = shadow;
  node_scale[nodeId] = scale;
  node_text[nodeId] = text;
}

function renderTextNode(nodeId: number): void
{
  const scale = node_scale[nodeId];
  const textAlign = node_text_align[nodeId];
  if (node_drop_shadow[nodeId])
  {
    pushText(node_text[nodeId], scale, scale, { scale, textAlign, colour: 0xFF000000 });
  }
  pushText(node_text[nodeId], 0, 0, { scale, textAlign });
}
//#endregion Text Node

//#region Sprite Node
export type Frame = { spriteName: string, duration: number }
const node_sprite_frames: Map<number, Frame[]> = new Map();
const node_sprite_timestamp: number[] = [];
const node_sprite_duration: number[] = [];
export function createSprite(frames: Frame[], scale: number = 1, shadow: boolean = false): number
{
  const nodeId = createNode();

  node_tags[nodeId] = TAG.SPRITE;

  const t = TEXTURE_CACHE.get(frames[0].spriteName);
  // @ifdef DEBUG
  assert(t !== undefined, `Unable to load texture ${ frames[0].spriteName }`);
  // @endif

  node_size[nodeId] = [t.w, t.h];
  node_scale[nodeId] = scale;
  node_drop_shadow[nodeId] = shadow;

  node_sprite_frames.set(nodeId, frames);
  let duration = 0;
  for (const frame of frames)
  {
    duration += frame.duration;
  }

  node_sprite_duration[nodeId] = duration;
  node_sprite_timestamp[nodeId] = 0;

  return nodeId;
}

function renderSprite(nodeId: number, delta: number): void
{
  const scale = node_scale[nodeId];
  const duration = node_sprite_duration[nodeId];
  const frames = node_sprite_frames.get(nodeId);

  if (frames)
  {
    if (duration > 0)
    {
      node_sprite_timestamp[nodeId] += delta;
      if (node_sprite_timestamp[nodeId] > duration)
      {
        node_sprite_timestamp[nodeId] = 0;
      }
    }

    let currentFrame = frames[0];
    let totalDuration: number = 0;
    for (const frame of frames)
    {
      totalDuration += frame.duration;
      if (node_sprite_timestamp[nodeId] <= totalDuration)
      {
        currentFrame = frame;
        break;
      }
    }

    if (node_drop_shadow[nodeId])
    {
      pushSpriteAndSave(currentFrame.spriteName, scale, scale, 0xFF000000, scale, scale);
    }
    pushSprite(currentFrame.spriteName, 0, 0, 0xFFFFFFFFFF, scale, scale);
  }
}
//#endregion Sprite Node

//#region Window Node
export function createWindowNode(pos: v2, size: v2): number
{
  const nodeId = createNode();
  node_tags[nodeId] = TAG.WINDOW;
  node_position[nodeId] = pos;
  node_size[nodeId] = size;
  return nodeId;
}

function renderWindow(nodeId: number): void
{
  const size = nodeSize(nodeId);

  pushQuad(0, 0, size[0], size[1], 0xFFFFFFFF);
  pushQuad(2, 2, size[0] - 4, size[1] - 4, 0xFF000000);
}
//#endregion Window Node

export function createButtonNode(text: string, pos: v2, size: v2): number
{
  const nodeId = createNode();
  node_tags[nodeId] = TAG.BUTTON;
  node_position[nodeId] = pos;
  node_size[nodeId] = size;
  node_text[nodeId] = text;

  return nodeId;
}

function renderButton(nodeId: number): void
{
  const size = nodeSize(nodeId);

  if (inputContext.hot === nodeId)
  {
    pushQuad(0, 0, size[0], size[1], 0xFFFFFFFF);
    pushQuad(2, 2, size[0] - 4, size[1] - 4, 0xFF2d2d2d);
  }
  else
  {
    pushQuad(0, 0, size[0], size[1], 0xFFFFFFFF);
    pushQuad(2, 2, size[0] - 4, size[1] - 4, 0xFF000000);
  }
  if (inputContext.fire === nodeId)
  {
    zzfxP(buttonHover);
  }
  pushText(node_text[nodeId], Math.floor(size[0] / 2), Math.floor(size[1] / 2) - 8, { textAlign: Align.Center, scale: 2 });

}