import { rand } from "../random";

export function generateLevel(difficulty: number)
{
  const numberOfRooms = Math.floor(rand(0, 2) + 5 + difficulty * 2.6);
  let roomCount = 0;

  const map: number[] = [];
  const roomQueue: number[] = [];
  const deadEnds: number[] = [];
  roomQueue.push(35);
  do
  {
    let room = roomQueue.shift();
    if (room)
    {
      let roomAdded = false;

      for (const dir of [-1, -10, 1, 10])
      {
        if (roomCount >= numberOfRooms)
        {
          roomQueue.length = 0;
          break;
        }
        const neighbour = room + dir;

        // check for edges
        if (neighbour < 0 || neighbour > 79 || neighbour % 10 === 0) continue;

        // check if already a room
        if (map[neighbour] && map[neighbour] > 0) continue;

        let numberOfNeighbours = 0;
        for (const nDir of [-1, -10, 1, 10])
        {
          // check for edges
          const neighbourNeighbour = neighbour + nDir;
          if (neighbourNeighbour < 0 || neighbourNeighbour > 79 || neighbourNeighbour % 10 === 0) continue;

          // check if already a room
          if (map[neighbourNeighbour] && map[neighbourNeighbour] > 0)
          {
            numberOfNeighbours++;
            if (numberOfNeighbours > 1)
              break;
          }
        }
        if (numberOfNeighbours > 1) continue;

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
    if (roomQueue.length === 0 && roomCount < numberOfRooms)
    {
      roomQueue.push(35);
    }
  } while (roomQueue.length > 0)

  for (let y = 1; y < 8; y++)
  {
    let str = "";
    for (let x = 1; x < 10; x++)
    {
      str += map[y * 10 + x] ? "+" : " ";
    }
    console.log(str);
  }
}