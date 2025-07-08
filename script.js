console.log("Lets Write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinSec(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remsecs = Math.floor(seconds % 60);

  const formattedMin = String(minutes).padStart(2, "0");
  const formattedSec = String(remsecs).padStart(2, "0");

  return `${formattedMin}:${formattedSec}`;
}

function attachSongClickListeners() {
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://Your-IP-Address/${folder}/`);

  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <img class="invert" src="http://Your-IP-Address/image-s/music.svg" alt="music icon">
        <div class="info">
          <div>${song
            .replaceAll("%20", " ")
            .replaceAll("/", " ")
            .replaceAll("%", " ")}</div>
          <div>Vivek</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="http://Your-IP-Address/image-s/play.svg" alt="">
        </div>
      </li>`;
  }

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `http://Your-IP-Address/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "http://Your-IP-Address/image-s/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track)
    .replaceAll(".mp3", "")
    .replaceAll(".m4a", "")
    .replaceAll("/", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://Your-IP-Address/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  for (let e of anchors) {
    console.log("Anchor href:", e.href); // Debug

    // Match /songs/<folder> or /songs/<folder>/ but skip /songs/ itself
    if (/\/songs\/[^\/]+\/?$/.test(e.href) && !e.href.endsWith("/songs/")) {
      let url = new URL(e.href);
      let paths = url.pathname.split("/");
      let folder = paths[paths.length - 1] || paths[paths.length - 2];

      console.log("Found album folder:", folder);

      try {
        let info = await fetch(
          `http://Your-IP-Address/songs/${folder}/info.json`
        );
        let metadata = await info.json();

        console.log("Loaded info.json:", metadata);

        cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5L19 12L8 19V5Z" fill="#141834" />
            </svg>
          </div>
          <img src="http://Your-IP-Address/songs/${folder}/cover.jpg" alt="cover image" style="width:100%">
          <h2>${metadata.title}</h2>
          <p>${metadata.description}</p>
        </div>`;
      } catch (err) {
        console.warn(`❌ Could not load info.json for folder: ${folder}`);
      }
    }
  }

  // Event listeners
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      attachSongClickListeners();
    });
  });
}

async function main() {
  await getSongs("songs/AlanWalker");
  playMusic(songs[0], true);
  attachSongClickListeners();

  displayAlbums();

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "http://Your-IP-Address/image-s/pause.svg";
    } else {
      currentSong.pause();
      play.src = "http://Your-IP-Address/image-s/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinSec(
      currentSong.currentTime
    )} / ${secondsToMinSec(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -110 + "%";
  });

  previous.addEventListener("click", () => {
    let currentPath = new URL(currentSong.src).pathname.replace(
      `/${currFolder}/`,
      ""
    );
    let index = songs.indexOf(currentPath);

    if (index !== -1 && index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let currentPath = new URL(currentSong.src).pathname.replace(
      `/${currFolder}/`,
      ""
    );
    let index = songs.indexOf(currentPath);

    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src =
          "http://Your-IP-Address/image-s/volume.svg";
      }
    });

  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "http://Your-IP-Address/image-s/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = "http://Your-IP-Address/image-s/volume.svg";
      currentSong.volume = 1;
      document.querySelector(".range input").value = 100;
    }
  });
}

main();
