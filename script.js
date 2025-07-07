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

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);

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
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> <img class="invert" src="image-s/music.svg" alt="music icon">
                            <div class="info">
                                <div>${song
                                  .replaceAll("%20", " ")
                                  .replaceAll("/", " ")
                                  .replaceAll("%", " ")}
                                  </div>
                                <div>Vivek</div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="image-s/play.svg" alt="">
                            </div></li>`;
  }

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "image-s/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track)
    .replaceAll(".mp3", "")
    .replaceAll(".m4a", "")
    .replaceAll("/", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5L19 12L8 19V5Z" fill="#141834" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }

  // Load the playlist whenever card is clicked.
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // get the list of all songs
  await getSongs("songs/AlanWalker");
  playMusic(songs[0], true);

  // Display all the albums on the page.
  displayAlbums();

  // attach an event listenerto each song.
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  // attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "image-s/pause.svg";
    } else {
      currentSong.pause();
      play.src = "image-s/play.svg";
    }
  });

  // listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinSec(
      currentSong.currentTime
    )} / ${secondsToMinSec(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener to hamburger.
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // Add an event listener to hamburger.
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -110 + "%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    console.log("previous clicked");

    let currentPath = new URL(currentSong.src).pathname.replace(
      `/${currFolder}/`,
      ""
    );
    let index = songs.indexOf(currentPath);

    if (index !== -1 && index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
    // console.log(currentPath, index, songs);
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();

    let currentPath = new URL(currentSong.src).pathname.replace(
      `/${currFolder}/`,
      ""
    );
    let index = songs.indexOf(currentPath);

    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume.
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add an event listener to mute the track.
    document.querySelector(".volume > img").addEventListener("click", e=>{
      if(e.target.src.includes("image-s/volume.svg")){
        e.target.src = e.target.src.replace("image-s/volume.svg", "image-s/mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{
        
        e.target.src = e.target.src.replace("image-s/mute.svg","image-s/volume.svg");
        currentSong.volume = 1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
      }
    })
}

main();
