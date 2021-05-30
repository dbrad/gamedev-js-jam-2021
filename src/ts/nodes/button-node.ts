import { Align, pushQuad, pushText } from "../draw";
import { buttonHover, zzfxP } from "../zzfx";
import { createNode, nodeSize, node_renderer, node_size, node_tag } from "../node";

import { inputContext } from "../input";
import { v2 } from "../v2";

export let node_button_text_scale: number[] = [];
export let node_button_text_line_1: string[] = []
export let node_button_text_line_2: string[] = []
export function createButtonNode(text: string, size: v2, secondLine: string = "", textScale: number = 2): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "button";
  node_renderer[nodeId] = renderButton;

  node_size[nodeId] = size;
  node_button_text_line_1[nodeId] = text;
  node_button_text_scale[nodeId] = textScale;

  if (secondLine !== "")
  {
    node_button_text_line_2[nodeId] = secondLine;
  }

  return nodeId;
}

function renderButton(nodeId: number, now: number, delta: number): void
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
  if (node_button_text_line_2[nodeId])
  {
    pushText(node_button_text_line_2[nodeId], Math.floor(size[0] / 2), Math.floor(size[1] / 2) + 8, { wrap: size[0] - 4, textAlign: Align.Center, scale: 1, colour: 0xFF888888 });
  }
  {
    pushText(node_button_text_line_1[nodeId], Math.floor(size[0] / 2), Math.floor(size[1] / 2) - (4 * node_button_text_scale[nodeId]), { textAlign: Align.Center, scale: node_button_text_scale[nodeId] });
  }

}