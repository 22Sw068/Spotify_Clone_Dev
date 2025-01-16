let songs = [];
let currentSong = new Audio();
let isPlaying = false;
let currentIndex = 0;
let currFolder;

// Fetch songs
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);  // Make sure the folder exists in your server path
        if (!response.ok) {
            throw new Error("Failed to fetch songs.");
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");
        let songList = [];
        for (const element of links) {
            if (element.href.endsWith(".mp3")) {
                songList.push(element.href);
            }
        }
        songs = songList;
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        songs = [];
        return [];
    }
}

// Update Play Button
const updatePlayButton = () => {
    document.getElementById("playbtn").src = isPlaying ? "pause.svg" : "play.svg";
};

// Display Song Info and Duration
const updateSongInfo = () => {
    const songInfo = document.querySelector(".songinfo");
    const songTime = document.querySelector(".songtime");
    const songName = songs[currentIndex].split('/').pop().replaceAll("%20", " ");

    // Show song name
    songInfo.innerHTML = songName;
    // Show current time and total duration
    songTime.innerHTML = formatTime(currentSong.currentTime) + " / " + formatTime(currentSong.duration || 0);
};

// Format Time Helper Function
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
};

// Load and Prepare Song
const loadSong = (index) => {
    currentIndex = index;
    currentSong.src = songs[currentIndex];

    // Wait for metadata to load, then update info and duration
    currentSong.addEventListener('loadedmetadata', () => {
        updateSongInfo();  // Update song info and duration when metadata is available
    });
};

// Load and Play Song
const loadAndPlaySong = (index) => {
    loadSong(index);
    currentSong.play();
    isPlaying = true;
    updatePlayButton();
};

// Toggle Play and Pause
const togglePlayPause = () => {
    if (isPlaying) {
        currentSong.pause();
        isPlaying = false;
    } else {
        currentSong.play();
        isPlaying = true;
    }
    updatePlayButton();
};

// Play Next Song
const playNextSong = () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    loadAndPlaySong(nextIndex);  // Load and play the next song
};

// Play Previous Song
const playPreviousSong = () => {
    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadAndPlaySong(previousIndex);  // Load and play the previous song
};

// Update Progress Bar
const updateSeekBar = () => {
    const progress = document.querySelector(".seekbar .progress");
    const circle = document.querySelector(".seekbar .circle");
    const progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;

    progress.style.width = `${progressPercentage}%`;  // Update progress bar width
    circle.style.left = `${progressPercentage}%`;     // Update circle position
    updateSongInfo();  // Update song info with current time
};

// Seek to a position in the song when the user clicks on the seek bar
const seekbarProgress = (event) => {
    const seekbar = document.querySelector(".seekbar");
    const percent = event.offsetX / seekbar.offsetWidth;
    currentSong.currentTime = percent * currentSong.duration;
};

// Event Listeners for Buttons
document.getElementById("playbtn").addEventListener("click", togglePlayPause);
document.getElementById("next").addEventListener("click", playNextSong);
document.getElementById("previous").addEventListener("click", playPreviousSong);
currentSong.addEventListener("timeupdate", updateSeekBar);
currentSong.addEventListener("ended", playNextSong);  // Automatically play the next song when the current one ends
document.querySelector(".seekbar").addEventListener("click", seekbarProgress);

// Event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

// Event listener close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"; // Hide the left menu
});

// Add event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (event) => {
    console.log("Setting volume to", event.target.value, "/100");
    currentSong.volume = parseInt(event.target.value) / 100;
});

// Main Function to initialize the playlist
async function main() {
    try {
        // Initialize with "songs/Happy_Hits" folder
        await getSongs("./Happy_Hits");
        const songUl = document.querySelector(".songlist ul");

        // Clear the list first to avoid duplication if we load different folders
        songUl.innerHTML = "";

        if (songs.length === 0) {
            console.log("No songs found.");
        }

        songs.forEach((song, index) => {
            if (song) {
                const songName = song.split('/').pop().replaceAll("%20", " ");
                songUl.innerHTML += `
                    <li>
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                            <div>${songName}</div>
                            <div>M Khan</div>
                        </div>
                        <div class="playNow">
                            <span> Play Now </span>
                            <img class="invert" src="play.svg" alt="">
                        </div>
                    </li>`;
            }
        });

        document.querySelectorAll(".songlist li").forEach((element, index) => {
            element.addEventListener("click", () => {
                loadAndPlaySong(index);
            });
        });

        if (songs.length > 0) {
            loadSong(0);  // Load the first song initially, without playing it
            console.log("First song loaded. Ready to play.");
        }
    } catch (error) {
        console.error("Error initializing the player: ", error);
    }
}

// Load the playlist when library is clicked (card click)
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async function() {
        const folder = e.dataset.folder;  // Retrieve the folder name from the clicked card's data attribute

        // Clear the current song list
        songs = [];
        await getSongs(folder);  // Get the songs for the specific folder

        const songUl = document.querySelector(".songlist ul");
        songUl.innerHTML = "";  // Clear the previous songs

        songs.forEach((song, index) => {
            if (song) {
                const songName = song.split('/').pop().replaceAll("%20", " ");
                songUl.innerHTML += `
                    <li>
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                            <div>${songName}</div>
                            <div>M Khan</div>
                        </div>
                        <div class="playNow">
                            <span> Play Now </span>
                            <img class="invert" src="play.svg" alt="">
                        </div>
                    </li>`;
            }
        });

        // Add event listener to newly populated song list items
        document.querySelectorAll(".songlist li").forEach((element, index) => {
            element.addEventListener("click", () => {
                loadAndPlaySong(index);
            });
        });
    });
});

// Call main function to initialize with default "songs/Happy_Hits"
main();
