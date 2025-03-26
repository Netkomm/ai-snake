import { CANVAS_CONFIG, COLORS } from './config.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = document.getElementById('game-canvas');
        this.introScreen = document.getElementById('intro-screen');
        this.gridSize = CANVAS_CONFIG.gridSize;
    }

    drawGame(gameState) {
        // Clear canvas
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create clip for game area (480x480)
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, 480, 480);
        this.ctx.clip();
        
        // Draw stars
        this.drawStars(gameState.backgroundStars);
        
        // Draw grid
        this.drawGrid();
        
        // Draw obstacles in survival mode
        if (gameState.currentGameMode === 'survival' && gameState.obstacles) {
            this.drawObstacles(gameState.obstacles);
        }
        
        // Draw fruits in AI mode
        if (gameState.currentGameMode === 'ai' && gameState.fruits && gameState.fruits.length > 0) {
            this.drawFruits(gameState.fruits);
        }
        
        // Draw food
        this.drawFood(gameState.food);
        
        // Draw player snake
        this.drawSnake(gameState.snake, gameState.direction, COLORS.snake);
        
        // Draw AI snake if in AI mode
        if (gameState.currentGameMode === 'ai' && gameState.aiSnake.length > 0) {
            this.drawSnake(gameState.aiSnake, gameState.aiDirection, COLORS.ai);
        }
        
        this.ctx.restore();
        
        // Draw countdown in survival mode in the bottom area
        if (gameState.currentGameMode === 'survival') {
            const countdownInfo = gameState.getCountdownInfo();
            if (countdownInfo) {
                this.drawCountdown(countdownInfo);
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = COLORS.grid;
        this.ctx.lineWidth = 0.5;
        
        const gridSize = this.gridSize;
        const gameSize = 480; // 16 cells * 30px
        const cellCount = 16; // Fixed number of cells
        
        // Draw vertical lines
        for (let i = 0; i <= cellCount; i++) {
            const x = i * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, gameSize);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 0; i <= cellCount; i++) {
            const y = i * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(gameSize, y);
            this.ctx.stroke();
        }
    }

    drawFood(food) {
        if (!food) return;
        
        this.ctx.fillStyle = food.color;
        this.ctx.beginPath();
        const centerX = food.x * this.gridSize + this.gridSize / 2;
        const centerY = food.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 * 0.8;
        
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSnake(snake, direction, colors) {
        snake.forEach((segment, index) => {
            // Use gradient colors
            const colorIndex = index % colors.length;
            this.ctx.fillStyle = colors[colorIndex];
            
            // Draw rounded rectangle for head
            if (index === 0) {
                this.drawRoundedRect(
                    segment.x * this.gridSize, 
                    segment.y * this.gridSize, 
                    this.gridSize, 
                    this.gridSize, 
                    5
                );
                
                // Draw eyes
                this.drawSnakeEyes(segment, direction);
            } else {
                // Draw body segments
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1, 
                    segment.y * this.gridSize + 1, 
                    this.gridSize - 2, 
                    this.gridSize - 2
                );
            }
        });
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSnakeEyes(head, direction) {
        const eyeSize = this.gridSize / 5;
        const eyeOffset = this.gridSize / 3;
        
        this.ctx.fillStyle = 'white';
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch (direction) {
            case 'up':
                leftEyeX = head.x * this.gridSize + eyeOffset;
                leftEyeY = head.y * this.gridSize + eyeOffset;
                rightEyeX = head.x * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                rightEyeY = head.y * this.gridSize + eyeOffset;
                break;
            case 'down':
                leftEyeX = head.x * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                leftEyeY = head.y * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                rightEyeX = head.x * this.gridSize + eyeOffset;
                rightEyeY = head.y * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                break;
            case 'left':
                leftEyeX = head.x * this.gridSize + eyeOffset;
                leftEyeY = head.y * this.gridSize + eyeOffset;
                rightEyeX = head.x * this.gridSize + eyeOffset;
                rightEyeY = head.y * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                break;
            case 'right':
                leftEyeX = head.x * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                leftEyeY = head.y * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                rightEyeX = head.x * this.gridSize + this.gridSize - eyeOffset - eyeSize;
                rightEyeY = head.y * this.gridSize + eyeOffset;
                break;
        }
        
        // Draw eyes
        this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        
        // Draw pupils
        this.ctx.fillStyle = 'black';
        const pupilSize = eyeSize / 2;
        this.ctx.fillRect(leftEyeX + pupilSize/2, leftEyeY + pupilSize/2, pupilSize, pupilSize);
        this.ctx.fillRect(rightEyeX + pupilSize/2, rightEyeY + pupilSize/2, pupilSize, pupilSize);
    }

    drawStars(stars) {
        if (!stars) return;
        
        this.ctx.fillStyle = 'white';
        
        stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawObstacles(obstacles) {
        if (!obstacles) return;
        
        this.ctx.fillStyle = '#ffffff'; // White color for blocks
        
        for (let obstacle of obstacles) {
            this.ctx.fillRect(
                obstacle.x * this.gridSize + 1, 
                obstacle.y * this.gridSize + 1, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        }
    }
    
    drawFruits(fruits) {
        for (let fruit of fruits) {
            const centerX = fruit.x * this.gridSize + this.gridSize / 2;
            const centerY = fruit.y * this.gridSize + this.gridSize / 2;
            const size = this.gridSize * 0.8;
            
            // Add pulsating effect based on lifespan and rarity
            const baseScale = fruit.rarity === 'legendary' ? 1.1 : 
                            fruit.rarity === 'epic' ? 1.05 : 
                            fruit.rarity === 'rare' ? 1.02 : 0.9;
            const pulseScale = baseScale + (Math.sin(fruit.lifespan * 0.1) * 0.1);
            
            // Draw glow effect for rare fruits first (as background)
            if (fruit.rarity && (fruit.rarity === 'rare' || fruit.rarity === 'epic' || fruit.rarity === 'legendary')) {
                // Set glow color and intensity based on rarity
                let glowColor, glowSize, glowIntensity;
                switch (fruit.rarity) {
                    case 'rare':
                        glowColor = 'rgba(0, 255, 0, 0.3)';
                        glowSize = 15;
                        glowIntensity = 2;
                        break;
                    case 'epic':
                        glowColor = 'rgba(128, 0, 255, 0.4)';
                        glowSize = 20;
                        glowIntensity = 3;
                        break;
                    case 'legendary':
                        glowColor = 'rgba(255, 215, 0, 0.5)';
                        glowSize = 25;
                        glowIntensity = 4;
                        break;
                    default:
                        glowColor = 'rgba(255, 255, 255, 0.2)';
                        glowSize = 10;
                        glowIntensity = 1;
                }
                
                // Draw multiple layers of glow for more intense effect
                this.ctx.save();
                for (let i = 0; i < glowIntensity; i++) {
                    this.ctx.shadowColor = glowColor;
                    this.ctx.shadowBlur = glowSize - (i * 2);
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, (size/2) * (1 + i * 0.1), 0, Math.PI * 2);
                    this.ctx.fillStyle = glowColor;
                    this.ctx.fill();
                }
                this.ctx.restore();
                
                // Add animated ring effect for legendary fruits
                if (fruit.rarity === 'legendary') {
                    this.ctx.save();
                    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
                    this.ctx.lineWidth = 2;
                    const ringRadius = (size/2) * (1.5 + Math.sin(fruit.lifespan * 0.2) * 0.2);
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
            
            // Draw the main fruit
            if (fruit.svg) {
                // Get SVG element
                const svgElement = document.getElementById(fruit.svg);
                if (svgElement) {
                    // Create a temporary image to draw the SVG
                    const img = new Image();
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
                    const url = URL.createObjectURL(svgBlob);
                    
                    // Draw the SVG
                    const existingImg = document.querySelector(`img[data-fruit="${fruit.name}"]`);
                    if (existingImg) {
                        // Use existing image if already created
                        this.ctx.save();
                        this.ctx.translate(centerX, centerY);
                        this.ctx.scale(pulseScale, pulseScale);
                        this.ctx.drawImage(existingImg, -size/2, -size/2, size, size);
                        this.ctx.restore();
                    } else {
                        // Create new image
                        img.onload = () => {
                            img.dataset.fruit = fruit.name;
                            document.body.appendChild(img);
                            img.style.display = 'none';
                            this.ctx.save();
                            this.ctx.translate(centerX, centerY);
                            this.ctx.scale(pulseScale, pulseScale);
                            this.ctx.drawImage(img, -size/2, -size/2, size, size);
                            this.ctx.restore();
                        };
                        img.src = url;
                    }
                } else {
                    // Fallback to colored circle if SVG not found
                    this.drawFruitCircle(fruit, centerX, centerY, size * pulseScale);
                }
            } else {
                // Fallback to colored circle
                this.drawFruitCircle(fruit, centerX, centerY, size * pulseScale);
            }
            
            // Draw point value with enhanced visibility for rare fruits
            this.ctx.save();
            if (fruit.rarity && (fruit.rarity === 'rare' || fruit.rarity === 'epic' || fruit.rarity === 'legendary')) {
                // Add text shadow for better visibility
                this.ctx.shadowColor = 'black';
                this.ctx.shadowBlur = 4;
                this.ctx.fillStyle = fruit.rarity === 'legendary' ? '#FFD700' :
                                   fruit.rarity === 'epic' ? '#9932CC' :
                                   fruit.rarity === 'rare' ? '#32CD32' : '#ffffff';
                this.ctx.font = 'bold 10px Arial';
            } else {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '8px Arial';
            }
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(fruit.points.toString(), centerX, centerY);
            this.ctx.restore();
        }
    }
    
    // Helper method to draw a fruit as a circle
    drawFruitCircle(fruit, centerX, centerY, size) {
        this.ctx.fillStyle = fruit.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw fruit name or icon if available
        if (fruit.name) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '6px Arial';
            this.ctx.fillText(fruit.name.charAt(0).toUpperCase(), centerX, centerY - 8);
        }
    }

    animateIntro() {
        // Create retro 80s style intro animation
        const title = document.getElementById('game-title');
        const buttons = document.querySelectorAll('.mode-btn');
        const startBtn = document.getElementById('start-btn');
        
        if (title) {
            // Animate title
            title.style.opacity = '0';
            title.style.transform = 'translateY(-50px)';
            
            setTimeout(() => {
                title.style.transition = 'all 1s ease-out';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 500);
        }
        
        // Animate mode buttons
        buttons.forEach((btn, index) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                btn.style.transition = 'all 0.5s ease-out';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
                btn.style.pointerEvents = 'auto';
            }, 1000 + (index * 200));
        });
        
        // Animate start button
        if (startBtn) {
            startBtn.style.opacity = '0';
            startBtn.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                startBtn.style.transition = 'all 0.5s ease-out';
                startBtn.style.opacity = '1';
                startBtn.style.transform = 'translateY(0)';
                startBtn.style.pointerEvents = 'auto';
            }, 1000 + (buttons.length * 200));
        }
    }

    drawCountdown(countdownInfo) {
        if (!countdownInfo) return;

        const { seconds, isWarning } = countdownInfo;
        const text = `Next block in ${seconds}s`;
        
        // Set text properties
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate position (in the extra space at bottom)
        const x = this.canvas.width / 2;
        const y = 510; // Centered in the extra 60px space
        
        // Add breathing animation effect when warning
        if (isWarning) {
            const scale = 1 + Math.sin(Date.now() / 200) * 0.1; // Breathing effect
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-x, -y);
            this.ctx.fillStyle = '#ff4444'; // Red color for warning
            
            // Add glow effect for warning
            this.ctx.shadowColor = '#ff4444';
            this.ctx.shadowBlur = 10;
        } else {
            this.ctx.fillStyle = '#ffffff';
            // Add slight glow for better visibility
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = 5;
        }
        
        // Draw text with outline for better visibility
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
        
        // Reset shadow and transform
        this.ctx.shadowBlur = 0;
        if (isWarning) {
            this.ctx.restore();
        }
    }
}