import { Align, pushQuad, pushSpriteAndSave, pushText } from "../draw";
import { addChildNode, createButtonNode, createNode, createSprite, createTextNode, createWindowNode, moveNode, node_size, node_visible } from "../node";
import { screenCenterX, screenHeight, screenWidth } from "../screen";

export let campRootId = -1;
export function setupCampScene(): void
{
  campRootId = createNode();
  node_visible[campRootId] = false;
  node_size[campRootId][0] = screenWidth;
  node_size[campRootId][1] = screenHeight;

  const fire = createSprite(
    [
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_03", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
      { spriteName: "fire_01", duration: 225 },
      { spriteName: "fire_03", duration: 225 },
      { spriteName: "fire_02", duration: 225 },
    ], 5);
  moveNode(fire, [screenCenterX - 128, 236]);
  addChildNode(campRootId, fire);

  const player = createSprite([{ spriteName: "player_left_02", duration: 0 }], 5);
  moveNode(player, [screenCenterX - 64, 236]);
  addChildNode(campRootId, player);

  const smith = createSprite(
    [
      { spriteName: "smith_01", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
      { spriteName: "smith_03", duration: 75 },
      { spriteName: "smith_04", duration: 250 },
      { spriteName: "smith_02", duration: 125 },
    ], 4);
  moveNode(smith, [screenCenterX - 240, 240 - 64]);
  addChildNode(campRootId, smith);

  const moon = createSprite([{ spriteName: "moon", duration: 0 }], 4);
  moveNode(moon, [16, 16]);
  addChildNode(campRootId, moon);

  const window = createWindowNode([420, 4], [206, 352]);
  addChildNode(campRootId, window);

  const option01 = createButtonNode("upgrade", [8, 8], [190, 40]);
  addChildNode(window, option01);
  const option02 = createButtonNode("depart", [8, 68], [190, 40]);
  addChildNode(window, option02);
  const option03 = createButtonNode("status", [8, 128], [190, 40]);
  addChildNode(window, option03);
  const option04 = createButtonNode("inventory", [8, 188], [190, 40]);
  addChildNode(window, option04);
  const option05 = createButtonNode("save + quit", [8, 304], [190, 40]);
  addChildNode(window, option05);
}

export function campScene(): void
{
  pushQuad(0, 0, 640, 120, 0xFF3B2006);
  pushQuad(0, 120, 640, 80, 0xFF3B3006);
  pushQuad(0, 200, 640, 40, 0xFF3B4006);
  pushQuad(0, 240, 640, 120, 0XFF000000);

  for (let i = 0; i < 640 / 16; i++)
  {
    pushSpriteAndSave(`grass_0${ i % 3 + 1 }`, i * 16, 232);
  }
}