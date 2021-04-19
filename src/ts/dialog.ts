import { pushQuad, pushText } from "./draw";

let textLength = -1;
let label = "";
let textTimer = -1;
export function showDialog(text: string, duration: number, now: number, speaker: string = ""): void
{
  pushQuad(2, 242, 636, 116, 0xFFFFFFFF);
  pushQuad(3, 243, 634, 114, 0xFF000000);
  if (textTimer === -1)
  {
    textTimer = now;
  }
  if (textLength === -1) textLength = text.length;

  const char = Math.min(textLength, Math.floor((now - textTimer) / (duration / textLength)));
  let cursor = char === textLength ? "" : "_";
  label = text.substring(0, char);
  const fullText = ((speaker === "") ? "" : speaker + ": ") + label + cursor;
  pushText(fullText, 9, 249, { wrap: 624, colour: 0xFF555555, scale: 2 });
  pushText(fullText, 8, 248, { wrap: 624, colour: 0xFFCCCCCC, scale: 2 });
}