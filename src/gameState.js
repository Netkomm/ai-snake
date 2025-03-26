import { CANVAS_CONFIG, GAME_MODES } from './config.js';
import { AI } from './ai.js';
import { database } from './database.js';

export class GameState {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.tileCount = this.canvas.width / CANVAS_CONFIG.gridSize;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.backgroundStars = [];
        this.ai = new AI(this);
        this.lastBlockPlacement = 0; // Track when we last placed a block
        this.blockPlacementInterval = 5000; // Place a new block every 5 seconds
        this.nextBlockTime = 0; // Time when next block will spawn
        this.isCountdownWarning = false; // Flag for warning animation
        this.reset();
        this.loadHighScore();
    }

    reset() {
        const previousGameMode = this.currentGameMode; // Store the current game mode
        
        // Reset player snake
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // Reset AI snake based on game mode
        if (previousGameMode === 'ai') {
            const tileCount = this.tileCount;
            this.aiSnake = [
                { x: tileCount - 10, y: tileCount - 10 },
                { x: tileCount - 9, y: tileCount - 10 },
                { x: tileCount - 8, y: tileCount - 10 }
            ];
            this.aiDirection = 'left';
            this.aiScore = 0;
            this.fruits = [];
        } else {
            this.aiSnake = [];
            this.aiDirection = 'left';
            this.aiScore = 0;
            this.fruits = [];
        }
        
        this.food = { x: 15, y: 15, color: '#e94560', points: 10 };
        this.powerUp = null;
        this.obstacles = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = CANVAS_CONFIG.initialGameSpeed;
        this.gameActive = true;
        this.activePowerUp = null;
        this.powerUpTimer = null;
        this.timeLeft = 60000;
        
        // Preserve the game mode instead of resetting it
        this.currentGameMode = previousGameMode;
        
        // Initialize mode-specific settings
        if (previousGameMode === 'survival') {
            this.nextBlockTime = Date.now() + 10000; // First block after 10 seconds
            this.isCountdownWarning = false;
        }
        
        // Create food and update score
        this.createFood();
        this.updateScore();
        this.createStars();
    }

    update() {
        if (!this.gameActive) return;
        
        this.moveSnake();
        
        // Move AI snake in AI mode
        if (this.currentGameMode === 'ai' && this.aiSnake.length > 0) {
            this.ai.updateAISnake();
        }
        
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }
        
        // Check if player snake ate food
        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.eatFood(true); // true for player snake
        } else {
            this.snake.pop();
        }
        
        // Check if AI snake ate food in AI mode
        if (this.currentGameMode === 'ai' && this.aiSnake.length > 0) {
            if (this.aiSnake[0].x === this.food.x && this.aiSnake[0].y === this.food.y) {
                this.eatFood(false); // false for AI snake
            } else {
                this.aiSnake.pop();
            }
        }
        
        // Update stars
        this.updateStars();
        
        // Generate random fruits in AI mode (5% chance per update)
        if (this.currentGameMode === 'ai' && Math.random() < 0.005) {
            const newFruit = this.ai.createFruit();
            if (newFruit) {
                this.fruits.push(newFruit);
            }
        }
        
        // Check for collisions between snakes in AI mode
        if (this.currentGameMode === 'ai' && this.aiSnake.length > 0 && this.snake.length > 0) {
            this.ai.checkSnakeCollisions();
        }
        
        // Check if player snake ate any fruits
        if (this.currentGameMode === 'ai' && this.fruits.length > 0) {
            this.checkFruitCollisions();
        }

        // Add blocks gradually in survival mode
        if (this.currentGameMode === 'survival') {
            const currentTime = Date.now();
            const timeUntilNextBlock = Math.max(0, this.nextBlockTime - currentTime);
            
            // Update warning state
            this.isCountdownWarning = timeUntilNextBlock <= 5000 && timeUntilNextBlock > 0;
            
            // Log countdown info
            if (timeUntilNextBlock % 1000 < 50) { // Log roughly every second
                console.log('Survival mode countdown:', {
                    timeUntilNextBlock: Math.ceil(timeUntilNextBlock / 1000),
                    isWarning: this.isCountdownWarning,
                    currentBlocks: this.obstacles.length,
                    maxBlocks: GAME_MODES.survival.maxBlocks
                });
            }
            
            if (currentTime >= this.nextBlockTime) {
                console.log('Attempting to spawn new block:', {
                    currentTime: new Date(currentTime),
                    nextBlockTime: new Date(this.nextBlockTime),
                    currentBlocks: this.obstacles.length,
                    maxBlocks: GAME_MODES.survival.maxBlocks
                });
                
                if (this.obstacles.length < GAME_MODES.survival.maxBlocks) {
                    const blockAdded = this.addNewBlock();
                    if (blockAdded) {
                        console.log('Block added successfully. Setting next block time.');
                        this.nextBlockTime = currentTime + (Math.random() * 10000 + 10000);
                        console.log('Next block scheduled for:', new Date(this.nextBlockTime));
                    } else {
                        console.log('Failed to add block. Retrying in 5 seconds.');
                        this.nextBlockTime = currentTime + 5000;
                    }
                } else {
                    console.log('Maximum number of blocks reached:', GAME_MODES.survival.maxBlocks);
                }
            }
        }
    }

    moveSnake() {
        this.direction = this.nextDirection;
        
        const head = { x: this.snake[0].x, y: this.snake[0].y };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        this.snake.unshift(head);
    }

    checkCollision() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        // Obstacle collision in survival mode
        if (this.currentGameMode === 'survival') {
            for (let obstacle of this.obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    return true;
                }
            }
        }
        
        // AI snake collision in AI mode
        if (this.currentGameMode === 'ai' && this.aiSnake.length > 0) {
            for (let segment of this.aiSnake) {
                if (head.x === segment.x && head.y === segment.y) {
                    return true;
                }
            }
        }
        
        return false;
    }

    eatFood(isPlayer) {
        // Play eat sound if player ate the food
        if (isPlayer && this.game && this.game.audio) {
            this.game.audio.playEatSound();
        }
        
        // Increase score based on food points
        if (isPlayer) {
            this.score += this.food.points || 10;
        } else {
            this.aiScore += this.food.points || 10;
        }
        this.updateScore();
        
        // Increase speed for player snake
        if (isPlayer && GAME_MODES[this.currentGameMode].speedIncrease) {
            const speedDecrease = Math.min(5, (this.snake.length / 5));
            this.gameSpeed = Math.max(
                CANVAS_CONFIG.minGameSpeed, 
                CANVAS_CONFIG.initialGameSpeed - (speedDecrease * 10)
            );
        }
        
        // Create new food
        this.createFood();
    }

    createFood() {
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            
            // Determine food points (10% chance for special food worth more points)
            let points = 10;
            let color = '#e94560';
            
            if (Math.random() < 0.1) {
                points = 20;
                color = '#ff9800'; // Orange for special food
            }
            
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                color: color,
                points: points
            };
            
            // Check if food is on player snake
            for (let segment of this.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
            
            // Check if food is on AI snake in AI mode
            if (!foodOnSnake && this.currentGameMode === 'ai' && this.aiSnake.length > 0) {
                for (let segment of this.aiSnake) {
                    if (segment.x === newFood.x && segment.y === newFood.y) {
                        foodOnSnake = true;
                        break;
                    }
                }
            }
            
            // Check if food is on obstacles in survival mode
            if (!foodOnSnake && this.currentGameMode === 'survival' && this.obstacles.length > 0) {
                for (let obstacle of this.obstacles) {
                    if (obstacle.x === newFood.x && obstacle.y === newFood.y) {
                        foodOnSnake = true;
                        break;
                    }
                }
            }
            
            // Check if food is on fruits in AI mode
            if (!foodOnSnake && this.currentGameMode === 'ai' && this.fruits.length > 0) {
                for (let fruit of this.fruits) {
                    if (fruit.x === newFood.x && fruit.y === newFood.y) {
                        foodOnSnake = true;
                        break;
                    }
                }
            }
        } while (foodOnSnake);
        
        this.food = newFood;
    }

    createStars() {
        this.backgroundStars = [];
        const starCount = 100;
        
        for (let i = 0; i < starCount; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.3 + 0.1
            });
        }
    }

    updateStars() {
        this.backgroundStars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }

    createObstacles() {
        const obstacleCount = Math.min(5, Math.floor(this.score / 50));
        this.obstacles = [];
        
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let isValid;
            
            do {
                isValid = true;
                obstacle = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount)
                };
                
                // Check collision with snake
                for (let segment of this.snake) {
                    if (segment.x === obstacle.x && segment.y === obstacle.y) {
                        isValid = false;
                        break;
                    }
                }
                
                // Check collision with food
                if (obstacle.x === this.food.x && obstacle.y === this.food.y) {
                    isValid = false;
                }
                
                // Check collision with other obstacles
                for (let existingObstacle of this.obstacles) {
                    if (existingObstacle.x === obstacle.x && existingObstacle.y === obstacle.y) {
                        isValid = false;
                        break;
                    }
                }
            } while (!isValid);
            
            this.obstacles.push(obstacle);
        }
    }

    async updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${this.score}`;
        }
        
        try {
            // Get high score from database for current mode
            const dbMode = this.currentGameMode === 'timeAttack' ? 'time_attack' : this.currentGameMode;
            const highScore = await database.getHighScore(dbMode);
            
            if (this.score > highScore) {
                this.highScore = this.score;
                if (this.highScoreElement) {
                    this.highScoreElement.textContent = `High Score: ${this.highScore}`;
                }
            }
        } catch (error) {
            console.error('Error updating high score:', error);
        }
    }

    async loadHighScore() {
        try {
            // Get high score from database for current mode
            const dbMode = this.currentGameMode === 'timeAttack' ? 'time_attack' : this.currentGameMode;
            const highScore = await database.getHighScore(dbMode);
            
            this.highScore = highScore || 0;
            if (this.highScoreElement) {
                this.highScoreElement.textContent = `High Score: ${this.highScore}`;
            }
        } catch (error) {
            console.error('Error loading high score:', error);
            this.highScore = 0;
            if (this.highScoreElement) {
                this.highScoreElement.textContent = 'High Score: 0';
            }
        }
    }

    async gameOver() {
        if (!this.gameActive) return; // Prevent multiple calls
        
        this.gameActive = false;
        
        // Call game's gameOver method FIRST to handle UI updates
        if (this.game) {
            this.game.gameOver();
        }
        
        // Stop any ongoing game processes
        if (this.currentGameMode === 'ai') {
            // Clear AI snake
            this.aiSnake = [];
            this.fruits = [];
            return; // Don't save scores for AI mode
        }
        
        try {
            // Get current high score from database
            const dbMode = this.currentGameMode === 'timeAttack' ? 'time_attack' : this.currentGameMode;
            const highScore = await database.getHighScore(dbMode);
            
            // Update high score if current score is higher
            if (this.score > highScore) {
                this.highScore = this.score;
            }
            
            // Note: We don't save the score here anymore, it will be saved only when the player enters their name
        } catch (error) {
            console.error('Error handling game over high score:', error);
        }
    }

    async selectGameMode(mode) {
        console.log('Selecting game mode:', mode);
        if (!GAME_MODES[mode]) {
            console.error('Invalid game mode:', mode);
            return;
        }
        
        // Hide time display by default
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.style.display = 'none';
            timeDisplay.classList.remove('warning');
            timeDisplay.style.animation = 'none';
        }
        
        this.currentGameMode = mode;
        this.gameSpeed = GAME_MODES[mode].initialSpeed;
        
        // Load the high score for this specific mode from database
        await this.loadHighScore();
        
        // Update canvas size based on game mode
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            if (mode === 'timeAttack' || mode === 'survival') {
                canvas.width = 480;
                canvas.height = 540;
            } else {
                canvas.width = 480;
                canvas.height = 480;
            }
        }
        
        // Reset game state for new mode
        this.reset();
        
        // Initialize mode-specific settings
        if (mode === 'timeAttack') {
            this.timeLeft = GAME_MODES.timeAttack.timeLimit;
            // Show time display only for time attack mode
            if (timeDisplay) {
                timeDisplay.style.display = 'block';
                timeDisplay.textContent = 'Time Remaining: 2:00';
            }
        } else if (mode === 'survival') {
            console.log('Initializing survival mode');
            // Initialize survival mode with no blocks
            this.obstacles = [];
            this.nextBlockTime = Date.now() + 10000; // First block after 10 seconds
            this.isCountdownWarning = false;
            
            // Start with player snake in a safe position
            this.snake = [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ];
            this.direction = 'right';
            this.nextDirection = 'right';
            
            // Create initial food away from snake
            this.createFood();
            
            console.log('Survival mode initialized, next block at:', new Date(this.nextBlockTime));
        }
        
        console.log('Game mode set to:', this.currentGameMode);
        return true;
    }
    
    // Note: moveAiSnake and createFruit methods have been moved to the AI module
    
    checkFruitCollisions() {
        if (!this.fruits.length) return;
        
        // Check player snake collision with fruits
        const playerHead = this.snake[0];
        let fruitEaten = false;
        
        for (let i = 0; i < this.fruits.length; i++) {
            const fruit = this.fruits[i];
            
            // Decrease fruit lifespan
            fruit.lifespan--;
            
            // Remove fruit if lifespan is over
            if (fruit.lifespan <= 0) {
                this.fruits.splice(i, 1);
                i--;
                continue;
            }
            
            // Check if player snake ate the fruit
            if (playerHead.x === fruit.x && playerHead.y === fruit.y) {
                // Add points to player score
                this.score += fruit.points;
                this.updateScore();
                
                // Play eat sound
                if (this.game && this.game.audio) {
                    this.game.audio.playEatSound();
                }
                
                // Remove the eaten fruit
                this.fruits.splice(i, 1);
                i--;
                fruitEaten = true;
                continue;
            }
            
            // Check if AI snake ate the fruit
            if (this.aiSnake.length > 0 && this.aiSnake[0].x === fruit.x && this.aiSnake[0].y === fruit.y) {
                // Add points to AI score
                this.aiScore += fruit.points;
                this.updateScore();
                
                // Remove the eaten fruit
                this.fruits.splice(i, 1);
                i--;
            }
        }
        
        // If player ate a fruit, don't remove the tail segment
        if (fruitEaten) {
            // Add a new segment to the snake (make it grow)
            const tail = this.snake[this.snake.length - 1];
            this.snake.push({ x: tail.x, y: tail.y });
        }
    }
    
    async saveScore() {
        const playerName = document.getElementById('player-name').value.trim();
        
        // Don't save if name is empty or "Anonymous"
        if (!playerName || playerName.toLowerCase() === 'anonymous') {
            console.log('Score not saved: valid name required');
            return;
        }
        
        // Convert game mode to database format
        const dbMode = this.currentGameMode === 'timeAttack' ? 'time_attack' : this.currentGameMode;
        
        // Save score to database
        await database.saveScore(dbMode, playerName, this.score);
        
        // Hide name input
        const nameInputContainer = document.getElementById('name-input-container');
        if (nameInputContainer) {
            nameInputContainer.style.display = 'none';
        }
    }

    addNewBlock() {
        // Check if we've reached the maximum number of blocks
        if (this.obstacles.length >= GAME_MODES.survival.maxBlocks) {
            console.log('Cannot add more blocks: maximum reached');
            return false;
        }

        let newBlock;
        let isValid;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop

        do {
            isValid = true;
            attempts++;
            
            // Generate random position
            newBlock = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };

            // Check distance from snake head
            const head = this.snake[0];
            const distance = Math.abs(newBlock.x - head.x) + Math.abs(newBlock.y - head.y);
            
            // Ensure block is at least 5 tiles away from snake head
            if (distance < 5) {
                isValid = false;
                continue;
            }

            // Check collision with snake
            for (let segment of this.snake) {
                if (segment.x === newBlock.x && segment.y === newBlock.y) {
                    isValid = false;
                    break;
                }
            }

            // Check collision with food
            if (newBlock.x === this.food.x && newBlock.y === this.food.y) {
                isValid = false;
            }

            // Check collision with existing blocks
            for (let obstacle of this.obstacles) {
                if (obstacle.x === newBlock.x && obstacle.y === newBlock.y) {
                    isValid = false;
                    break;
                }
            }

            // If we've tried too many times, give up
            if (attempts >= maxAttempts) {
                console.log('Failed to find valid position for new block after', maxAttempts, 'attempts');
                return false;
            }
        } while (!isValid);

        // Add the new block
        this.obstacles.push(newBlock);
        console.log('Added new block at position:', newBlock);
        return true;
    }

    // Add getter for countdown information
    getCountdownInfo() {
        if (this.currentGameMode !== 'survival') {
            console.log('Not in survival mode');
            return null;
        }
        
        if (this.obstacles.length >= GAME_MODES.survival.maxBlocks) {
            console.log('Max blocks reached');
            return null;
        }
        
        const currentTime = Date.now();
        const timeUntilNextBlock = Math.max(0, this.nextBlockTime - currentTime);
        const seconds = Math.ceil(timeUntilNextBlock / 1000);
        
        console.log('Countdown info:', {
            seconds,
            isWarning: this.isCountdownWarning,
            nextBlockTime: new Date(this.nextBlockTime),
            currentTime: new Date(currentTime)
        });
        
        return {
            seconds,
            isWarning: this.isCountdownWarning
        };
    }

    startObstacleSpawn() {
        if (this.obstacleInterval) {
            clearInterval(this.obstacleInterval);
        }
        
        // Spawn obstacles every 5 seconds in survival mode
        this.obstacleInterval = setInterval(() => {
            if (this.gameActive && this.currentGameMode === 'survival') {
                this.spawnObstacle();
            }
        }, 10000); // Changed from 10000 to 5000
    }
}