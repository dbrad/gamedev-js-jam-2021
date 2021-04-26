import { Music, playMusic } from "../music";
import { Scenes, setScene } from "../scene-manager";
import { addChildNode, createButtonNode, createNode, createTextNode, moveNode, node_enabled, node_position, node_size, node_visible } from "../node";
import { createChoiceDialogEvent, createEventChoice } from "../room-events";
import { fadeBackgroundTo, gameState, loadGameState, resetGameState, wallColour } from "../gamestate";
import { screenCenterX, screenCenterY, screenHeight, screenWidth } from "../screen";

import { Align } from "../draw";
import { hasObject } from "../storage";
import { hexToColour } from "../util";
import { inputContext } from "../input";

const VERSION = `1.0.0-b2`;
export let mainMenuRootId = -1;
let mainMenuTitleTextId = -1;
let startGameButtonId = -1;
let continueGameButtonId = -1;

const options: number[] = [];
export function setupMainMenuScene(): void
{
  mainMenuRootId = createNode();
  node_visible[ mainMenuRootId ] = false;
  node_size[ mainMenuRootId ][ 0 ] = screenWidth;
  node_size[ mainMenuRootId ][ 1 ] = screenHeight;

  const versionText = createTextNode( VERSION, 1, Align.Right );
  moveNode( versionText, [ screenWidth - 4, screenHeight - 12 ] );
  addChildNode( mainMenuRootId, versionText );

  mainMenuTitleTextId = createTextNode( "Rogue Reflections", 4, Align.Center );
  moveNode( mainMenuTitleTextId, [ screenCenterX, 50 ] );
  addChildNode( mainMenuRootId, mainMenuTitleTextId );

  mainMenuTitleTextId = createTextNode( "gamedev.js 2021 jam" );
  moveNode( mainMenuTitleTextId, [ 4, screenHeight - 22 ] );
  addChildNode( mainMenuRootId, mainMenuTitleTextId );

  mainMenuTitleTextId = createTextNode( "entry by david brad (c) 2021" );
  moveNode( mainMenuTitleTextId, [ 4, screenHeight - 12 ] );
  addChildNode( mainMenuRootId, mainMenuTitleTextId );

  startGameButtonId = createButtonNode( "new game", [ 200, 40 ] );
  moveNode( startGameButtonId, [ 220, screenCenterY + 60 ] );
  addChildNode( mainMenuRootId, startGameButtonId );
  options.push( startGameButtonId );

  continueGameButtonId = createButtonNode( "continue", [ 200, 40 ] );
  moveNode( continueGameButtonId, [ 220, screenCenterY ] );
  addChildNode( mainMenuRootId, continueGameButtonId );
  options.push( continueGameButtonId );
}

let colourState = 0;
let fadeState = 0;
export function mainMenuScene( now: number, delta: number ): void
{
  playMusic( Music.Title );
  if ( fadeState === 0 )
  {
    const colour = hexToColour( wallColour[ colourState + 1 ] );
    fadeBackgroundTo( [ colour[ 3 ], colour[ 2 ], colour[ 1 ] ], 1000, () => { fadeState = 1; colourState = ( colourState + 1 ) % 7; } );
  }
  else
  {
    fadeBackgroundTo( [ 0, 0, 0 ], 4000, () => { fadeState = 0; } );
  }

  node_enabled[ continueGameButtonId ] = hasObject( "f1" );

  if ( inputContext.fire === startGameButtonId )
  {
    if ( hasObject( "f1" ) )
    {
      const yes = createEventChoice( "yes", () =>
      {
        resetGameState();
        setScene( Scenes.Camp );

      } );
      const no = createEventChoice( "no", () => { } );
      gameState.currentEvent = createChoiceDialogEvent( [ yes, no ], "A save file already exists. All progress will be lost, do you want to start a new file?" );
    }
    else
    {
      resetGameState();
      setScene( Scenes.Camp );
    }
  }

  if ( inputContext.fire === continueGameButtonId )
  {
    loadGameState();
    setScene( Scenes.Camp );
  }
}