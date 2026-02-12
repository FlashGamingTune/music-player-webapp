const fileInput = document.getElementById("fileInput");
const songsContainer = document.getElementById("songsContainer");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const nowPlaying = document.getElementById("nowPlaying");
const seekBar = document.getElementById("seekBar");
const timeDisplay = document.getElementById("timeDisplay");
const volumeSlider = document.getElementById("volumeSlider");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

let currentSong = null;
let isPlaying = false;
let songs = [];
let currentIndex = 0;


// Title  /  Displaying which song is playing 
function loadSong() {
    const file = songs[currentIndex];
    const url = URL.createObjectURL(file);

    audioPlayer.src = url;
    audioPlayer.play();
    isPlaying = true;

    playBtn.textContent = "⏸";
    nowPlaying.textContent = file.name;
}

// Converting File to Playabel File
fileInput.addEventListener("change", function () {
    songs = Array.from(this.files);
    songsContainer.innerHTML = "";

    songs.forEach((file, index) => {
        const songDiv = document.createElement("div");
        songDiv.className = "song-card";
        songDiv.innerHTML = `
                    <span>${file.name}</span>
                    <button class="favBtn">♡</button>
                        `;

        const favBtn = songDiv.querySelector(".favBtn");

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevents playing song

            if (favorites.includes(file.name)) {
                favorites = favorites.filter(name => name !== file.name);
                favBtn.textContent = "♡";
            } else {
                favorites.push(file.name);
                favBtn.textContent = "♥";
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));
        });

        if (favorites.includes(file.name)) {
            favBtn.textContent = "♥";
        }

        songDiv.addEventListener("click", () => {
            currentIndex = index;
            loadSong();
        });

        songsContainer.appendChild(songDiv);
    });
});

// Checking For Clicks to Convert ▶ <-> ⏸
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

// Next Song Logic
nextBtn.addEventListener("click", () => {
    if (songs.length === 0) return;

    currentIndex = (currentIndex + 1) % songs.length;
    loadSong();
});

// Previous Song Logic
prevBtn.addEventListener("click", () => {
    if (songs.length === 0) return;

    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong();
});

// Auto-Play Next Song
audioPlayer.addEventListener("ended", () => {
    nextBtn.click();
});

// Timeline / Dureation
audioPlayer.addEventListener("timeupdate", () => {
    if (!audioPlayer.duration) return;

    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = progress;

    const currentMin = Math.floor(audioPlayer.currentTime / 60);
    const currentSec = Math.floor(audioPlayer.currentTime % 60);

    const totalMin = Math.floor(audioPlayer.duration / 60);
    const totalSec = Math.floor(audioPlayer.duration % 60);

    timeDisplay.textContent =
        `${currentMin}:${currentSec.toString().padStart(2, "0")} / ` +
        `${totalMin}:${totalSec.toString().padStart(2, "0")}`;
});

// Drag Seek Bar
seekBar.addEventListener("input", () => {
    if (!audioPlayer.duration) return;

    const newTime = (seekBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
});

// Volume Control
volumeSlider.addEventListener("input", () => {
    audioPlayer.volume = volumeSlider.value;
});
