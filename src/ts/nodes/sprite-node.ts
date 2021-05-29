import { createNode, node_renderer, node_scale, node_size, node_tag } from "../node";
import { pushSprite, pushSpriteAndSave } from "../draw";

import { TEXTURE_CACHE } from "../texture";
import { assert } from "../debug";
import { node_drop_shadow } from "./text-node";

export type Frame = { spriteName: string, duration: number }

export const node_sprite_frames: Map<number, Frame[]> = new Map();
export const node_sprite_colour: number[] = [];
export const node_sprite_timestamp: number[] = [];
export const node_sprite_duration: number[] = [];
export const node_sprite_loop: boolean[] = [];

export function createSprite(frames: Frame[], scale: number = 1, loop: boolean = true, colour: number = 0xFFFFFFFF, shadow: boolean = false): number
{
  const nodeId = createNode();

  node_tag[nodeId] = "sprite";
  node_renderer[nodeId] = renderSprite;
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
  node_sprite_colour[nodeId] = colour;
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

function renderSprite(nodeId: number, now: number, delta: number): void
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
    pushSprite(currentFrame.spriteName, 0, 0, node_sprite_colour[nodeId], scale, scale);
  }
}