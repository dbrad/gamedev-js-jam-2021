import { Align, pushText } from "./draw";

let frameCount: number = 0;
let fps: number = 0;
let lastFps: number = 0;
let ms: number = 0;
let averageFrameTime = 0;

let displayFps = "00.00 hz";
let displayMs = "00.00 ms";
let displayFrameTime = "0.00 ms";

export function tickStats(delta: number, frameStart: number): void
{
  // @ifdef DEBUG
  const now = performance.now();

  ms = (0.9 * delta) + (0.1 * ms);
  averageFrameTime = (0.9 * (now - frameStart)) + (0.1 * averageFrameTime);
  if (averageFrameTime < 0) averageFrameTime = 0;

  if (ms > 250)
  {
    fps = 0;
    ms = 0;
    averageFrameTime = 0;
  }

  if (frameStart >= lastFps + 1000)
  {
    fps = 0.9 * frameCount * 1000 / (frameStart - lastFps) + 0.1 * fps;
    displayFps = `${ fps.toFixed((2)) } hz`;
    displayMs = `${ ms.toFixed(2) } ms`;
    displayFrameTime = `${ averageFrameTime.toFixed(2) } ms`;;

    lastFps = frameStart;
    frameCount = 0;
  }
  frameCount++;

  pushText(displayFps, 638, 1, { textAlign: Align.Right });
  pushText(displayMs, 638, 10, { textAlign: Align.Right });
  pushText(displayFrameTime, 638, 19, { textAlign: Align.Right });
  // @endif
}