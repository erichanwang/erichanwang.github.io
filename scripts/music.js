document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playlistContainer = document.getElementById('playlist');
    const loopCheckbox = document.getElementById('loop');
    const speedControl = document.getElementById('speed');

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
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function playSong() {
        audioPlayer.play();
    }

    loopCheckbox.addEventListener('change', () => {
        audioPlayer.loop = loopCheckbox.checked;
    });

    speedControl.addEventListener('input', () => {
        const speed = parseFloat(speedControl.value);
        if (!isNaN(speed) && speed >= 0.25 && speed <= 2) {
            audioPlayer.playbackRate = speed;
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (!audioPlayer.loop) {
            currentSongIndex = (currentSongIndex + 1) % musicFiles.length;
            loadSong(currentSongIndex);
            playSong();
        }
    });

    loadSong(0);
});
