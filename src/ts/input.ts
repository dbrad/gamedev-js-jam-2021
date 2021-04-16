import { screenHeight, screenWidth } from "./screen";

export const inputContext = {
  hot: -1,
  active: -1,
  fire: -1
}
export const cursor = [0, 0];
export let mouseDown = false;
let canvasRef: HTMLCanvasElement;

const isTouch = (e: Event | PointerEvent | TouchEvent): e is TouchEvent =>
{
  return (e.type[0] === "t");
}

const pointerMove = (e: PointerEvent | TouchEvent) =>
{
  const canvasBounds = canvasRef.getBoundingClientRect();
  if (isTouch(e))
  {
    e.preventDefault();
    const touch: Touch = e.touches[0];
    cursor[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
    cursor[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
    return;
  }
  e = e as PointerEvent;
  cursor[0] = Math.floor((e.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
  cursor[1] = Math.floor((e.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
}

const pointerDown = (e: PointerEvent | TouchEvent) =>
{
  if (isTouch(e))
  {
    const canvasBounds = canvasRef.getBoundingClientRect();
    const touchEvent = e as TouchEvent;
    touchEvent.preventDefault();
    const touch: Touch = touchEvent.touches[0];
    cursor[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
    cursor[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
  }

  mouseDown = true;
}

const pointerUp = (_: PointerEvent | TouchEvent) =>
{
  mouseDown = false;
}

export function initializeInput(canvas: HTMLCanvasElement)
{
  canvasRef = canvas;

  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("touchmove", pointerMove);

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("touchstart", pointerDown);

  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("touchend", pointerUp);
}