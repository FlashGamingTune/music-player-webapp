const fileInput = document.getElementById("fileInput");
const songsContainer = document.getElementById("songsContainer");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const miniTitle = document.getElementById("miniTitle");
// const nowPlaying = document.getElementById("nowPlaying");
const seekBar = document.getElementById("seekBar");
const timeDisplay = document.getElementById("timeDisplay");
const volumeSlider = document.getElementById("volumeSlider");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

let isPlaying = false;
let songs = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let isShuffle = false;
let repeatMode = "off";


// Title  /  Displaying which song is playing 
function loadSong() {
    
    if (!songs[currentIndex]) return;
    
    // Close previous temporary URL if exists
    if (audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
    }
    
    const file = songs[currentIndex];
    miniTitle.textContent = file.name;
    const url = URL.createObjectURL(file);

    audioPlayer.src = url;
    audioPlayer.play();
    isPlaying = true;

    playBtn.textContent = "⏸";
    // nowPlaying.textContent = file.name;
}

// Converting File to Playable File
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
                favBtn.textContent = "❤️";
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));
        });

        if (favorites.includes(file.name)) {
            favBtn.textContent = "❤️";
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

    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * songs.length);
    } else {
        currentIndex = (currentIndex + 1) % songs.length;
    }

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

    if (repeatMode === "one") {
        // Repeat same song
        loadSong();
        return;
    }

    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * songs.length);
        loadSong();
        return;
    }

    // Go to next song normally
    if (currentIndex < songs.length - 1) {
        currentIndex++;
        loadSong();
    } else {
        // Playlist finished
        if (repeatMode === "all") {
            currentIndex = 0;
            loadSong();
        } else {
            // Stop completely
            isPlaying = false;
            playBtn.textContent = "▶";
        }
    }
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

// Shuffle Button Logic
shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "lime" : "white";
});

// Repeat Button Logic
repeatBtn.addEventListener("click", () => {
    if (repeatMode === "off") {
        repeatMode = "all";
        repeatBtn.textContent = "🔁";
        repeatBtn.style.color = "lime";
    } else if (repeatMode === "all") {
        repeatMode = "one";
        repeatBtn.textContent = "1️⃣";
    } else {
        repeatMode = "off";
        repeatBtn.style.color = "white";
        repeatBtn.textContent = "🔃";
    }
});
