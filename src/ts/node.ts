import { Align, parseText, pushQuad, pushSprite, pushSpriteAndSave, pushText, textHeight, textWidth } from "./draw";
import { Easing, InterpolationData, createInterpolationData } from "./interpolate";
import { gl_restore, gl_save, gl_scale, gl_translate } from "./gl";

import { TEXTURE_CACHE } from "./texture";
import { assert } from "./debug";
import { inputContext } from "./input";
import { v2 } from "./v2";

//import { buttonHover, zzfxP } from "./zzfx";

export const enum TAG
{
  NONE,
  TEXT,
  SPRITE,
  WINDOW,
  BUTTON,
  MOVEMENT_BUTTON,
  COMBAT_BAR
}

//#region Base Node Data
let nextNodeId = 1;

export const node_position: v2[] = [];
export const node_movement: Map<number, InterpolationData> = new Map();
export const node_size: v2[] = [];
export const node_scale: number[] = [];
export const node_enabled: boolean[] = [];
export const node_interactive: boolean[] = [];
export const node_tag: TAG[] = [];
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

    if (node_visible[nodeId])
    {
      switch (node_tag[nodeId])
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
        case TAG.MOVEMENT_BUTTON:
          renderMovementButton(nodeId, now, delta);
          break;
        case TAG.COMBAT_BAR:
          renderCombatBar(nodeId);
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
  node_tag[nodeId] = TAG.TEXT;
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
const node_colour: number[] = [];
export const node_sprite_timestamp: number[] = [];
const node_sprite_duration: number[] = [];
const node_sprite_loop: boolean[] = [];
export function createSprite(frames: Frame[], scale: number = 1, loop: boolean = true, colour: number = 0xFFFFFFFF, shadow: boolean = false): number
{
  const nodeId = createNode();

  node_tag[nodeId] = TAG.SPRITE;
  node_drop_shadow[nodeId] = shadow;

  updateSprite(nodeId, frames, loop, colour, scale);

  return nodeId;
}

export function updateSprite(nodeId: number, frames: Frame[], loop: boolean = true, colour: number = 0xFFFFFFFF, scale: number = 1): void
{
  const t = TEXTURE_CACHE.get(frames[0].spriteName);
  // @ifdef DEBUG
  assert(t !== undefined, `Unable to load texture ${ frames[0].spriteName }`);
  // @endif

  node_size[nodeId] = [t.w, t.h];

  node_sprite_loop[nodeId] = loop;
  node_colour[nodeId] = colour;
  node_scale[nodeId] = scale;

  node_sprite_frames.set(nodeId, frames);
  let duration = 0;
  for (const frame of frames)
  {
    duration += frame.duration;
  }

  node_sprite_duration[nodeId] = duration;
  node_sprite_timestamp[nodeId] = 0;
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
      if (node_sprite_timestamp[nodeId] > duration && node_sprite_loop[nodeId])
      {
        node_sprite_timestamp[nodeId] = 0;
      }
      else if (node_sprite_timestamp[nodeId] > duration && !node_sprite_loop[nodeId])
      {
        node_sprite_timestamp[nodeId] -= delta;
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
    pushSprite(currentFrame.spriteName, 0, 0, node_colour[nodeId], scale, scale);
  }
}
//#endregion Sprite Node

//#region Window Node
export function createWindowNode(pos: v2, size: v2): number
{
  const nodeId = createNode();
  node_tag[nodeId] = TAG.WINDOW;
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

//#region Button Node
export function createButtonNode(text: string, pos: v2, size: v2): number
{
  const nodeId = createNode();
  node_tag[nodeId] = TAG.BUTTON;
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
    // zzfxP(buttonHover);
  }
  pushText(node_text[nodeId], Math.floor(size[0] / 2), Math.floor(size[1] / 2) - 8, { textAlign: Align.Center, scale: 2 });

}
//#endregion Button Node

//#region Moverment Buttons
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
  node_tag[nodeId] = TAG.MOVEMENT_BUTTON;
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
//#endregion Moverment Buttons

//#region Combat Bars
const node_combat_bar_values: [number, number][] = [];
export function createCombatBarNode(scale: number = 1): number
{
  const nodeId = createNode();
  node_tag[nodeId] = TAG.COMBAT_BAR;
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

function renderCombatBar(nodeId: number): void
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
//#endregion Combat Bars
