console.log("Lets Write JavaScript");
let currentSong = new Audio();

function secondsToMinSec(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }

  const minutes = Math.floor(seconds / 60);
  const remsecs = Math.floor(seconds % 60);

  const formattedMin = String(minutes).padStart(2, "0");
  const formattedSec = String(remsecs).padStart(2, "0");

  return `${formattedMin}:${formattedSec}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");

  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
      songs.push(element.href.split("/songs")[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = /songs/ + track;
  if (!pause) {
    currentSong.play();
    play.src = "image-s/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track)
    .replaceAll(".mp3", "")
    .replaceAll(".m4a", "")
    .replaceAll("/", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00" ;
};

async function main() {
  // get the list of all songs
  let songs = await getSongs();
  playMusic(songs[0], true);
  // show all the songs in the playlist

  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
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

  // attach an event listenerto each song.
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
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
    let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime =  currentSong.duration*percent / 100;
  });
}

main();
