import { emit } from "./event";

export enum Key
{
  UNKNOWN,
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export const keyUp: boolean[] = [];
export const keyDown: boolean[] = [];


export function initInput(): void
{
  window.addEventListener("keydown", (ev) =>
  {
    let key: Key = Key.UNKNOWN;
    switch (ev.code)
    {
      case "KeyW":
      case "KeyZ":
      case "ArrowUp":
        key = Key.UP;
        break;
      case "KeyS":
      case "ArrowDown":
        key = Key.DOWN;
        break;
      case "KeyA":
      case "KeyQ":
      case "ArrowLeft":
        key = Key.LEFT;
        break;
      case "KeyD":
      case "ArrowRight":
        key = Key.RIGHT;
        break;
    }
    keyDown[key] = true;
    emit("key_pressed", key)
    keyUp[key] = false;
  });

  window.addEventListener("keyup", (ev) =>
  {
    let key: Key = Key.UNKNOWN;
    switch (ev.code)
    {
      case "KeyW":
      case "KeyZ":
      case "ArrowUp":
        key = Key.UP;
        break;
      case "KeyS":
      case "ArrowDown":
        key = Key.DOWN;
        break;
      case "KeyA":
      case "KeyQ":
      case "ArrowLeft":
        key = Key.LEFT;
        break;
      case "KeyD":
      case "ArrowRight":
        key = Key.RIGHT;
        break;
    }
    keyDown[key] = false;
    keyUp[key] = true;
  });
}
