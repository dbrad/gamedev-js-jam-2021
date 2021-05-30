import { Align, parseText, pushText, textHeight, textWidth } from "../draw";
import { createNode, node_renderer, node_scale, node_size, node_tag } from "../node";

export const node_text: string[] = [];
export const node_text_align: Align[] = [];
export const node_text_colour: Align[] = [];
export const node_drop_shadow: boolean[] = [];
export function createTextNode(text: string, scale: number = 1, align: Align = Align.Left, colour: number = 0xFFFFFFFF): number
{
  const nodeId = createNode();
  node_tag[nodeId] = "text";
  node_renderer[nodeId] = renderTextNode;
  updateTextNode(nodeId, text, scale, align, colour);
  return nodeId;
}

export function updateTextNode(nodeId: number, text: string, scale: number = 1, align: Align = Align.Left, colour: number = 0xFFFFFFFF): void
{
  const lines = parseText(text);
  const width = textWidth(text.length, 1);
  const height = textHeight(lines, 1);
  node_size[nodeId] = [width, height];
  node_text_align[nodeId] = align;
  node_text_colour[nodeId] = colour;
  node_scale[nodeId] = scale;
  node_text[nodeId] = text;
}

function renderTextNode(nodeId: number, now: number, delta: number): void
{
  const scale = node_scale[nodeId];
  const textAlign = node_text_align[nodeId];
  pushText(node_text[nodeId], 0, 0, { scale, textAlign, colour: node_text_colour[nodeId] });
}