import { database } from './database.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.aiDifficultyLevel = 'medium'; // Default AI difficulty
        this.introScreen = document.getElementById('intro-screen');
        this.gameOverElement = document.getElementById('game-over');
        this.nameInputContainer = document.getElementById('name-input-container');
        this.playerNameInput = document.getElementById('player-name');
        this.leaderboardContainer = document.getElementById('leaderboard-container');
        this.leaderboardEntries = document.getElementById('leaderboard-entries');
        this.currentMode = 'classic';
        this.startBtn = document.getElementById('start-btn');
        
        // Initialize start button state
        if (this.startBtn) {
            this.startBtn.disabled = true;
            this.startBtn.style.opacity = '0.5';
            this.startBtn.style.cursor = 'not-allowed';
        }

        this.setupLeaderboardsOverlay();
    }

    setupLeaderboardsOverlay() {
        const showLeaderboardsBtn = document.getElementById('show-leaderboards-btn');
        const leaderboardsOverlay = document.getElementById('leaderboards-overlay');
        const closeBtn = leaderboardsOverlay.querySelector('.leaderboard-close');

        showLeaderboardsBtn.addEventListener('click', () => {
            leaderboardsOverlay.style.display = 'block';
            this.updateAllLeaderboards();
        });

        closeBtn.addEventListener('click', () => {
            leaderboardsOverlay.style.display = 'none';
        });

        // Close overlay when clicking outside
        leaderboardsOverlay.addEventListener('click', (e) => {
            if (e.target === leaderboardsOverlay) {
                leaderboardsOverlay.style.display = 'none';
            }
        });
    }

    async updateAllLeaderboards() {
        const modes = ['classic', 'time_attack', 'survival', 'ai'];
        
        for (const mode of modes) {
            const elementId = mode === 'time_attack' ? 'time-attack-leaderboard' : `${mode}-leaderboard`;
            const leaderboardElement = document.getElementById(elementId);
            
            try {
                const response = await database.getLeaderboard(mode);
                
                if (response && response.length > 0) {
                    let html = '<table style="width: 100%; color: white; font-size: 12px;">';
                    html += '<tr><th style="text-align: left;">Player</th><th style="text-align: right;">Score</th></tr>';
                    
                    response.forEach((entry, index) => {
                        const rowStyle = index === 0 ? 'color: #ffd700;' : ''; // Gold color for top score
                        html += `
                            <tr style="${rowStyle}">
                                <td style="text-align: left; padding: 5px 0;">${entry.player_name}</td>
                                <td style="text-align: right; padding: 5px 0;">${entry.score}</td>
                            </tr>
                        `;
                    });
                    
                    html += '</table>';
                    leaderboardElement.innerHTML = html;
                } else {
                    leaderboardElement.innerHTML = '<p style="color: #666;">No scores yet</p>';
                }
            } catch (error) {
                console.error(`Error loading ${mode} leaderboard:`, error);
                leaderboardElement.innerHTML = '<p style="color: #ff4444;">Error loading leaderboard</p>';
            }
        }
    }

    showGameOver() {
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'block';
        }
    }

    hideGameOver() {
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
    }

    showNameInput() {
        if (this.nameInputContainer) {
            this.nameInputContainer.style.display = 'block';
            if (this.playerNameInput) this.playerNameInput.focus();
        }
    }

    hideNameInput() {
        if (this.nameInputContainer) {
            this.nameInputContainer.style.display = 'none';
        }
    }

    async showLeaderboard() {
        if (!this.leaderboardEntries || !this.leaderboardContainer) return;
        
        // Clear previous entries
        this.leaderboardEntries.innerHTML = '';
        
        // Get leaderboard from database
        const leaderboard = await database.getLeaderboard(this.currentMode);
        
        // Add entries
        leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            
            const rankElement = document.createElement('span');
            rankElement.className = 'leaderboard-rank';
            rankElement.textContent = `#${index + 1}`;
            
            const nameElement = document.createElement('span');
            nameElement.className = 'leaderboard-name';
            nameElement.textContent = entry.player_name;
            
            const scoreElement = document.createElement('span');
            scoreElement.className = 'leaderboard-score';
            scoreElement.textContent = entry.score;
            
            entryElement.appendChild(rankElement);
            entryElement.appendChild(nameElement);
            entryElement.appendChild(scoreElement);
            
            this.leaderboardEntries.appendChild(entryElement);
        });
        
        // Show leaderboard
        this.leaderboardContainer.style.display = 'block';
    }

    hideLeaderboard() {
        if (this.leaderboardContainer) {
            this.leaderboardContainer.style.display = 'none';
        }
    }

    setCurrentMode(mode) {
        this.currentMode = mode;
        // Enable start button when mode is selected
        if (this.startBtn) {
            this.startBtn.disabled = false;
            this.startBtn.style.opacity = '1';
            this.startBtn.style.cursor = 'pointer';
        }
    }
}