import { Enemy } from "../gamestate";
import { addChildNode, createNode, createSprite, node_size } from "../node";

let combatRootId = -1;
let playerSpriteId = -1;
let enemySpriteId = -1;
let combetEnemies: Enemy[] = [];

export function setupCombatScene(): void
{
  combatRootId = createNode();
  node_size[combatRootId] = [10, 10];

  playerSpriteId = createSprite([], 2, true);
  addChildNode(combatRootId, playerSpriteId);

  enemySpriteId = createSprite([], 2, true);
  addChildNode(combatRootId, enemySpriteId);
}

export function prepareCombatScene(enemies: Enemy[]): void
{
  combetEnemies = enemies;

}

export function combat(now: number, number: number)
{

}