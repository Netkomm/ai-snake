// AI Module for Snake Game
import { FRUIT_TYPES } from './entities.js';

export class AI {
    constructor(gameState) {
        this.gameState = gameState;
        this.difficultyLevel = 'medium'; // default difficulty
        this.targetFruit = null;
        this.pathfindingGrid = [];
        this.fruitRarityScores = {
            common: 5,
            uncommon: 15,
            rare: 30,
            epic: 50,
            legendary: 100
        };
    }

    // Set AI difficulty level
    setDifficulty(level) {
        if (['easy', 'medium', 'hard', 'expert'].includes(level)) {
            this.difficultyLevel = level;
            return true;
        }
        return false;
    }

    // Main method to update AI snake movement
    updateAISnake() {
        if (!this.gameState.aiSnake.length) {
            this.initializeAISnake();
            return;
        }

        const head = this.gameState.aiSnake[0];
        let newDirection = this.gameState.aiDirection;

        // Determine target (food or fruit)
        this.determineTarget();

        // Calculate direction to target
        if (this.targetFruit) {
            newDirection = this.calculateDirectionToTarget(head, this.targetFruit);
        } else {
            newDirection = this.calculateDirectionToTarget(head, this.gameState.food);
        }

        // Apply difficulty-based intelligence
        newDirection = this.applyDifficultyBasedBehavior(newDirection, head);

        // Avoid collisions
        newDirection = this.avoidCollisions(newDirection, head);

        // Update AI direction
        this.gameState.aiDirection = newDirection;

        // Move AI snake head based on direction
        const newHead = { x: head.x, y: head.y };
        switch (this.gameState.aiDirection) {
            case 'up': newHead.y--; break;
            case 'down': newHead.y++; break;
            case 'left': newHead.x--; break;
            case 'right': newHead.x++; break;
        }

        // Add new head to AI snake
        this.gameState.aiSnake.unshift(newHead);
    }

    // Initialize AI snake
    initializeAISnake() {
        const tileCount = this.gameState.tileCount;
        this.gameState.aiSnake = [
            { x: tileCount - 10, y: tileCount - 10 },
            { x: tileCount - 9, y: tileCount - 10 },
            { x: tileCount - 8, y: tileCount - 10 }
        ];
        this.gameState.aiDirection = 'left';
    }

    // Determine which target (food or fruit) to pursue
    determineTarget() {
        // Reset target
        this.targetFruit = null;

        // If no fruits available, target the main food
        if (!this.gameState.fruits || this.gameState.fruits.length === 0) {
            return;
        }

        // Find the closest fruit with highest value/rarity
        const head = this.gameState.aiSnake[0];
        let closestDistance = Infinity;
        let bestValueFruit = null;
        let bestValue = 0;

        for (const fruit of this.gameState.fruits) {
            const distance = Math.abs(fruit.x - head.x) + Math.abs(fruit.y - head.y);
            
            // Consider both distance and value based on difficulty
            let valueWeight = 1;
            let distanceWeight = 1;
            
            switch (this.difficultyLevel) {
                case 'easy':
                    valueWeight = 0.5;
                    distanceWeight = 1.5;
                    break;
                case 'medium':
                    valueWeight = 1;
                    distanceWeight = 1;
                    break;
                case 'hard':
                    valueWeight = 1.5;
                    distanceWeight = 0.5;
                    break;
                case 'expert':
                    valueWeight = 2;
                    distanceWeight = 0.2;
                    break;
            }
            
            const score = (fruit.points * valueWeight) / (distance * distanceWeight);
            
            if (score > bestValue) {
                bestValue = score;
                bestValueFruit = fruit;
                closestDistance = distance;
            }
        }

        // Decide whether to go for main food or a fruit
        const foodDistance = Math.abs(this.gameState.food.x - head.x) + 
                            Math.abs(this.gameState.food.y - head.y);
        
        // If a valuable fruit is closer or worth more, target it
        if (bestValueFruit && 
            (closestDistance < foodDistance * 1.5 || bestValueFruit.points > this.gameState.food.points * 1.5)) {
            this.targetFruit = bestValueFruit;
        }
    }

    // Calculate direction to target (food or fruit)
    calculateDirectionToTarget(head, target) {
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        let newDirection = this.gameState.aiDirection;
        
        // Prioritize horizontal movement if further in that direction
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && this.gameState.aiDirection !== 'left') {
                newDirection = 'right';
            } else if (dx < 0 && this.gameState.aiDirection !== 'right') {
                newDirection = 'left';
            } else if (dy > 0 && this.gameState.aiDirection !== 'up') {
                newDirection = 'down';
            } else if (dy < 0 && this.gameState.aiDirection !== 'down') {
                newDirection = 'up';
            }
        } else {
            // Prioritize vertical movement
            if (dy > 0 && this.gameState.aiDirection !== 'up') {
                newDirection = 'down';
            } else if (dy < 0 && this.gameState.aiDirection !== 'down') {
                newDirection = 'up';
            } else if (dx > 0 && this.gameState.aiDirection !== 'left') {
                newDirection = 'right';
            } else if (dx < 0 && this.gameState.aiDirection !== 'right') {
                newDirection = 'left';
            }
        }
        
        return newDirection;
    }

    // Apply difficulty-based behavior modifications
    applyDifficultyBasedBehavior(direction, head) {
        // Add random movement chance based on difficulty
        let randomChance = 0;
        
        switch (this.difficultyLevel) {
            case 'easy': randomChance = 0.3; break;
            case 'medium': randomChance = 0.15; break;
            case 'hard': randomChance = 0.05; break;
            case 'expert': randomChance = 0; break;
        }
        
        // Occasionally make random moves based on difficulty
        if (Math.random() < randomChance) {
            const possibleDirections = ['up', 'down', 'left', 'right'];
            const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
            
            // Filter out the opposite of current direction to avoid 180-degree turns
            const safeDirections = possibleDirections.filter(dir => dir !== opposites[this.gameState.aiDirection]);
            
            // Choose a random direction
            return safeDirections[Math.floor(Math.random() * safeDirections.length)];
        }
        
        return direction;
    }

    // Avoid collisions with walls, self, and player snake
    avoidCollisions(direction, head) {
        let testHead = { x: head.x, y: head.y };
        
        switch (direction) {
            case 'up': testHead.y--; break;
            case 'down': testHead.y++; break;
            case 'left': testHead.x--; break;
            case 'right': testHead.x++; break;
        }
        
        // Check if next move would cause a collision
        if (this.wouldCollide(testHead)) {
            // Try to find a safe direction
            const directions = ['up', 'down', 'left', 'right'];
            const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
            
            // Remove the opposite of current direction to avoid 180-degree turns
            const safeDirections = directions.filter(dir => dir !== opposites[this.gameState.aiDirection]);
            
            // Try each direction until a safe one is found
            for (let dir of safeDirections) {
                testHead = { x: head.x, y: head.y };
                
                switch (dir) {
                    case 'up': testHead.y--; break;
                    case 'down': testHead.y++; break;
                    case 'left': testHead.x--; break;
                    case 'right': testHead.x++; break;
                }
                
                if (!this.wouldCollide(testHead)) {
                    return dir;
                }
            }
            
            // If no safe direction found, just continue (will likely result in death)
            return direction;
        }
        
        return direction;
    }

    // Check if a position would result in a collision
    wouldCollide(position) {
        const tileCount = this.gameState.tileCount;
        
        // Check wall collision
        if (position.x < 0 || position.x >= tileCount || position.y < 0 || position.y >= tileCount) {
            return true;
        }
        
        // Check AI snake self collision
        for (let i = 1; i < this.gameState.aiSnake.length; i++) {
            if (position.x === this.gameState.aiSnake[i].x && position.y === this.gameState.aiSnake[i].y) {
                return true;
            }
        }
        
        // Check player snake collision
        for (let segment of this.gameState.snake) {
            if (position.x === segment.x && position.y === segment.y) {
                return true;
            }
        }
        
        // Check obstacle collision in survival mode
        if (this.gameState.currentGameMode === 'survival' && this.gameState.obstacles) {
            for (let obstacle of this.gameState.obstacles) {
                if (position.x === obstacle.x && position.y === obstacle.y) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Create a fruit with rarity-based scoring
    createFruit() {
        if (this.gameState.fruits.length >= 5) return null; // Limit number of fruits on screen
        
        let newFruit;
        let fruitOnObject;
        
        do {
            fruitOnObject = false;
            
            // Use the imported FRUIT_TYPES and add rarity information
            const fruitTypes = [
                { name: FRUIT_TYPES[0].name, color: FRUIT_TYPES[0].color, points: this.fruitRarityScores.common, rarity: 'common', chance: 0.5, svg: FRUIT_TYPES[0].svg },
                { name: FRUIT_TYPES[1].name, color: FRUIT_TYPES[1].color, points: this.fruitRarityScores.uncommon, rarity: 'uncommon', chance: 0.3, svg: FRUIT_TYPES[1].svg },
                { name: FRUIT_TYPES[2].name, color: FRUIT_TYPES[2].color, points: this.fruitRarityScores.rare, rarity: 'rare', chance: 0.15, svg: FRUIT_TYPES[2].svg },
                { name: FRUIT_TYPES[3].name, color: FRUIT_TYPES[3].color, points: this.fruitRarityScores.epic, rarity: 'epic', chance: 0.04, svg: FRUIT_TYPES[3].svg },
                { name: FRUIT_TYPES[4].name, color: FRUIT_TYPES[4].color, points: this.fruitRarityScores.legendary, rarity: 'legendary', chance: 0.01, svg: FRUIT_TYPES[4].svg }
            ];
            
            // Select a fruit based on rarity chance
            const random = Math.random();
            let selectedFruit = fruitTypes[0]; // Default to most common
            let cumulativeChance = 0;
            
            for (const fruit of fruitTypes) {
                cumulativeChance += fruit.chance;
                if (random <= cumulativeChance) {
                    selectedFruit = fruit;
                    break;
                }
            }
            
            newFruit = {
                x: Math.floor(Math.random() * this.gameState.tileCount),
                y: Math.floor(Math.random() * this.gameState.tileCount),
                color: selectedFruit.color,
                points: selectedFruit.points,
                name: selectedFruit.name,
                rarity: selectedFruit.rarity,
                lifespan: 300 // Fruit disappears after 300 game updates (about 10 seconds)
            };
            
            // Check collision with player snake
            for (let segment of this.gameState.snake) {
                if (segment.x === newFruit.x && segment.y === newFruit.y) {
                    fruitOnObject = true;
                    break;
                }
            }
            
            // Check collision with AI snake
            if (!fruitOnObject && this.gameState.aiSnake.length > 0) {
                for (let segment of this.gameState.aiSnake) {
                    if (segment.x === newFruit.x && segment.y === newFruit.y) {
                        fruitOnObject = true;
                        break;
                    }
                }
            }
            
            // Check collision with food
            if (!fruitOnObject && this.gameState.food.x === newFruit.x && this.gameState.food.y === newFruit.y) {
                fruitOnObject = true;
            }
            
            // Check collision with other fruits
            if (!fruitOnObject && this.gameState.fruits.length > 0) {
                for (let fruit of this.gameState.fruits) {
                    if (fruit.x === newFruit.x && fruit.y === newFruit.y) {
                        fruitOnObject = true;
                        break;
                    }
                }
            }
            
            // Check collision with obstacles in survival mode
            if (!fruitOnObject && this.gameState.currentGameMode === 'survival' && this.gameState.obstacles) {
                for (let obstacle of this.gameState.obstacles) {
                    if (obstacle.x === newFruit.x && obstacle.y === newFruit.y) {
                        fruitOnObject = true;
                        break;
                    }
                }
            }
        } while (fruitOnObject);
        
        return newFruit;
    }

    // Check for snake collisions and handle respawning
    checkSnakeCollisions() {
        // If either snake is empty, no collision possible
        if (!this.gameState.snake.length || !this.gameState.aiSnake.length) {
            return;
        }
        
        const playerHead = this.gameState.snake[0];
        const aiHead = this.gameState.aiSnake[0];
        
        // Check if player snake head collides with AI snake
        let playerDied = false;
        for (let segment of this.gameState.aiSnake) {
            if (playerHead.x === segment.x && playerHead.y === segment.y) {
                playerDied = true;
                break;
            }
        }
        
        // Check if AI snake head collides with player snake
        let aiDied = false;
        for (let segment of this.gameState.snake) {
            if (aiHead.x === segment.x && aiHead.y === segment.y) {
                aiDied = true;
                break;
            }
        }
        
        // Handle player snake death - Game Over
        if (playerDied) {
            // Play sound if available
            if (this.gameState.game && this.gameState.game.audio) {
                this.gameState.game.audio.playGameOverSound();
            }
            
            // Game over for player
            this.gameState.gameOver();
        }
        
        // Handle AI snake death with delay
        if (aiDied) {
            // Clear AI snake immediately
            this.gameState.aiSnake = [];
            
            // Reduce AI score
            this.gameState.aiScore = Math.max(0, this.gameState.aiScore - 50);
            this.gameState.updateScore();
            
            // Respawn AI snake after 5 seconds
            setTimeout(() => {
                const tileCount = this.gameState.tileCount;
                this.gameState.aiSnake = [
                    { x: tileCount - 10, y: tileCount - 10 },
                    { x: tileCount - 9, y: tileCount - 10 },
                    { x: tileCount - 8, y: tileCount - 10 }
                ];
                this.gameState.aiDirection = 'left';
            }, 5000);
        }
        
        return { playerDied, aiDied };
    }
}