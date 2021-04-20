import { Align, pushQuad, pushText } from "../draw";
import { createNode, node_size, node_visible } from "../node";
import { screenHeight, screenWidth } from "../screen";

import { gameState } from "../gamestate";
import { inputContext } from "../input";

export let dialogSystemRootId = -1;
let dialogTime = 3000;
let done = false;

export function setupDialogScene(): void
{
  dialogSystemRootId = createNode();
  node_size[dialogSystemRootId][0] = screenWidth;
  node_size[dialogSystemRootId][1] = screenHeight;
}

export function dialogSystem(now: number, delta: number): void
{
  pushQuad(0, 0, screenWidth, screenHeight, 0x99000000);
  if (inputContext.fire === dialogSystemRootId)
  {
    if (dialogTime === 3000)
    {
      dialogTime = 200;
    }
    if (done)
    {
      gameState.currentEvent = null;
    }
  }
  if (gameState.currentEvent)
  {
    showDialog(gameState.currentEvent.dialog, dialogTime, now);
  }
}

let textLength = -1;
let label = "";
let textTimer = -1;

function showDialog(text: string, duration: number, now: number, speaker: string = ""): void
{
  pushQuad(2, 242, 636, 116, 0xFFFFFFFF);
  pushQuad(3, 243, 634, 114, 0xFF000000);

  if (!done)
  {
    if (textTimer === -1) textTimer = now;
    if (textLength === -1) textLength = text.length;

    const char = Math.min(textLength, Math.floor((now - textTimer) / (duration / textLength)));
    let cursor = char === textLength ? "" : "_";
    label = text.substring(0, char);
    const fullText = ((speaker === "") ? "" : speaker + ": ") + label + cursor;

    pushText(fullText, 9, 249, { wrap: 624, colour: 0xFF555555, scale: 2 });
    pushText(fullText, 8, 248, { wrap: 624, colour: 0xFFCCCCCC, scale: 2 });

    if ((now - textTimer) / duration >= 1)
    {
      done = true;
      dialogTime = 3000;
      textTimer = -1;
      textLength = -1;
      label = "";
    }
  }
  else
  {
    pushText(text, 9, 249, { wrap: 624, colour: 0xFF555555, scale: 2 });
    pushText(text, 8, 248, { wrap: 624, colour: 0xFFCCCCCC, scale: 2 });
    pushText("click to continue", 630, 345, { textAlign: Align.Right, colour: 0xFFCCCCCC, scale: 1 });
  }
}