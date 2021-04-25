import { Align, pushQuad, pushText } from "../draw";
import { DialogEvent, EventChoice, EventType, gameState } from "../gamestate";
import { addChildNode, createButtonNode, createNode, createWindowNode, moveNode, node_enabled, node_size, node_text, node_visible } from "../node";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { inputContext } from "../input";

export let dialogSystemRootId = -1;
let choiceWindowId = -1;
let choiceButton01Id = -1;
let choiceButton02Id = -1;

let dialogTime = -1;
let textLength = -1;
let label = "";
let textTimer = -1;
let done = false;

export function setupDialogScene(): void
{
  dialogSystemRootId = createNode();
  node_size[dialogSystemRootId][0] = screenWidth;
  node_size[dialogSystemRootId][1] = screenHeight;

  choiceWindowId = createWindowNode([screenCenterX - 129, screenCenterY - 46], [258, 94]);
  addChildNode(dialogSystemRootId, choiceWindowId);
  node_enabled[choiceWindowId] = false;

  choiceButton01Id = createButtonNode("", [250, 40]);
  moveNode(choiceButton01Id, [4, 4])
  addChildNode(choiceWindowId, choiceButton01Id);

  choiceButton02Id = createButtonNode("", [250, 40]);
  moveNode(choiceButton02Id, [4, 50])
  addChildNode(choiceWindowId, choiceButton02Id);

}

export function dialogSystem(now: number, delta: number): void
{
  pushQuad(0, 0, screenWidth, screenHeight, 0x99000000);
  if (gameState.currentEvent)
  {
    if (dialogTime === -1) dialogTime = gameState.currentEvent.dialogTime;
    if (inputContext.fire === dialogSystemRootId)
    {
      if (dialogTime === gameState.currentEvent.dialogTime)
      {
        dialogTime = 200;
      }
      if (done && gameState.currentEvent.choices.length === 0)
      {
        if (gameState.currentEvent?.outcome)
        {
          gameState.currentEvent.outcome();
        }
        dialogTime = -1;
        textTimer = -1;
        done = false;
        node_enabled[choiceWindowId] = false;
        gameState.flags["clear_input"] = true;
        gameState.currentEvent = null;
        return;
      }
    }
    showDialog(gameState.currentEvent.dialog, dialogTime, now);
    if (done)
    {
      if (gameState.currentEvent.choices.length > 0)
      {
        node_text[choiceButton01Id] = gameState.currentEvent.choices[0].label;
        node_text[choiceButton02Id] = gameState.currentEvent.choices[1].label;
        node_enabled[choiceWindowId] = true;

        let outcome: (() => void) | null = null;
        if (inputContext.fire === choiceButton01Id)
        {
          outcome = gameState.currentEvent?.choices[0]?.outcome;
        }
        else if (inputContext.fire === choiceButton02Id)
        {
          outcome = gameState.currentEvent?.choices[1]?.outcome;
        }
        if (outcome)
        {
          dialogTime = -1;
          textTimer = -1;
          done = false;
          node_enabled[choiceWindowId] = false;
          gameState.flags["clear_input"] = true;
          gameState.currentEvent = null;
          outcome();
        }
      }
    }
  }
}

// NOTE(david): LINE LENGTH IS 38
function showDialog(text: string, duration: number, now: number, speaker: string = ""): void
{
  pushQuad(2, 242, 636, 116, 0xFFFFFFFF);
  pushQuad(3, 243, 634, 114, 0xFF000000);

  if (!done)
  {
    if (textTimer === -1) textTimer = now;
    if (textLength === -1) textLength = text.length;

    const char = Math.min(textLength, Math.floor((now - textTimer) / (duration / textLength)));
    label = text.substring(0, char);
    const fullText = ((speaker === "") ? "" : speaker + ": ") + label;

    pushText(fullText, 9, 249, { wrap: 624, colour: 0xFF555555, scale: 2 });
    pushText(fullText, 8, 248, { wrap: 624, colour: 0xFFCCCCCC, scale: 2 });

    if ((now - textTimer) / duration >= 1)
    {
      done = true;
      dialogTime = -1;
      textTimer = -1;
      textLength = -1;
      label = "";
    }
  }
  else
  {
    pushText(text, 9, 249, { wrap: 624, colour: 0xFF555555, scale: 2 });
    pushText(text, 8, 248, { wrap: 624, colour: 0xFFCCCCCC, scale: 2 });
    pushText("touch to continue", 630, 345, { textAlign: Align.Right, colour: 0xFFCCCCCC, scale: 1 });
  }
}

export function createBasicDialogEvent(dialog: string, dialogTime = 3000): DialogEvent
{
  return {
    type: EventType.Dialog,
    dialog: dialog,
    dialogTime: dialogTime,
    choices: [],
    outcome: null
  };
}

export function createEventChoice(label: string, outcome: () => void): EventChoice
{
  return { label, outcome };
}

export function createChoiceDialogEvent(choices: EventChoice[], dialog: string, dialogTime = 3000): DialogEvent
{
  return {
    type: EventType.Choice,
    dialog: dialog,
    dialogTime: dialogTime,
    choices: choices,
    outcome: null
  };
}

export function createOutcomeDialogEvent(outcome: () => void, dialog: string, dialogTime = 3000): DialogEvent
{
  return {
    type: EventType.Outcome,
    dialog: dialog,
    dialogTime: dialogTime,
    choices: [],
    outcome: outcome
  };
}