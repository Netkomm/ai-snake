async init() {
    // Initialize game components
    this.audio = new Audio();
    this.ui = new UI(this);
    this.gameState = new GameState(this);
    this.renderer = new Renderer(this.gameState);
    
    // Load initial high score
    await this.gameState.loadHighScore();
    
    // Start game loop
    this.gameLoop();
}

update() {
    if (this.gameState.gameActive) {
        this.gameState.update();
        // Since updateScore is now async, we need to handle it properly
        this.gameState.updateScore().catch(error => {
            console.error('Error updating score:', error);
        });
    }
}

async handleModeSelection(mode) {
    if (await this.gameState.selectGameMode(mode)) {
        this.ui.hideMenu();
        this.gameState.gameActive = true;
        this.audio.playBackgroundMusic();
    }
}

gameOver() {
    console.log('Game Over called');
    
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

    // Set game state to inactive
    if (this.gameState) {
        this.gameState.gameActive = false;
    }
    
    // Hide time display if it exists
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.style.display = 'none';
        timeDisplay.classList.remove('warning');
        timeDisplay.style.animation = 'none';
    }
    
    // Force show game over screen IMMEDIATELY
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        console.log('Showing game over screen');
        requestAnimationFrame(() => {
            gameOverElement.style.display = 'block';
            gameOverElement.style.opacity = '1';
            gameOverElement.style.visibility = 'visible';
        });
    } else {
        console.error('Game over element not found');
    }
    
    // Show name input for non-AI modes with score > 0
    if (this.gameState && this.gameState.score > 0 && this.gameState.currentGameMode !== 'ai') {
        const nameInputContainer = document.getElementById('name-input-container');
        if (nameInputContainer) {
            nameInputContainer.style.display = 'block';
        }
    }
}

getSnakeColor(index, isAI = false) {
    if (isAI) return '#ff0000'; // AI snake is always red
    
    // Player snake gradient
    const hue = (index * 2) % 360;
    return `hsl(${hue}, 100%, 50%)`;
}

draw() {
    const ctx = this.canvas.getContext('2d');
    const gridSize = CANVAS_CONFIG.gridSize;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars
    this.drawStars();
    
    // Draw obstacles in survival mode
    if (this.gameState.currentGameMode === 'survival') {
        ctx.fillStyle = '#e94560';
        this.gameState.obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }
    
    // Draw player snake
    this.gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = this.getSnakeColor(index, false);
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
    
    // Draw AI snake in AI mode
    if (this.gameState.currentGameMode === 'ai' && this.gameState.aiSnake.length > 0) {
        this.gameState.aiSnake.forEach(segment => {
            ctx.fillStyle = this.getSnakeColor(0, true); // Use isAI=true for red color
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }
    
    // Draw food
    ctx.fillStyle = this.gameState.food.color;
    ctx.fillRect(this.gameState.food.x * gridSize, this.gameState.food.y * gridSize, gridSize - 1, gridSize - 1);
    
    // Draw fruits in AI mode
    if (this.gameState.currentGameMode === 'ai' && this.gameState.fruits.length > 0) {
        this.gameState.fruits.forEach(fruit => {
            ctx.fillStyle = fruit.color;
            ctx.fillRect(fruit.x * gridSize, fruit.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }
    
    // Draw power-up if active
    if (this.gameState.powerUp) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.gameState.powerUp.x * gridSize, this.gameState.powerUp.y * gridSize, gridSize - 1, gridSize - 1);
    }
}

drawSnake(snake, isAI = false) {
    const ctx = this.canvas.getContext('2d');
    const gridSize = CANVAS_CONFIG.gridSize;
    
    snake.forEach((segment, index) => {
        ctx.fillStyle = isAI ? '#ff0000' : this.getSnakeColor(index);
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
} 