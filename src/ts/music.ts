let campMusic: HTMLAudioElement;
let adventureMusic01: HTMLAudioElement;
let adventureMusic02: HTMLAudioElement;

export function setupMusic(): void
{
  campMusic = document.createElement("audio");
  campMusic.src = "camp_theme.wav";
  campMusic.setAttribute("preload", "auto");
  campMusic.setAttribute("controls", "none");
  campMusic.setAttribute("loop", "true");
  campMusic.style.display = "none";
  campMusic.volume = 0.5;
  document.body.appendChild(campMusic);

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
    }, 260);
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
    }, 260);
  });
}
export function playCampMusic()
{
  campMusic.play();
}

export function stopCampMusic()
{
  campMusic.pause();
  campMusic.currentTime = 0;
}

export function playadventureMusic()
{
  adventureMusic01.play();
}

export function stopAdventureMusic()
{
  adventureMusic01.pause();
  adventureMusic01.currentTime = 0;

  adventureMusic02.pause();
  adventureMusic02.currentTime = 0;
}