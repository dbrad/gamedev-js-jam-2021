import { gameState, moneyPerLevel, nextLevel } from "./gamestate";
import { rand, shuffle } from "../random";

export type EventChoice = {
  label: string,
  outcome: () => void
}
export enum EventType
{
  Dialog,
  Choice,
  Outcome
}
export type DialogEvent = {
  type: EventType,
  dialog: string,
  dialogTime: number,
  choices: EventChoice[],
  outcome: (() => void) | null
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

//////////////////////////////////////////////////////////////////

let choiceDeck: number[] = [];
export function getRandomChoiceEvent(): DialogEvent
{
  if (choiceDeck.length === 0)
  {
    choiceDeck = shuffle([0, 1, 2, 3, 4]);
  }
  const choice = choiceDeck.pop() ?? 0;

  switch (choice)
  {
    case 1:
      // Flip a Coin
      const heads = createEventChoice("Heads", () => 
      {
        if (rand(0, 1) === 0)
        {
          gameState.currentLevel.currencies.sand +=
            rand(
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.1),
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.2));
          gameState.currentEvent = createBasicDialogEvent("Heads! Great call!", 500);
        }
        else
        {
          gameState.currentEvent = createBasicDialogEvent("Tails! Better luck next time!", 500);
        }
      });
      const tails = createEventChoice("Tails", () =>
      {
        if (rand(0, 1) === 1)
        {
          gameState.currentLevel.currencies.sand +=
            rand(
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.1),
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.2));
          gameState.currentEvent = createBasicDialogEvent("Tails! Great call!", 500);
        }
        else
        {
          gameState.currentEvent = createBasicDialogEvent("Heads! Better luck next time!", 500);
        }
      });
      return createChoiceDialogEvent(
        [heads, tails],
        "Heads or tails! Quick call it!",
        750);
    case 2:
      // Max HP or Max Sanity
      const hp = createEventChoice("Health", () =>
      {
        gameState.player.maxHealth += 2;
        gameState.player.health += 2;
      });
      const sanity = createEventChoice("Sanity", () =>
      {
        gameState.player.maxSanity += 2;
        gameState.player.sanity += 2;
      });
      return createChoiceDialogEvent(
        [hp, sanity],
        "What do you desire?",
        750);
    case 3:
      // Atk or Def
      const atk = createEventChoice("Attack", () => { gameState.player.attack += 1; });
      const def = createEventChoice("Defense", () => { gameState.player.defense += 1; });
      return createChoiceDialogEvent(
        [atk, def],
        "What do you desire?",
        750);
    case 4:
      // Power or Greed
      const power = createEventChoice("Power", () => { gameState.player.xpPool += nextLevel(gameState.player.level); });
      const greed = createEventChoice("Greed", () =>
      {
        gameState.currentLevel.currencies.sand +=
          rand(
            Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.3),
            Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.5));
      });
      return createChoiceDialogEvent(
        [power, greed],
        "What do you desire?",
        750);
    case 0:
    default:
      // Double or Nothing
      const double = createEventChoice("Bet", () =>
      {
        if (rand(0, 100) >= 50)
        {
          gameState.currentLevel.currencies.sand *= 2;
          gameState.currentEvent = createBasicDialogEvent("Wow, lucky!", 500);
        }
        else
        {
          gameState.currentEvent = createBasicDialogEvent("Better luck next time!", 500);
          gameState.currentLevel.currencies.sand = 0;
        }
      });
      const nothing = createEventChoice("Pass", () => { });
      return createChoiceDialogEvent(
        [double, nothing],
        "How about it? Double or nothing! 50/50 chance to double your sand, or lose it all.",
        750);
  }
}

let outcomeDeck: number[] = [];
export function getRandomOutcomeEvent(): DialogEvent
{
  if (outcomeDeck.length === 0)
  {
    outcomeDeck = shuffle([0, 1, 2, 3, 4, 5, 6]);
  }
  const outcome = outcomeDeck.pop() ?? 0;

  switch (outcome)
  {
    case 0:
      // Healing Spring (Heal 10%)
      return createOutcomeDialogEvent(
        () => { gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + Math.ceil(gameState.player.maxHealth * 0.1)) },
        "There is a small fresh water spring here, you stop to rest for a moment.",
        750
      );
    case 1:
      // Enlightening Mural (+2 Sanity)
      return createOutcomeDialogEvent(
        () => { gameState.player.sanity = Math.min(gameState.player.maxSanity, gameState.player.sanity + 2); },
        "You come across an enlightening mural on the wall, restoring some sanity to your weary mind.",
        750
      );
    case 2:
      // Fortune
      return createOutcomeDialogEvent(
        () =>
        {
          gameState.currentLevel.currencies.sand +=
            rand(
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.3),
              Math.floor(moneyPerLevel[gameState.currentLevel.difficulty] * 0.5));
        },
        "A sizable pile of sand sits on the floor, ripe for the taking.",
        750
      );
    case 3:
      // Fortitude
      return createOutcomeDialogEvent(
        () =>
        {
          gameState.player.maxHealth += 5;
          gameState.player.health += 5;
        },
        "In a moment of self-reflection you realize you're stronger than you thought. (+5 max health)",
        750
      );
    case 4:
      // Iron Body
      return createOutcomeDialogEvent(
        () => { gameState.player.defense += 5; },
        "Your body aches, but you must go on. You prepare yourself for struggles to come. (+5 defense)",
        750
      );
    case 5:
      // Trip
      return createOutcomeDialogEvent(
        () => { gameState.player.health -= Math.ceil(gameState.player.health * 0.1) },
        "A loose stone trips you. Ouch!",
        750
      );
    case 6:
      // Forboding Inscription
      return createOutcomeDialogEvent(
        () => { gameState.player.sanity = Math.max(0, gameState.player.sanity - 1); },
        "Ancient scribbling on the walls drive you deeper into madness. (-1 sanity)",
        750
      );
  }
  // Healing Spring (Heal 10%)
  return createOutcomeDialogEvent(
    () => { gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + Math.ceil(gameState.player.maxHealth * 0.1)) },
    "There is a small fresh water spring here, you stop to rest for a moment.",
    750
  );
}