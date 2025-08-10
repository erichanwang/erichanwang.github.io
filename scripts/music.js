document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playlistContainer = document.getElementById('playlist');
    const loopCheckbox = document.getElementById('loop');
    const speedRange = document.getElementById('speed-range');
    const speedText = document.getElementById('speed-text');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const timestampInput = document.getElementById('timestamp-input');
    const timestampBtn = document.getElementById('timestamp-btn');
    const volumeRange = document.getElementById('volume-range');

    let audioContext;
    let gainNode;
    let audioSource;

    const musicFiles = [
        'Dont 19.mp3',
        'Dvorak 9.mp3',
        'Hoe Down Violin 1.mp3',
        'Rode 6.mp3',
        'TMEA 2025 VIOLIN.mp3'
    ];

    musicFiles.forEach((file, index) => {
        const playlistItem = document.createElement('div');
        playlistItem.textContent = file.replace('.mp3', '');
        playlistItem.classList.add('playlist-item');
        playlistItem.dataset.index = index;
        playlistItem.addEventListener('click', () => {
            loadSong(index);
            playSong();
        });
        playlistContainer.appendChild(playlistItem);
    });

    let currentSongIndex = 0;

    function loadSong(index) {
        currentSongIndex = index;
        audioPlayer.src = `music/${musicFiles[index]}`;
        progressBar.value = 0;
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function playSong() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioSource = audioContext.createMediaElementSource(audioPlayer);
            gainNode = audioContext.createGain();
            audioSource.connect(gainNode);
            gainNode.connect(audioContext.destination);
        }
        audioPlayer.play();
        playPauseBtn.textContent = '❚❚';
    }

    function pauseSong() {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶';
    }

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            playSong();
        } else {
            pauseSong();
        }
    });

    // When looping is enabled, the audio player will repeat the current song.
    loopCheckbox.addEventListener('change', () => {
        audioPlayer.loop = loopCheckbox.checked;
    });

    function setSpeed(speed) {
        if (!isNaN(speed) && speed >= 0.25 && speed <= 2) {
            audioPlayer.playbackRate = speed;
            speedRange.value = speed;
            speedText.value = speed;
        }
    }

    speedRange.addEventListener('input', () => {
        setSpeed(speedRange.value);
    });

    speedText.addEventListener('input', () => {
        setSpeed(parseFloat(speedText.value));
    });

    volumeRange.addEventListener('input', () => {
        if (gainNode) {
            gainNode.gain.value = volumeRange.value;
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const { currentTime } = audioPlayer;
        progressBar.value = currentTime;
        currentTimeEl.textContent = formatTime(currentTime);
    });

    function updateDuration() {
        if (isFinite(audioPlayer.duration)) {
            durationEl.textContent = formatTime(audioPlayer.duration);
            progressBar.max = audioPlayer.duration;
        }
    }

    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('durationchange', updateDuration);

    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });

    timestampBtn.addEventListener('click', () => {
        const time = parseTime(timestampInput.value);
        if (!isNaN(time) && time >= 0 && time <= audioPlayer.duration) {
            audioPlayer.currentTime = time;
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (!audioPlayer.loop) {
            currentSongIndex = (currentSongIndex + 1) % musicFiles.length;
            loadSong(currentSongIndex);
            playSong();
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function parseTime(timeString) {
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            if (!isNaN(minutes) && !isNaN(seconds)) {
                return minutes * 60 + seconds;
            }
        }
        return NaN;
    }

    loadSong(0);
});
