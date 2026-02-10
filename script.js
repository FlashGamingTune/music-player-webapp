const fileInput = document.getElementById("fileInput");
const songsContainer = document.getElementById("songsContainer");
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const nowPlaying = document.getElementById("nowPlaying");

let currentSong = null;
let isPlaying = false;
let songs = [];
let currentIndex = 0;


// Displaying which song is playing 
function loadSong() {
    const file = songs[currentIndex];
    const url = URL.createObjectURL(file);

    audioPlayer.src = url;
    audioPlayer.play();
    isPlaying = true;

    playBtn.textContent = "⏸";
    nowPlaying.textContent = "Playing: " + file.name;
}

// Converting File to Playabel File
fileInput.addEventListener("change", function () {
    songs = Array.from(this.files);
    songsContainer.innerHTML = "";

    songs.forEach((file, index) => {
        const songDiv = document.createElement("div");
        songDiv.className = "song-card";
        songDiv.textContent = file.name;

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
