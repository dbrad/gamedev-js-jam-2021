import { AbilityColour, AbilityCooldown, AbilityName, AbilityType, GemType } from "../ability";
import { CurrencyKeys, Enemy, enemyColour, gameState } from "../gamestate";
import { Easing, InterpolationData, createInterpolationData, interpolate } from "../interpolate";
import { FrameMaterial, FrameQuality } from "../mirror";
import { addChildNode, createAbilityBarNode, createCombatBarNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_colour, node_enabled, node_size, node_sprite_timestamp, updateAbilityBar, updateCombatBarValues } from "../node";
import { combatHit, healSound, zzfxP } from "../zzfx";
import { rand, shuffle } from "../random";

export let combatRootId = -1;

let playerSpriteId = -1;
let playerDyingSpriteId = -1;
let playerPositon = [0, 0];
let playerAttacking = false;
let playerCombatBar = -1;

let playerActiveAbilityTimers: number[] = [];
let playerBonusXPlabel = -1;
let playerReflectLabel = -1;

let enemySpriteId = -1;
let enemyDyingSpriteId = -1;
let enemyPosition = [0, 0];
let enemyAttacking = false;
let enemyCombatBar = -1;

let enemyActiveAbilityTimers: number[] = [];
let enemyReflectLabel = -1;

let combatEnemy: Enemy | null = null;

let playerTimer = 0;
let enemyTimer = 0;

let sceneDelay: InterpolationData | null = null;

export function setupCombatScene(): void
{
  combatRootId = createNode();
  node_size[combatRootId] = [330, 180];

  const rootSize = node_size[combatRootId];
  const rootCenter = [rootSize[0] / 2, rootSize[1] / 2]

  let playerAbilitiesWindow = createWindowNode([4, 4], [88, rootSize[1] - 8]);
  addChildNode(combatRootId, playerAbilitiesWindow);

  const playerActiveLabel = createTextNode("actives");
  moveNode(playerActiveLabel, [4, 4]);
  addChildNode(playerAbilitiesWindow, playerActiveLabel);

  for (let t = 0; t < 5; t++)
  {
    const abilityTimer = createAbilityBarNode();
    moveNode(abilityTimer, [4, 14 + t * 20]);
    addChildNode(playerAbilitiesWindow, abilityTimer);
    playerActiveAbilityTimers.push(abilityTimer);
  }

  const playerPassiveLabel = createTextNode("passives");
  moveNode(playerPassiveLabel, [4, 114]);
  addChildNode(playerAbilitiesWindow, playerPassiveLabel);

  playerBonusXPlabel = createTextNode(" bonus xp");
  moveNode(playerBonusXPlabel, [4, 124]);
  addChildNode(playerAbilitiesWindow, playerBonusXPlabel);

  playerReflectLabel = createTextNode(" reflect");
  moveNode(playerReflectLabel, [4, 134]);
  addChildNode(playerAbilitiesWindow, playerReflectLabel);

  playerPositon = [110, rootCenter[1] - 12];
  playerSpriteId = createSprite([
    { spriteName: "player_right_01", duration: 500 },
    { spriteName: "player_right_02", duration: 500 },
  ], 2);
  moveNode(playerSpriteId, [playerPositon[0], playerPositon[1]]);
  addChildNode(combatRootId, playerSpriteId);

  playerCombatBar = createCombatBarNode(2);
  moveNode(playerCombatBar, [playerPositon[0], playerPositon[1] - 26]);
  addChildNode(combatRootId, playerCombatBar);

  //////////////////////////////////////////////////////////////

  let enemyAbilitiesWindow = createWindowNode([rootSize[0] - 92, 4], [88, rootSize[1] - 8]);
  addChildNode(combatRootId, enemyAbilitiesWindow);

  const enemyActiveLabel = createTextNode("actives");
  moveNode(enemyActiveLabel, [4, 4]);
  addChildNode(enemyAbilitiesWindow, enemyActiveLabel);

  for (let t = 0; t < 2; t++)
  {
    const abilityTimer = createAbilityBarNode();
    moveNode(abilityTimer, [4, 14 + t * 20]);
    addChildNode(enemyAbilitiesWindow, abilityTimer);
    enemyActiveAbilityTimers.push(abilityTimer);
  }

  const enemyPassiveLabel = createTextNode("passives");
  moveNode(enemyPassiveLabel, [4, 114]);
  addChildNode(enemyAbilitiesWindow, enemyPassiveLabel);

  enemyReflectLabel = createTextNode(" reflect");
  moveNode(enemyReflectLabel, [4, 134]);
  addChildNode(enemyAbilitiesWindow, enemyReflectLabel);

  enemyPosition = [rootSize[0] - 142, rootCenter[1] - 12];
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
  moveNode(enemyCombatBar, [enemyPosition[0], enemyPosition[1] - 26]);
  addChildNode(combatRootId, enemyCombatBar);
}

type ActiveAbility = {
  abilityType: AbilityType,
  rank: number,
  timer: number,
  disabled: boolean
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
  const player = gameState.player;
  if (enemy)
  {
    combatEnemy = enemy;
    // scale the enemy
    if (gameState.currentLevel.difficulty <= 3)
    {
      combatEnemy.maxHealth += player.level;
      combatEnemy.health = combatEnemy.maxHealth;
      combatEnemy.attack += player.level;
      combatEnemy.defense += Math.max(0, player.level - 1);
    }
    else if (gameState.currentLevel.difficulty <= 5)
    {
      combatEnemy.maxHealth += (player.level * 2);
      combatEnemy.health = combatEnemy.maxHealth;
      combatEnemy.attack += player.level;
      combatEnemy.defense += player.level;
    }
    else
    {
      combatEnemy.maxHealth += (player.level * 4);
      combatEnemy.health = combatEnemy.maxHealth;
      combatEnemy.attack += (player.level * 2);
      combatEnemy.defense += (player.level * 2);
    }

    enemyAttackRate = 1000 * (100 / enemy.attackSpeed);
    node_enabled[enemySpriteId] = true;
    node_enabled[enemyCombatBar] = true;
    node_enabled[enemyDyingSpriteId] = false;
    node_sprite_timestamp[enemyDyingSpriteId] = 0;
    node_colour[enemySpriteId] = enemyColour[gameState.currentLevel.realm];
    node_colour[enemyDyingSpriteId] = enemyColour[gameState.currentLevel.realm];
  }

  sceneDelay = null;

  playerAttackRate = 1000 * (100 / player.attackSpeed);

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
        abilityType: AbilityType.DoubleStrike,
        rank: gameState.mirrors[gameState.equippedMirror].frameQuality,
        timer: 0,
        disabled: false
      });
      break;
  }
  for (const gem of [0, 1, 2, 3, 4, 5, 6])
  {
    if (!gameState.gems[gem as GemType].owned) { continue; }
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
          abilityType: AbilityType.Heal,
          rank: gameState.gems[gem].level,
          timer: 0,
          disabled: false
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
          abilityType: AbilityType.DoubleStrike,
          rank: gameState.mirrors[gameState.equippedMirror].frameQuality,
          timer: 0,
          disabled: false
        });
        break;
    }
  }

  for (let t of playerActiveAbilityTimers)
  {
    node_enabled[t] = false;
  }
  for (let [i, ability] of playerActiveAbilities.entries())
  {
    node_enabled[playerActiveAbilityTimers[i]] = true;

    const name: string = AbilityName[ability.abilityType];
    const colour: number = AbilityColour[ability.abilityType];
    updateAbilityBar(playerActiveAbilityTimers[i], name, colour, ability.timer / AbilityCooldown[ability.abilityType][ability.rank]);
  }

  node_enabled[playerReflectLabel] = (playerReflectDamage > 0);
  node_enabled[playerBonusXPlabel] = (playerBonusXP > 0);

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
          abilityType: ability,
          rank: rank,
          timer: 0,
          disabled: false
        });
      }
    }

    for (let t of enemyActiveAbilityTimers)
    {
      node_enabled[t] = false;
    }
    for (let [i, ability] of enemyActiveAbilities.entries())
    {
      node_enabled[enemyActiveAbilityTimers[i]] = true;

      const name: string = AbilityName[ability.abilityType];
      const colour: number = AbilityColour[ability.abilityType];
      updateAbilityBar(enemyActiveAbilityTimers[i], name, colour, ability.timer / AbilityCooldown[ability.abilityType][ability.rank]);
    }

    node_enabled[enemyReflectLabel] = (enemyReflectDamage > 0);
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

    for (const [i, ability] of playerActiveAbilities.entries())
    {
      if (ability.disabled)
      {
        ability.timer = 0;
      }
      else
      {
        ability.timer += delta;
      }

      const name: string = AbilityName[ability.abilityType];
      const colour: number = AbilityColour[ability.abilityType];
      updateAbilityBar(playerActiveAbilityTimers[i], name, colour, ability.timer / AbilityCooldown[ability.abilityType][ability.rank]);
    }

    if (combatEnemy && combatEnemy.alive)
    {
      enemyTimer += delta;
      updateCombatBarValues(enemyCombatBar, combatEnemy.health / combatEnemy.maxHealth, Math.min(1, enemyTimer / enemyAttackRate));

      for (const [i, ability] of enemyActiveAbilities.entries())
      {
        if (ability.disabled)
        {
          ability.timer = 0;
        }
        else
        {
          ability.timer += delta;
        }
        const name: string = AbilityName[ability.abilityType];
        const colour: number = AbilityColour[ability.abilityType];
        updateAbilityBar(enemyActiveAbilityTimers[i], name, colour, ability.timer / AbilityCooldown[ability.abilityType][ability.rank]);
      }
    }

    if (playerTimer >= playerAttackRate && !playerAttacking)
    {
      playerAttacking = true;
      moveNode(playerSpriteId, [playerPositon[0] + 10, playerPositon[1]], Easing.EaseOutQuad, 75).then(() =>
      {
        if (combatEnemy)
        {
          zzfxP(combatHit);
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
            switch (ability.abilityType)
            {
              case AbilityType.DoubleStrike:
                if (ability.timer >= AbilityCooldown[ability.abilityType][ability.rank - 1])
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
          zzfxP(combatHit);
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
            switch (ability.abilityType)
            {
              case AbilityType.DoubleStrike:
                if (ability.timer >= AbilityCooldown[ability.abilityType][ability.rank - 1])
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
      switch (ability.abilityType)
      {
        case AbilityType.Heal:
          if (ability.timer >= AbilityCooldown[ability.abilityType][ability.rank - 1])
          {
            player.health = Math.min(player.maxHealth, player.health + Math.ceil(player.maxHealth * 0.05));
            updateCombatBarValues(playerCombatBar, player.health / player.maxHealth, Math.min(1, playerTimer / playerAttackRate));
            zzfxP(healSound);
            ability.timer = 0;
          }
          break;
      }
    }

    for (const ability of enemyActiveAbilities)
    {
      if (ability.timer >= AbilityCooldown[ability.abilityType][ability.rank - 1])
      {
        switch (ability.abilityType)
        {
          case AbilityType.Heal:
            if (combatEnemy)
            {
              combatEnemy.health = Math.min(combatEnemy.maxHealth, combatEnemy.health + Math.ceil(combatEnemy.maxHealth * 0.05));
              updateCombatBarValues(enemyCombatBar, combatEnemy.health / combatEnemy.maxHealth, Math.min(1, enemyTimer / enemyAttackRate));
              zzfxP(healSound);
            }
            break;
          case AbilityType.Copy:
            const copyIndex = rand(0, playerActiveAbilities.length - 1);
            const copyAbility = playerActiveAbilities[copyIndex];

            if (copyAbility)
            {
              enemyActiveAbilities[1] = {
                abilityType: copyAbility.abilityType,
                rank: copyAbility.rank,
                timer: 0,
                disabled: false
              };

              for (let t of enemyActiveAbilityTimers)
              {
                node_enabled[t] = false;
              }
              for (let [i, ability] of enemyActiveAbilities.entries())
              {
                node_enabled[enemyActiveAbilityTimers[i]] = true;

                const name: string = AbilityName[ability.abilityType];
                const colour: number = AbilityColour[ability.abilityType];
                updateAbilityBar(enemyActiveAbilityTimers[i], name, colour, ability.timer / AbilityCooldown[ability.abilityType][ability.rank]);
              }
            }
            break;
          case AbilityType.Disable:
            if (playerActiveAbilities.length > 0)
            {
              for (const a of playerActiveAbilities)
              {
                a.disabled = false;
              }
              const disableIndex = rand(0, playerActiveAbilities.length - 1);
              playerActiveAbilities[disableIndex].disabled = true;
            }
            break;
          case AbilityType.Pacify:
            playerTimer = 0;
            for (const a of playerActiveAbilities)
            {
              a.timer = 0;
            }
            break;
          case AbilityType.Steal:
            const keys = shuffle([...CurrencyKeys]);
            for (const key of keys)
            {
              if (gameState.currentLevel.currencies[key] > 0)
              {
                gameState.currentLevel.currencies[key] = Math.max(0, gameState.currentLevel.currencies[key] - Math.ceil(gameState.currentLevel.currencies[key] * (0.05 * ability.rank)));
                break;
              }
            }
            break;
        }
        ability.timer = 0;
      }
    }
  }

  if (combatEnemy && combatEnemy.health <= 0 && combatEnemy.alive)
  {
    node_enabled[enemySpriteId] = false;
    node_enabled[enemyDyingSpriteId] = true;
    node_enabled[enemyCombatBar] = true;
    combatEnemy.alive = false;
    player.xpPool += Math.round(((gameState.currentLevel.difficulty * 3 * (1 + playerBonusXP)) + Number.EPSILON) * 100) / 100
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
    player.health = 0;
    combatRunning = false;
  }

  return combatRunning;
}