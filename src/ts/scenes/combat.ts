import { AbilityType, Enemy, GemType, gameState } from "../gamestate";
import { DoubleStrike_Cooldown, Heal_Cooldown } from "../ability";
import { Easing, InterpolationData, createInterpolationData, interpolate } from "../interpolate";
import { FrameMaterial, FrameQuality } from "../mirror";
import { addChildNode, createCombatBarNode, createNode, createSprite, createWindowNode, moveNode, node_enabled, node_size, node_sprite_timestamp, updateCombatBarValues } from "../node";
import { screenHeight, screenWidth } from "../screen";

export let combatRootId = -1;

let playerSpriteId = -1;
let playerDyingSpriteId = -1;
let playerPositon = [0, 0];
let playerAttacking = false;
let playerCombatBar = -1;

let enemySpriteId = -1;
let enemyDyingSpriteId = -1;
let enemyPosition = [0, 0];
let enemyAttacking = false;
let enemyCombatBar = -1;

let combatEnemy: Enemy | null = null;

let playerTimer = 0;
let enemyTimer = 0;

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

  enemyPosition = [rootCenter[0] + 60, rootCenter[1] - 24];
  enemySpriteId = createSprite([
    { spriteName: "player_left_01", duration: 500 },
    { spriteName: "player_left_02", duration: 500 },
  ], 2, true, 0xFF3333FF);
  moveNode(enemySpriteId, [enemyPosition[0], enemyPosition[1]]);
  addChildNode(combatRootId, enemySpriteId);

  enemyDyingSpriteId = createSprite([
    { spriteName: "player_die_left_01", duration: 125 },
    { spriteName: "player_die_left_02", duration: 125 },
    { spriteName: "player_die_left_03", duration: 125 },
  ], 2, false, 0xFF3333FF);
  moveNode(enemyDyingSpriteId, [enemyPosition[0], enemyPosition[1]]);
  node_enabled[enemyDyingSpriteId] = false;
  addChildNode(combatRootId, enemyDyingSpriteId);

  enemyCombatBar = createCombatBarNode(2);
  moveNode(enemyCombatBar, [rootCenter[0] + 60, rootCenter[1] - 48]);
  addChildNode(combatRootId, enemyCombatBar);
}

type ActiveAbility = {
  type: AbilityType,
  rank: number,
  timer: number
}

let playerAttackRate = 1000;
let enemyAttackRate = 1000;

let playerBonusXP = 0;
let playerReflectDamage = 0;
let playerActiveAbilities: ActiveAbility[] = [];

let enemyReflectDamage = 0;
let enemyActiveAbilities: ActiveAbility[] = [];

export function prepareCombatScene(enemy: Enemy): void
{
  if (enemy)
  {
    combatEnemy = enemy;
    enemyAttackRate = 1000 * (100 / enemy.attackSpeed);
    node_enabled[enemySpriteId] = true;
    node_enabled[enemyCombatBar] = true;
    node_enabled[enemyDyingSpriteId] = false;
    node_sprite_timestamp[enemyDyingSpriteId] = 0;
  }

  sceneDelay = null;

  playerAttackRate = 1000 * (100 / gameState.player.attackSpeed);

  playerTimer = 0;
  enemyTimer = 0;

  playerBonusXP = 0;
  playerReflectDamage = 0;
  playerActiveAbilities = [];

  switch (gameState.equippedMirror)
  {
    case FrameMaterial.Brass:
      switch (gameState.mirrors[gameState.equippedMirror].frameQuality)
      {
        case FrameQuality.Tarnished:
          playerBonusXP += 0.05;
          break;
        case FrameQuality.Polished:
          playerBonusXP += 0.1;
          break;
        case FrameQuality.Pristine:
          playerBonusXP += 0.15;
          break;
        case FrameQuality.Ornate:
          playerBonusXP += 0.2;
          break;
      }
      break;
    case FrameMaterial.Steel:
      switch (gameState.mirrors[gameState.equippedMirror].frameQuality)
      {
        case FrameQuality.Tarnished:
          playerReflectDamage += 0.05;
          break;
        case FrameQuality.Polished:
          playerReflectDamage += 0.1;
          break;
        case FrameQuality.Pristine:
          playerReflectDamage += 0.15;
          break;
        case FrameQuality.Ornate:
          playerReflectDamage += 0.2;
          break;
      }
      break;
    case FrameMaterial.Silver:
      playerActiveAbilities.push({
        type: AbilityType.DoubleStrike,
        rank: gameState.mirrors[gameState.equippedMirror].frameQuality,
        timer: 0
      });
      break;
  }
  for (const gem of gameState.equipedGems)
  {
    switch (gem)
    {
      case GemType.Emerald:
        switch (gameState.gems[gem].level)
        {
          case 1:
            playerBonusXP += 0.05;
            break;
          case 2:
            playerBonusXP += 0.1;
            break;
          case 3:
            playerBonusXP += 0.15;
            break;
          case 4:
            playerBonusXP += 0.2;
            break;
        }
        break;
      case GemType.FireOpal:
        playerActiveAbilities.push({
          type: AbilityType.Heal,
          rank: gameState.gems[gem].level,
          timer: 0
        });
        break;
      case GemType.Sapphire:
        switch (gameState.gems[gem].level)
        {
          case 1:
            playerReflectDamage += 0.05;
            break;
          case 2:
            playerReflectDamage += 0.1;
            break;
          case 3:
            playerReflectDamage += 0.15;
            break;
          case 4:
            playerReflectDamage += 0.2;
            break;
        }
        break;
      case GemType.Ruby:
        playerActiveAbilities.push({
          type: AbilityType.DoubleStrike,
          rank: gameState.mirrors[gameState.equippedMirror].frameQuality,
          timer: 0
        });
        break;
    }
  }

  enemyReflectDamage = 0;
  enemyActiveAbilities = [];

  if (combatEnemy)
  {
    for (const [ability, rank] of combatEnemy.abilities)
    {
      if (ability === AbilityType.Reflect)
      {
        switch (rank)
        {
          case 1:
            enemyReflectDamage = 0.05;
            break;
          case 2:
            enemyReflectDamage = 0.10;
            break;
          case 3:
            enemyReflectDamage = 0.15;
            break;
          case 4:
            enemyReflectDamage = 0.2;
            break;
        }
      }
      else
      {
        enemyActiveAbilities.push({
          type: ability,
          rank: rank,
          timer: 0
        });
      }
    }
  }
}

export function combat(now: number, delta: number): boolean
{
  const player = gameState.player;
  let combatRunning = true;
  const anyEnemiesAlive = (combatEnemy?.alive ?? false);

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

    if (combatEnemy && combatEnemy.alive)
    {
      enemyTimer += delta;
      updateCombatBarValues(enemyCombatBar, combatEnemy.health / combatEnemy.maxHealth, Math.min(1, enemyTimer / enemyAttackRate));
    }

    if (playerTimer >= playerAttackRate && !playerAttacking)
    {
      playerAttacking = true;
      moveNode(playerSpriteId, [playerPositon[0] + 10, playerPositon[1]], Easing.EaseOutQuad, 75).then(() =>
      {
        if (combatEnemy)
        {
          combatEnemy.health -= Math.ceil(player.attack * (10 / (10 + combatEnemy.defense)));
          if (enemyReflectDamage > 0)
          {
            player.health -= Math.ceil(enemyReflectDamage * combatEnemy.defense);
          }
        }
        moveNode(playerSpriteId, [playerPositon[0], playerPositon[1]], Easing.Linear, 25).then(() =>
        {
          playerTimer = 0;
          playerAttacking = false;

          // NOTE: Player Double Strike
          for (const ability of playerActiveAbilities)
          {
            switch (ability.type)
            {
              case AbilityType.DoubleStrike:
                if (ability.timer >= DoubleStrike_Cooldown[ability.rank - 1])
                {
                  ability.timer = 0;
                  playerTimer = playerAttackRate;
                }
                break;
            }
          }
        })
      });
    }

    if (enemyTimer >= enemyAttackRate && !enemyAttacking)
    {
      enemyAttacking = true;
      moveNode(enemySpriteId, [enemyPosition[0] - 10, enemyPosition[1]], Easing.EaseOutQuad, 75).then(() =>
      {
        if (combatEnemy)
        {
          player.health -= Math.ceil(combatEnemy.attack * (10 / (10 + player.defense)));
          if (enemyReflectDamage > 0)
          {
            combatEnemy.health -= Math.ceil(playerReflectDamage * player.defense);
          }
        }
        moveNode(enemySpriteId, [enemyPosition[0], enemyPosition[1]], Easing.Linear, 25).then(() =>
        {
          enemyTimer = 0;
          enemyAttacking = false;

          // NOTE: Enemy Double Strike
          for (const ability of enemyActiveAbilities)
          {
            switch (ability.type)
            {
              case AbilityType.DoubleStrike:
                if (ability.timer >= DoubleStrike_Cooldown[ability.rank - 1])
                {
                  ability.timer = 0;
                  enemyTimer = enemyAttackRate;
                }
                break;
            }
          }
        });
      });
    }

    for (const ability of playerActiveAbilities)
    {
      switch (ability.type)
      {
        case AbilityType.Heal:
          if (ability.timer >= Heal_Cooldown[ability.rank - 1])
          {
            player.health = Math.min(player.maxHealth, Math.ceil(player.health * 1.05));
            ability.timer = 0;
            // TODO(dbrad): Heal sound?
          }
          break;
      }
    }

    for (const ability of enemyActiveAbilities)
    {
      switch (ability.type)
      {
        case AbilityType.Heal:
          if (ability.timer >= Heal_Cooldown[ability.rank - 1])
          {
            if (combatEnemy)
            {
              combatEnemy.health = Math.min(combatEnemy.maxHealth, Math.ceil(combatEnemy.health * 1.05));
              // TODO(dbrad): Heal sound?
            }
            ability.timer = 0;
          }
          break;
        case AbilityType.Copy:
          break;
        case AbilityType.Disable:
          break;
        case AbilityType.Pacify:
          break;
        case AbilityType.Steal:
          break;
      }
    }

  }

  if (combatEnemy && combatEnemy.health <= 0 && combatEnemy.alive)
  {
    node_enabled[enemySpriteId] = false;
    node_enabled[enemyDyingSpriteId] = true;
    node_enabled[enemyCombatBar] = true;
    combatEnemy.alive = false;
    player.xp += Math.round(((gameState.currentLevel.difficulty * 3 * (1 + playerBonusXP)) + Number.EPSILON) * 100) / 100
    sceneDelay = createInterpolationData(1500, [0], [100], Easing.Linear, () =>
    {
      combatEnemy = null;
    });
  }

  if (!combatEnemy)
  {
    combatRunning = false;
  } else if (player.health <= 0)
  {
    combatRunning = false;
  }

  return combatRunning;
}