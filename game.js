import { GameState } from './src/gameState.js';
import { Renderer } from './src/renderer.js';
import { Controls } from './src/controls.js';
import { Audio } from './src/audio.js';
import { UI } from './src/ui.js';
import { AI } from './src/ai.js';
import { AIDifficultySelector } from './src/aiDifficultySelector.js';
import { GAME_MODES } from './src/config.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new Audio();
        this.gameState = new GameState(this);
        this.renderer = new Renderer(this.ctx);
        this.ui = new UI(this);
        this.controls = new Controls(this);
        this.aiDifficultySelector = new AIDifficultySelector(this);
        this.gameLoop = null;
        this.timeInterval = null;
    }

    init() {
        console.log('Initializing game...');
        // Initialize game components
        this.gameState.createStars();
        this.renderer.animateIntro();
        
        // Set up additional event listeners
        this.setupEventListeners();
        
        // Set default game mode and highlight it
        this.gameState.selectGameMode('classic');
        this.ui.setCurrentMode('classic');
        this.highlightSelectedMode('classic-mode');
        
        console.log('Game initialized successfully');
    }
    
    setupEventListeners() {
        // Game buttons
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
        
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => this.ui.showLeaderboard());
        }
        
        const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
        if (showLeaderboardBtn) {
            showLeaderboardBtn.addEventListener('click', () => this.ui.showLeaderboard());
        }
        
        const leaderboardClose = document.getElementById('leaderboard-close');
        if (leaderboardClose) {
            leaderboardClose.addEventListener('click', () => this.ui.hideLeaderboard());
        }
        
        const saveScoreBtn = document.getElementById('save-score-btn');
        if (saveScoreBtn) {
            saveScoreBtn.addEventListener('click', () => this.gameState.saveScore());
        }
        
        // Game mode selection - Intro screen
        const classicMode = document.getElementById('classic-mode');
        if (classicMode) {
            classicMode.addEventListener('click', () => {
                this.gameState.selectGameMode('classic');
                this.ui.setCurrentMode('classic');
                this.highlightSelectedMode('classic-mode');
                this.enableStartButton();
            });
        }
        
        const timeMode = document.getElementById('time-mode');
        if (timeMode) {
            timeMode.addEventListener('click', () => {
                this.gameState.selectGameMode('timeAttack');
                this.ui.setCurrentMode('time_attack');
                this.highlightSelectedMode('time-mode');
                this.enableStartButton();
            });
        }
        
        const survivalMode = document.getElementById('survival-mode');
        if (survivalMode) {
            survivalMode.addEventListener('click', () => {
                this.gameState.selectGameMode('survival');
                this.ui.setCurrentMode('survival');
                this.highlightSelectedMode('survival-mode');
                this.enableStartButton();
            });
        }
        
        const aiMode = document.getElementById('ai-mode');
        if (aiMode) {
            aiMode.addEventListener('click', () => {
                this.gameState.selectGameMode('ai');
                this.ui.setCurrentMode('ai');
                this.highlightSelectedMode('ai-mode');
                this.enableStartButton();
            });
        }
        
        // Game mode selection - Game Over screen
        const goClassicMode = document.getElementById('go-classic-mode');
        if (goClassicMode) {
            goClassicMode.addEventListener('click', () => {
                this.gameState.selectGameMode('classic');
                this.ui.setCurrentMode('classic');
                this.restart();
            });
        }
        
        const goTimeMode = document.getElementById('go-time-mode');
        if (goTimeMode) {
            goTimeMode.addEventListener('click', () => {
                this.gameState.selectGameMode('timeAttack');
                this.ui.setCurrentMode('time_attack');
                this.restart();
            });
        }
        
        const goSurvivalMode = document.getElementById('go-survival-mode');
        if (goSurvivalMode) {
            goSurvivalMode.addEventListener('click', () => {
                this.gameState.selectGameMode('survival');
                this.ui.setCurrentMode('survival');
                this.restart();
            });
        }
        
        const goAiMode = document.getElementById('go-ai-mode');
        if (goAiMode) {
            goAiMode.addEventListener('click', () => {
                this.gameState.selectGameMode('ai');
                this.ui.setCurrentMode('ai');
                this.restart();
            });
        }
    }

    highlightSelectedMode(modeId) {
        console.log('Highlighting mode:', modeId);
        // Remove highlight from all mode buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add highlight to selected mode
        const selectedButton = document.getElementById(modeId);
        if (selectedButton) {
            selectedButton.classList.add('selected');
            console.log('Selected button found and highlighted');
        } else {
            console.error('Selected button not found:', modeId);
        }
        
        // Show or hide AI difficulty selector based on mode
        if (this.aiDifficultySelector) {
            if (modeId === 'ai-mode') {
                this.aiDifficultySelector.showSelector();
            } else {
                this.aiDifficultySelector.hideSelector();
            }
        }
    }

    start() {
        console.log('Game starting...');
        const introScreen = document.getElementById('intro-screen');
        
        if (introScreen) {
            introScreen.style.transition = 'opacity 0.5s';
            introScreen.style.opacity = '0';
            
            setTimeout(() => {
                introScreen.style.display = 'none';
                this.restart();
                
                // Start background music
                if (this.audio && this.audio.backgroundMusic) {
                    this.audio.backgroundMusic.currentTime = 0;
                    this.audio.backgroundMusic.play();
                }
                
                // Start timer for time attack mode
                if (this.gameState.currentGameMode === 'timeAttack') {
                    this.gameState.timeLeft = GAME_MODES.timeAttack.timeLimit;
                    this.updateTimeDisplay();
                    this.timeInterval = setInterval(() => this.updateTimer(), 1000);
                }
            }, 500);
        } else {
            console.error('Intro screen element not found');
            this.restart();
        }
    }

    restart() {
        // Clear any existing intervals
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // Reset game state
        this.gameState.reset();
        
        // Hide game over screen
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        // Hide name input
        const nameInputContainer = document.getElementById('name-input-container');
        if (nameInputContainer) {
            nameInputContainer.style.display = 'none';
        }
        
        // Start background music
        if (this.audio && this.audio.backgroundMusic) {
            this.audio.backgroundMusic.currentTime = 0;
            this.audio.backgroundMusic.play();
        }
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), this.gameState.gameSpeed);
    }

    update() {
        this.gameState.update();
        this.renderer.drawGame(this.gameState);
    }

    updateTimer() {
        if (!this.gameState.gameActive || this.gameState.currentGameMode !== 'timeAttack') {
            return;
        }
        
        if (this.gameState.timeLeft > 0) {
            this.gameState.timeLeft--;
            this.updateTimeDisplay();
            
            // Add warning animation for last 30 seconds
            if (this.gameState.timeLeft <= 30 && !this.gameState.isCountdownWarning) {
                this.gameState.isCountdownWarning = true;
                const timeDisplay = document.getElementById('time-display');
                if (timeDisplay) {
                    timeDisplay.classList.add('warning');
                    timeDisplay.style.animation = 'pulse 1s infinite';
                }
            }
        }
        
        // Check if time is up and trigger game over
        if (this.gameState.timeLeft <= 0) {
            this.gameState.timeLeft = 0;
            this.updateTimeDisplay();
            this.gameOver();
        }
    }

    updateTimeDisplay() {
        if (this.gameState.currentGameMode !== 'timeAttack') return;
        
        const minutes = Math.floor(this.gameState.timeLeft / 60);
        const seconds = this.gameState.timeLeft % 60;
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeDisplay.style.display = 'block';
        }
    }

    gameOver() {
        // Stop ALL intervals first
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }

        // Stop background music IMMEDIATELY
        if (this.audio && this.audio.backgroundMusic) {
            this.audio.backgroundMusic.pause();
            this.audio.backgroundMusic.currentTime = 0;
        }

        // Play game over sound
        if (this.audio) {
            this.audio.playGameOverSound();
        }

        this.gameState.gameActive = false;
        
        // Hide time display
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.style.display = 'none';
            timeDisplay.classList.remove('warning');
            timeDisplay.style.animation = 'none';
        }
        
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
        
        // Show name input for leaderboard
        this.ui.showNameInput();
    }

    enableStartButton() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
        }
    }
}

// Create a global game instance
let gameInstance;

// Initialize game when page loads
window.onload = () => {
    gameInstance = new Game();
    gameInstance.init();
    
    // Make game instance globally accessible for debugging
    window.gameInstance = gameInstance;
};