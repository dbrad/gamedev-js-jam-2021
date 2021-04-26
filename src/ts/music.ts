let titleMusic: HTMLAudioElement;
let campMusic: HTMLAudioElement;
let adventureMusic01: HTMLAudioElement;
let adventureMusic02: HTMLAudioElement;

export function setupMusic(): void
{
  titleMusic = document.createElement("audio");
  titleMusic.src = "title_theme.wav";
  titleMusic.setAttribute("preload", "auto");
  titleMusic.setAttribute("controls", "none");
  titleMusic.style.display = "none";
  titleMusic.volume = 0.5;
  document.body.appendChild(titleMusic);
  titleMusic.addEventListener("ended", () =>
  {
    setTimeout(() =>
    {
      titleMusic.currentTime = 0;
      titleMusic.play()
    }, 1500);
  });

  campMusic = document.createElement("audio");
  campMusic.src = "camp_theme.wav";
  campMusic.setAttribute("preload", "auto");
  campMusic.setAttribute("controls", "none");
  campMusic.style.display = "none";
  campMusic.volume = 0.5;
  document.body.appendChild(campMusic);
  campMusic.addEventListener("ended", () =>
  {
    setTimeout(() =>
    {
      campMusic.currentTime = 0;
      campMusic.play()
    }, 1500);
  });

  adventureMusic01 = document.createElement("audio");
  adventureMusic01.src = "dungeon_01.wav";
  adventureMusic01.setAttribute("preload", "auto");
  adventureMusic01.setAttribute("controls", "none");
  adventureMusic01.style.display = "none";
  adventureMusic01.volume = 0.5;
  document.body.appendChild(adventureMusic01);
  adventureMusic01.addEventListener("ended", () =>
  {
    setTimeout(() =>
    {
      adventureMusic02.currentTime = 0;
      adventureMusic02.play()
    }, 1500);
  });

  adventureMusic02 = document.createElement("audio");
  adventureMusic02.src = "dungeon_02.wav";
  adventureMusic02.setAttribute("preload", "auto");
  adventureMusic02.setAttribute("controls", "none");
  adventureMusic02.style.display = "none";
  adventureMusic02.volume = 0.5;
  document.body.appendChild(adventureMusic02);
  adventureMusic02.addEventListener("ended", () =>
  {
    setTimeout(() =>
    {
      adventureMusic01.currentTime = 0;
      adventureMusic01.play()
    }, 1500);
  });
}


export enum Music
{
  Title,
  Camp,
  Adventure
}

export function toggleVolume(): void
{
  if (campMusic && campMusic.volume === 0.5)
  {
    if (titleMusic) titleMusic.volume = 0;
    if (campMusic) campMusic.volume = 0;
    if (adventureMusic01) adventureMusic01.volume = 0;
    if (adventureMusic02) adventureMusic02.volume = 0;
    musicMuted = true;
  }
  else
  {
    if (titleMusic) titleMusic.volume = 0.5;
    if (campMusic) campMusic.volume = 0.5;
    if (adventureMusic01) adventureMusic01.volume = 0.5;
    if (adventureMusic02) adventureMusic02.volume = 0.5;
    musicMuted = false;
  }
}

let nowPlaying: Music | null = null;
export let musicMuted: boolean = false;
export function playMusic(music: Music): void
{
  if (nowPlaying !== music)
  {
    switch (music)
    {
      case Music.Title:
        campMusic.pause();
        campMusic.currentTime = 0;

        adventureMusic01.pause();
        adventureMusic01.currentTime = 0;
        adventureMusic02.pause();
        adventureMusic02.currentTime = 0;

        titleMusic.play();
        break;
      case Music.Camp:
        titleMusic.pause();
        titleMusic.currentTime = 0;

        adventureMusic01.pause();
        adventureMusic01.currentTime = 0;
        adventureMusic02.pause();
        adventureMusic02.currentTime = 0;

        campMusic.play();
        break;
      case Music.Adventure:
        titleMusic.pause();
        titleMusic.currentTime = 0;

        campMusic.pause();
        campMusic.currentTime = 0;

        adventureMusic01.play();
        break;
    }
    nowPlaying = music;
  }
}