// AI Difficulty Selector Module

export class AIDifficultySelector {
    constructor(game) {
        this.game = game;
        this.difficultyLevels = ['easy', 'medium', 'hard', 'expert'];
        this.currentDifficulty = 'medium'; // Default difficulty
        this.selectorContainer = null;
        
        this.createDifficultySelector();
        this.attachEventListeners();
    }
    
    createDifficultySelector() {
        // Create container for difficulty selector
        this.selectorContainer = document.createElement('div');
        this.selectorContainer.id = 'ai-difficulty-selector';
        this.selectorContainer.className = 'difficulty-selector';
        this.selectorContainer.style.display = 'none'; // Hidden by default
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'AI Difficulty';
        this.selectorContainer.appendChild(title);
        
        // Create buttons for each difficulty level
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'difficulty-buttons';
        
        this.difficultyLevels.forEach(level => {
            const button = document.createElement('button');
            button.id = `difficulty-${level}`;
            button.className = 'difficulty-btn';
            button.textContent = level.charAt(0).toUpperCase() + level.slice(1);
            button.dataset.difficulty = level;
            
            // Highlight the default difficulty
            if (level === this.currentDifficulty) {
                button.classList.add('selected');
            }
            
            buttonContainer.appendChild(button);
        });
        
        this.selectorContainer.appendChild(buttonContainer);
        
        // Add to the game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.selectorContainer);
        } else {
            // Fallback to body if game container not found
            document.body.appendChild(this.selectorContainer);
        }
        
        // Add CSS styles
        this.addStyles();
    }
    
    attachEventListeners() {
        // Add click event listeners to difficulty buttons
        const buttons = document.querySelectorAll('.difficulty-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove selected class from all buttons
                buttons.forEach(btn => btn.classList.remove('selected'));
                
                // Add selected class to clicked button
                e.target.classList.add('selected');
                
                // Update current difficulty
                this.currentDifficulty = e.target.dataset.difficulty;
                
                // Update AI difficulty
                if (this.game && this.game.gameState && this.game.gameState.ai) {
                    this.game.gameState.ai.setDifficulty(this.currentDifficulty);
                    console.log(`AI difficulty set to: ${this.currentDifficulty}`);
                }
            });
        });
    }
    
    showSelector() {
        if (this.selectorContainer) {
            this.selectorContainer.style.display = 'block';
        }
    }
    
    hideSelector() {
        if (this.selectorContainer) {
            this.selectorContainer.style.display = 'none';
        }
    }
    
    addStyles() {
        // Check if styles already exist
        if (document.getElementById('difficulty-selector-styles')) {
            return;
        }
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.id = 'difficulty-selector-styles';
        
        // Add CSS rules
        styleElement.textContent = `
            .difficulty-selector {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(15, 52, 96, 0.8);
                padding: 10px;
                border-radius: 5px;
                color: white;
                font-family: 'Press Start 2P', cursive, Arial, sans-serif;
                z-index: 100;
            }
            
            .difficulty-selector h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                text-align: center;
            }
            
            .difficulty-buttons {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .difficulty-btn {
                background-color: #16213e;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'Press Start 2P', cursive, Arial, sans-serif;
                font-size: 10px;
            }
            
            .difficulty-btn:hover {
                background-color: #1a3a6a;
            }
            
            .difficulty-btn.selected {
                background-color: #e94560;
                box-shadow: 0 0 5px #ff2e63;
            }
        `;
        
        // Add to document head
        document.head.appendChild(styleElement);
    }
    
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }
}