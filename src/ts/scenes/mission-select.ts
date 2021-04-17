import { gameState } from "../gamestate";
import { rand, shuffle } from "../random";

const base_room =
  [
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  ];

const north_door = [5, 0];
const south_door = [5, 8];
const west_door = [0, 4];
const east_door = [10, 4];

const roomMapWidth = 9;
const roomMapHeight = 8;
const roomWidth = 11;
const roomHeight = 9;
const tileMapWidth = 110;
const tileMapHeight = 72;
export function gameSetup(): void
{
  const roomMap = generateRoomLayout(5);
  const tileMap: Int8Array = new Int8Array(tileMapWidth * tileMapHeight);
  for (let ry = 0; ry < roomMapHeight; ry++)
  {
    for (let rx = 1; rx <= roomMapWidth; rx++)
    {
      const roomIndex = ry * 10 + rx;
      if (roomMap[roomIndex] === 1)
      {
        const x = rx * roomWidth;
        const y = ry * roomHeight;
        for (let ty = 0; ty < roomHeight; ty++)
        {
          for (let tx = 0; tx < roomWidth; tx++)
          {
            const index = ((y + ty) * tileMapWidth) + (x + tx);
            tileMap[index] = base_room[ty * roomWidth + tx];
          }
        }

        if (roomMap[roomIndex - 10] === 1) 
        {
          const nx = x + north_door[0];
          const ny = y + north_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 1;
        }
        if (roomMap[roomIndex + 1] === 1)
        {
          const nx = x + east_door[0];
          const ny = y + east_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 1;
        }
        if (roomMap[roomIndex + 10] === 1)
        {
          const nx = x + south_door[0];
          const ny = y + south_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 1;
        }
        if (roomMap[roomIndex - 1] === 1)
        {
          const nx = x + west_door[0];
          const ny = y + west_door[1];
          const index = ny * tileMapWidth + nx;
          tileMap[index] = 1;
        }

      }
    }
  }
  gameState.currentMap = tileMap;
  // let line = 10;
  // for (let y = 0; y < tileMapHeight; y++)
  // {
  //   let str = "";
  //   for (let x = 0; x < tileMapWidth; x++)
  //   {
  //     if (tileMap[y * tileMapWidth + x] === 2)
  //     {
  //       str += "#";
  //     }
  //     else
  //     {
  //       str += " ";
  //     }
  //   }
  //   console.log(`${ line }. ${ str }`);
  //   line++;
  // }

}

function generateRoomLayout(difficulty: number): number[]
{
  const numberOfRooms = Math.floor(rand(0, 2) + 5 + difficulty * 2.6);
  const map: number[] = [];
  const deadEnds: number[] = [];

  const neighbourIsValid: (neighbour: number) => boolean = (neighbour: number) =>
  {
    if (neighbour <= 0 || neighbour > 79 || neighbour % 10 === 0) return false;
    if (map[neighbour] && map[neighbour] > 0) return false;
    if (roomCount >= numberOfRooms) return false;

    let numberOfNeighbours = 0;
    for (const nDir of [-1, -10, 1, 10])
    {
      const neighbourNeighbour = neighbour + nDir;
      if (map[neighbourNeighbour] && map[neighbourNeighbour] > 0)
      {
        numberOfNeighbours++;
        if (numberOfNeighbours > 1) break;
      }
    }
    if (numberOfNeighbours > 1) return false;
    return true;
  };

  let roomCount = 0;
  while (roomCount < numberOfRooms)
  {
    roomCount = 0;
    map.length = 0
    deadEnds.length = 0
    const roomQueue: number[] = [];
    map[35] = 1;
    roomQueue.push(35);
    do
    {
      let room = roomQueue.shift();
      if (room)
      {
        let roomAdded = false;
        const dirs = shuffle([10, -1, 1, -10]);
        for (const dir of dirs)
        {
          const neighbour = room + dir;
          if (!neighbourIsValid(neighbour)) continue;
          if (rand(0, 100) < 50) continue;

          map[neighbour] = 1;
          roomQueue.push(neighbour);
          roomAdded = true;
          roomCount++;
        }
        if (!roomAdded)
        {
          deadEnds.push(room);
        }
      }
    } while (roomQueue.length > 0);
  }

  // for (let y = 0; y < roomMapHeight; y++)
  // {
  //   let str = "";
  //   for (let x = 0; x <= roomMapWidth; x++)
  //   {
  //     if (map[y * 10 + x] === 1)
  //     {
  //       str += "#"
  //     }
  //     else
  //     {
  //       str += " ";
  //     }
  //   }
  //   console.log(str);
  // }

  return map;
}
