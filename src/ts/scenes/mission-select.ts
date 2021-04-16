import { rand, shuffle } from "../random";

export function generateLevel( difficulty: number )
{
  const numberOfRooms = Math.floor( rand( 0, 2 ) + 5 + difficulty * 2.6 );
  const map: number[] = [];
  const deadEnds: number[] = [];

  const neighbourIsValid: ( neighbour: number ) => boolean = ( neighbour: number ) =>
  {

    // check for edges
    if ( neighbour <= 0 || neighbour > 79 || neighbour % 10 === 0 ) return false;

    // check if already a room
    if ( map[ neighbour ] && map[ neighbour ] > 0 ) return false;

    if ( roomCount >= numberOfRooms ) return false;

    let numberOfNeighbours = 0;
    for ( const nDir of [ -1, -10, 1, 10 ] )
    {
      // check for edges
      const neighbourNeighbour = neighbour + nDir;

      // check if already a room
      if ( map[ neighbourNeighbour ] && map[ neighbourNeighbour ] > 0 )
      {
        numberOfNeighbours++;
        if ( numberOfNeighbours > 1 ) break;
      }
    }
    if ( numberOfNeighbours > 1 ) return false;
    return true;
  };

  let roomCount = 0;
  while ( roomCount < numberOfRooms )
  {
    roomCount = 0;
    map.length = 0
    deadEnds.length = 0
    const roomQueue: number[] = [];
    map[ 35 ] = 1;
    roomQueue.push( 35 );
    do
    {
      let room = roomQueue.shift();
      if ( room )
      {
        let roomAdded = false;
        const dirs = shuffle( [ 10, -1, 1, -10 ] );
        for ( const dir of dirs )
        {
          const neighbour = room + dir;
          if ( !neighbourIsValid( neighbour ) ) continue;
          if ( rand( 0, 100 ) < 50 ) continue;

          map[ neighbour ] = 1;
          roomQueue.push( neighbour );
          roomAdded = true;
          roomCount++;
        }
        if ( !roomAdded )
        {
          deadEnds.push( room );
        }
      }
    } while ( roomQueue.length > 0 );
  }

  console.log( "=-=-=-=-=-=-=-=-=" );
  for ( let y = 0; y < 8; y++ )
  {
    let str = "";
    for ( let x = 1; x < 10; x++ )
    {
      const index = y * 10 + x;
      if ( deadEnds.indexOf( index ) > -1 )
      {
        str += " # ";
      }
      else
      {
        str += map[ y * 10 + x ] ? " + " : "   ";

      }
    }
    console.log( str );
  }
  console.log( "=-=-=-=-=-=-=-=-=" );
}
