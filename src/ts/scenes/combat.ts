import { Easing, InterpolationData, createInterpolationData, interpolate } from "../interpolate";
import { Enemy, gameState } from "../gamestate";
import { addChildNode, createCombatBarNode, createNode, createSprite, createWindowNode, moveNode, node_enabled, node_size, node_sprite_timestamp, updateCombatBarValues } from "../node";
import { screenHeight, screenWidth } from "../screen";

import { assert } from "../debug";

export let combatRootId = -1;

let playerSpriteId = -1;
let playerDyingSpriteId = -1;
let playerPositon = [0, 0];
let playerAttacking = false;
let playerCombatBar = -1;

let enemy01SpriteId = -1;
let enemy01DyingSpriteId = -1;
let enemy01Position = [0, 0];
let enemy01Attacking = false;
let enemy01CombatBar = -1;

let enemy01: Enemy | null = null;
let enemy02: Enemy | null = null;
let enemy03: Enemy | null = null;

let playerTimer = 0;
let enemy01Timer = 0;
let enemy02Timer = 0;
let enemy03Timer = 0;

let sceneDelay: InterpolationData | null = null;

export function setupCombatScene(): void
{
  combatRootId = createNode();
  node_size[combatRootId] = [screenWidth - 40, screenHeight - 68];

  const rootSize = node_size[combatRootId];
  const rootCenter = [rootSize[0] / 2, rootSize[1] / 2]

  let playerAbilitiesWindow = createWindowNode([4, 4], [150, rootSize[1] - 8]);
  addChildNode(combatRootId, playerAbilitiesWindow);

  playerPositon = [rootCenter[0] - 84, rootCenter[1] - 24];
  playerSpriteId = createSprite([
    { spriteName: "player_right_01", duration: 500 },
    { spriteName: "player_right_02", duration: 500 },
  ], 2);
  moveNode(playerSpriteId, [playerPositon[0], playerPositon[1]]);
  addChildNode(combatRootId, playerSpriteId);

  playerCombatBar = createCombatBarNode(2);
  moveNode(playerCombatBar, [rootCenter[0] - 84, rootCenter[1] - 48]);
  addChildNode(combatRootId, playerCombatBar);


  let enemyAbilitiesWindow = createWindowNode([rootSize[0] - 154, 4], [150, rootSize[1] - 8]);
  addChildNode(combatRootId, enemyAbilitiesWindow);

  enemy01Position = [rootCenter[0] + 60, rootCenter[1] - 24];
  enemy01SpriteId = createSprite([
    { spriteName: "player_left_01", duration: 500 },
    { spriteName: "player_left_02", duration: 500 },
  ], 2, true, 0xFF3333FF);
  moveNode(enemy01SpriteId, [enemy01Position[0], enemy01Position[1]]);
  addChildNode(combatRootId, enemy01SpriteId);

  enemy01DyingSpriteId = createSprite([
    { spriteName: "player_die_left_01", duration: 125 },
    { spriteName: "player_die_left_02", duration: 125 },
    { spriteName: "player_die_left_03", duration: 125 },
  ], 2, false, 0xFF3333FF);
  moveNode(enemy01DyingSpriteId, [enemy01Position[0], enemy01Position[1]]);
  node_enabled[enemy01DyingSpriteId] = false;
  addChildNode(combatRootId, enemy01DyingSpriteId);

  enemy01CombatBar = createCombatBarNode(2);
  moveNode(enemy01CombatBar, [rootCenter[0] + 60, rootCenter[1] - 48]);
  addChildNode(combatRootId, enemy01CombatBar);
}

let playerAttackRate = 1000;
let enemy01AttackRate = 1000;
let enemy02AttackRate = 1000;
let enemy03AttackRate = 1000;

export function prepareCombatScene(enemies: Enemy[]): void
{
  // @ifdef DEBUG
  assert(enemies[0] !== undefined, "There should always be at least 1 enemy here");
  // @endif
  if (enemies[0])
  {
    enemy01 = enemies[0];
    enemy01AttackRate = 1000 * (100 / enemy01.attackSpeed);
    node_enabled[enemy01SpriteId] = true;
    node_enabled[enemy01CombatBar] = true;
    node_enabled[enemy01DyingSpriteId] = false;
    node_sprite_timestamp[enemy01DyingSpriteId] = 0;
  }
  if (enemies[1])
  {
    enemy02 = enemies[1];
  }
  if (enemies[2])
  {
    enemy03 = enemies[2];
  }

  sceneDelay = null;

  playerAttackRate = 1000 * (100 / gameState.player.attackSpeed);

  playerTimer = 0;
  enemy01Timer = 0;
  enemy02Timer = 0;
  enemy03Timer = 0;
}

export function combat(now: number, delta: number): boolean
{
  const player = gameState.player;
  let combatRunning = true;
  const anyEnemiesAlive = (enemy01?.alive ?? false) || (enemy02?.alive ?? false) || (enemy03?.alive ?? false);

  if (sceneDelay)
  {
    let i = interpolate(now, sceneDelay);
    if (i.done)
    {
      sceneDelay = null;
    }
  }

  if (anyEnemiesAlive)
  {
    playerTimer += delta;
    updateCombatBarValues(playerCombatBar, player.health / player.maxHealth, Math.min(1, playerTimer / playerAttackRate));

    if (enemy01 && enemy01.alive)
    {
      enemy01Timer += delta;
      updateCombatBarValues(enemy01CombatBar, enemy01.health / enemy01.maxHealth, Math.min(1, enemy01Timer / enemy01AttackRate));
    }

    if (enemy02 && enemy02.alive)
    {
      enemy02Timer += delta;
      updateCombatBarValues(enemy01CombatBar, enemy02.health / enemy02.maxHealth, Math.min(1, enemy02Timer / enemy02AttackRate));
    }

    if (enemy03 && enemy03.alive)
    {
      enemy03Timer += delta;
      updateCombatBarValues(enemy01CombatBar, enemy03.health / enemy03.maxHealth, Math.min(1, enemy03Timer / enemy03AttackRate));
    }

    if (playerTimer > playerAttackRate && !playerAttacking)
    {
      playerAttacking = true;
      // Roll target
      moveNode(playerSpriteId, [playerPositon[0] + 10, playerPositon[1]], Easing.EaseOutQuad, 75).then(() =>
      {
        // Damage Target
        if (enemy01)
          enemy01.health -= Math.ceil(player.attack * (10 / (10 + enemy01.defense)));
        moveNode(playerSpriteId, [playerPositon[0], playerPositon[1]], Easing.Linear, 25).then(() =>
        {
          playerTimer = 0;
          playerAttacking = false;
        })
      });

      if (enemy01Timer > enemy01AttackRate && !enemy01Attacking)
      {
        enemy01Attacking = true;
        // Roll target
        moveNode(enemy01SpriteId, [enemy01Position[0] - 10, enemy01Position[1]], Easing.EaseOutQuad, 75).then(() =>
        {
          // Damage Target
          if (enemy01)
            player.health -= Math.ceil(enemy01.attack * (10 / (10 + player.defense)));
          moveNode(enemy01SpriteId, [enemy01Position[0], enemy01Position[1]], Easing.Linear, 25).then(() =>
          {
            enemy01Timer = 0;
            enemy01Attacking = false;
          });
        });
      }
    }
  }

  if (enemy01 && enemy01.health <= 0 && enemy01.alive)
  {
    node_enabled[enemy01SpriteId] = false;
    node_enabled[enemy01DyingSpriteId] = true;
    node_enabled[enemy01CombatBar] = true;
    enemy01.alive = false;

    player.xp += gameState.currentLevel.difficulty;

    sceneDelay = createInterpolationData(1500, [0], [1], Easing.Linear, () =>
    {
      enemy01 = null;
    });
  }

  if (!enemy01 && !enemy02 && !enemy03)
  {
    combatRunning = false;
  } else if (player.health <= 0)
  {
    combatRunning = false;
  }

  return combatRunning;
}