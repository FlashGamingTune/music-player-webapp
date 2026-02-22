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
const themeToggle = document.getElementById("themeToggle");
const uploadInput = document.getElementById("uploadInput");
const uploadBtn = document.getElementById("uploadBtn");
const API_BASE = "https://music-player-backend-hkkd.onrender.com";


const playerState = {
    songs: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: "off",
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    shuffleHistory: [],
    recentlyPlayed: []
};

let animationFrameId = null;

// Load Songs From Backend
async function loadSongsFromServer() {

    console.log("Loading songs from backend...");

    const response = await fetch(`${API_BASE}/songs`);
    const songs = await response.json();

    playerState.songs = songs;

    renderSongs();
}

function renderSongs() {
    songsContainer.innerHTML = "";

    playerState.songs.forEach((song, index) => {

        const songDiv = document.createElement("div");
        songDiv.className = "song-card";

        songDiv.innerHTML = `
            <span>${song.name}</span>
        `;

        songDiv.addEventListener("click", () => {
            playerState.currentIndex = index;
            loadSong();
        });

        songsContainer.appendChild(songDiv);
    });
}

function loadSong() {
    if (!playerState.songs[playerState.currentIndex]) return;

    const song = playerState.songs[playerState.currentIndex];

    audioPlayer.src = song.url;

    audioPlayer.play();
    playerState.isPlaying = true;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(updateProgressBarSmooth);


    updatePlayerUI();
    updateRecentlyPlayed();
}

// Recently Played
function updateRecentlyPlayed() {
    const currentSong = playerState.songs[playerState.currentIndex];
    if (!currentSong) return;

    const songName = currentSong.name;

    // Remove if already exists
    playerState.recentlyPlayed =
        playerState.recentlyPlayed.filter(name => name !== songName);

    // Add to beginning
    playerState.recentlyPlayed.unshift(songName);

    // Keep only last 5
    if (playerState.recentlyPlayed.length > 5) {
        playerState.recentlyPlayed.pop();
    }

    renderRecentlyPlayed();
}

function updatePlayerUI() {
    const file = playerState.songs[playerState.currentIndex];

    if (!file) return;

    miniTitle.textContent = file.name;
    playBtn.textContent = playerState.isPlaying ? "⏸" : "▶";

    highlightActiveSong();
}

function highlightActiveSong() {
    const allCards = document.querySelectorAll(".song-card");

    allCards.forEach(card => card.classList.remove("active"));

    const activeCard = allCards[playerState.currentIndex];
    if (activeCard) {
        activeCard.classList.add("active");
    }
}

// Play/Pause Toggle
function togglePlayPause() {
    if (!audioPlayer.src) return;

    if (playerState.isPlaying) {
        audioPlayer.pause();
        playerState.isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    } else {
        audioPlayer.play();
        playerState.isPlaying = true;
    }

    updatePlayerUI();
}

// Play Next Song Function
function playNextSong() {
    if (playerState.songs.length === 0) return;

    if (playerState.isShuffle) {
        // Store current index before changing
        playerState.shuffleHistory.push(playerState.currentIndex);

        let randomIndex;

        do {
            randomIndex = Math.floor(Math.random() * playerState.songs.length);
        } while (
            playerState.songs.length > 1 &&
            randomIndex === playerState.currentIndex
        );

        playerState.currentIndex = randomIndex;
    } else {
        playerState.currentIndex =
            (playerState.currentIndex + 1) %
            playerState.songs.length;
    }

    loadSong();
}

// Play Previous Song Function
function playPreviousSong() {
    if (playerState.songs.length === 0) return;

    if (playerState.isShuffle) {
        if (playerState.shuffleHistory.length > 0) {
            // Go back in shuffle history
            playerState.currentIndex =
                playerState.shuffleHistory.pop();
        } else {
            // fallback to normal previous behaviour
            playerState.currentIndex =
                (playerState.currentIndex - 1 + playerState.songs.length) %
                playerState.songs.length;
        }
    } else {
        playerState.currentIndex =
            (playerState.currentIndex - 1 + playerState.songs.length) %
            playerState.songs.length;
    }

    loadSong();
}

// Recently Played List
function renderRecentlyPlayed() {
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";

    playerState.recentlyPlayed.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;

        li.addEventListener("click", () => {
            const index = playerState.songs.findIndex(
                song => song.name === name
            );

            if (index !== -1) {
                playerState.currentIndex = index;
                loadSong();
            }
        });

        recentList.appendChild(li);
    });
}

function updateProgressBarSmooth() {
    if (!playerState.isPlaying) return;

    if (!audioPlayer.duration) {
        animationFrameId = requestAnimationFrame(updateProgressBarSmooth);
        return;
    }

    const progress =
        (audioPlayer.currentTime / audioPlayer.duration) * 100;

    seekBar.value = progress;

    seekBar.style.background = `linear-gradient(
        to right,
        #1db954 0%,
        #1db954 ${progress}%,
        #404040 ${progress}%,
        #404040 100%
    )`;

    animationFrameId = requestAnimationFrame(updateProgressBarSmooth);
}

// Checking For Clicks to Convert ▶ <-> ⏸
playBtn.addEventListener("click", togglePlayPause);

// Next Song EventLstener
nextBtn.addEventListener("click", playNextSong);

// Previous Song EventListener
prevBtn.addEventListener("click", playPreviousSong);

// Auto-Play Next Song
audioPlayer.addEventListener("ended", () => {

    if (playerState.repeatMode === "one") {
        loadSong();
        return;
    }

    if (playerState.repeatMode === "all") {
        playNextSong();
        return;
    }

    if (playerState.repeatMode === "off") {
        if (playerState.currentIndex < playerState.songs.length - 1) {
            playNextSong();
        } else {
            playerState.isPlaying = false;
            updatePlayerUI();
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

    if (!playerState.isShuffle) {
        playerState.shuffleHistory = [];
    }

    shuffleBtn.style.color =
        playerState.isShuffle ? "lime" : "white";
});

// Repeat Button Logic
repeatBtn.addEventListener("click", () => {
    if (playerState.repeatMode === "off") {
        playerState.repeatMode = "all";
        repeatBtn.textContent = "🔃";
        repeatBtn.style.color = "lime";
    } else if (playerState.repeatMode === "all") {
        playerState.repeatMode = "one";
        repeatBtn.textContent = "1️⃣";
    } else {
        playerState.repeatMode = "off";
        repeatBtn.style.color = "white";
        repeatBtn.textContent = "🔁";
    }
});

// Keyboard Controller
document.addEventListener("keydown", (e) => {

    // Prevent interfering with sliders or file input
    if (e.target.tagName === "INPUT") return;

    switch (e.code) {
        case "Space":
            e.preventDefault(); // prevent page scroll
            togglePlayPause();
            break;

        case "ArrowRight":
            playNextSong();
            break;

        case "ArrowLeft":
            playPreviousSong();
            break;
    }
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
        themeToggle.textContent = "☀️";
    } else {
        themeToggle.textContent = "🌙";
    }
});

uploadBtn.addEventListener("click", async () => {
    const file = uploadInput.files[0];

    if (!file) {
        alert("Please select a song first.");
        return;
    }

    const formData = new FormData();
    formData.append("song", file);

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            headers: {
                "x-admin-key": "12345"
            },
            body: formData
        });

        const result = await response.json();

        alert(result.message);

        uploadInput.value = "";

        // Reload songs after upload
        loadSongsFromServer();

    } catch (error) {
        console.error("Upload failed:", error);
    }
});

// load songs automatically
document.addEventListener("DOMContentLoaded", () => {
    loadSongsFromServer();
});
