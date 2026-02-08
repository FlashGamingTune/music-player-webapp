const fileInput = document.getElementById("fileInput");
const songsContainer = document.getElementById("songsContainer");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");

let currentSong = null;
let isPlaying = false;

fileInput.addEventListener("change", function () {
  songsContainer.innerHTML = "";

  Array.from(this.files).forEach((file) => {
    const songDiv = document.createElement("div");
    songDiv.className = "song-card";
    songDiv.textContent = file.name;

    songDiv.addEventListener("click", () => {
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
      currentSong = file.name;
      audioPlayer.play();
      isPlaying = true;
      playBtn.textContent = "⏸";
    });

    songsContainer.appendChild(songDiv);
  });
});

playBtn.addEventListener("click", () => {
  if (!audioPlayer.src) return;

  if (isPlaying) {
    audioPlayer.pause();
    playBtn.textContent = "▶";
  } else {
    audioPlayer.play();
    playBtn.textContent = "⏸";
  }

  isPlaying = !isPlaying;
});
