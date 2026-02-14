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


// let songs = [];
// let currentIndex =   0;
// let isPlaying = false;
// let isShuffle = false;
// let repeatMode = "off";
// let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const playerState = {
    songs: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: "off",
    favorites: JSON.parse(localStorage.getItem("favorites")) || []
};


// Title  /  Displaying which song is playing 
let currentObjectURL = null;

function loadSong() {
    if (!playerState.songs[playerState.currentIndex]) return;

    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
    }

    const file = playerState.songs[playerState.currentIndex];

    miniTitle.textContent = file.name;

    currentObjectURL = URL.createObjectURL(file);
    audioPlayer.src = currentObjectURL;

    audioPlayer.play();
    playerState.isPlaying = true;
    playBtn.textContent = "⏸";
}

// Converting File to Playable File
fileInput.addEventListener("change", function () {
    playerState.songs = Array.from(this.files);
    songsContainer.innerHTML = "";

    playerState.songs.forEach((file, index) => {
        const songDiv = document.createElement("div");
        songDiv.className = "song-card";
        songDiv.innerHTML = `
                    <span>${file.name}</span>
                    <button class="favBtn">♡</button>
                        `;

        const favBtn = songDiv.querySelector(".favBtn");

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevents playing song

            if (playerState.favorites.includes(file.name)) {
                playerState.favorites = playerState.favorites.filter(name => name !== file.name);
                favBtn.textContent = "♡";
            } else {
                playerState.favorites.push(file.name);
                favBtn.textContent = "❤️";
            }

            localStorage.setItem("favorites", JSON.stringify(playerState.favorites));
        });

        if (playerState.favorites.includes(file.name)) {
            favBtn.textContent = "❤️";
        }

        songDiv.addEventListener("click", () => {
            playerState.currentIndex = index;
            loadSong();
        });

        songsContainer.appendChild(songDiv);
    });
});

// Checking For Clicks to Convert ▶ <-> ⏸
playBtn.addEventListener("click", () => {
    if (!audioPlayer.src) return;

    if (playerState.isPlaying) {
        audioPlayer.pause();
        playBtn.textContent = "▶";
    } else {
        audioPlayer.play();
        playBtn.textContent = "⏸";
    }

    playerState.isPlaying = !playerState.isPlaying;
});

// Next Song Logic
nextBtn.addEventListener("click", () => {
    if (playerState.songs.length === 0) return;

    if (playerState.isShuffle) {
        playerState.currentIndex = Math.floor(Math.random() * playerState.songs.length);
    } else {
        playerState.currentIndex = (playerState.currentIndex + 1) % playerState.songs.length;
    }

    loadSong();
});


// Previous Song Logic
prevBtn.addEventListener("click", () => {
    if (playerState.songs.length === 0) return;

    playerState.currentIndex = (playerState.currentIndex - 1 + playerState.songs.length) % playerState.songs.length;
    loadSong();
});

// Auto-Play Next Song
audioPlayer.addEventListener("ended", () => {

    if (playerState.repeatMode === "one") {
        // Repeat same song
        loadSong();
        return;
    }

    if (playerState.isShuffle) {
        playerState.currentIndex = Math.floor(Math.random() * playerState.songs.length);
        loadSong();
        return;
    }

    // Go to next song normally
    if (playerState.currentIndex < playerState.songs.length - 1) {
        playerState.currentIndex++;
        loadSong();
    } else {
        // Playlist finished
        if (playerState.repeatMode === "all") {
            playerState.currentIndex = 0;
            loadSong();
        } else {
            // Stop completely
            playerState.isPlaying = false;
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
    playerState.isShuffle = !playerState.isShuffle;
    shuffleBtn.style.color = playerState.isShuffle ? "lime" : "white";
});

// Repeat Button Logic
repeatBtn.addEventListener("click", () => {
    if (playerState.repeatMode === "off") {
        playerState.repeatMode = "all";
        repeatBtn.textContent = "🔁";
        repeatBtn.style.color = "lime";
    } else if (playerState.repeatMode === "all") {
        playerState.repeatMode = "one";
        repeatBtn.textContent = "1️⃣";
    } else {
        playerState.repeatMode = "off";
        repeatBtn.style.color = "white";
        repeatBtn.textContent = "🔃";
    }
});
