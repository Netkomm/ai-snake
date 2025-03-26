export class Audio {
    constructor() {
        // Try to get audio elements, but don't fail if they don't exist
        this.eatSound = document.getElementById('eat-sound');
        this.gameOverSound = document.getElementById('game-over-sound');
        this.backgroundMusic = document.getElementById('background-music');
        this.isMuted = false;
        
        // Create audio elements if they don't exist
        if (!this.eatSound) {
            console.log("Creating eat sound element");
            this.eatSound = this.createAudioElement('eat-sound', 'eat.mp3');
        }
        
        if (!this.gameOverSound) {
            console.log("Creating game over sound element");
            this.gameOverSound = this.createAudioElement('game-over-sound', 'game-over.mp3');
        }
        
        if (!this.backgroundMusic) {
            console.log("Creating background music element");
            this.backgroundMusic = this.createAudioElement('background-music', 'background.mp3');
            if (this.backgroundMusic) {
                this.backgroundMusic.loop = true;
                this.backgroundMusic.volume = 0.3;
            }
        }
    }
    
    createAudioElement(id, src) {
        // Check if the audio file exists
        const audioElement = document.createElement('audio');
        audioElement.id = id;
        
        // Add a fallback empty source to prevent errors
        const sourceElement = document.createElement('source');
        sourceElement.src = `assets/audio/${src}`;
        sourceElement.type = 'audio/mpeg';
        
        audioElement.appendChild(sourceElement);
        document.body.appendChild(audioElement);
        
        // Add error handling
        audioElement.addEventListener('error', (e) => {
            console.warn(`Audio file ${src} could not be loaded. Game will continue without sound.`);
        }, true); // Use capturing to catch errors from source elements
        
        return audioElement;
    }

    playEatSound() {
        if (!this.isMuted && this.eatSound) {
            this.eatSound.currentTime = 0;
            this.eatSound.play();
        }
    }

    playGameOverSound() {
        if (!this.isMuted && this.gameOverSound) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play();
        }
    }

    playBackgroundMusic() {
        if (!this.isMuted && this.backgroundMusic) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play();
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteBtn = document.getElementById('mute-btn');
        
        if (muteBtn) {
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        }

        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }
}