export class Controls {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(e) {
        // Prevent arrow keys from scrolling the page
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        const gameState = this.game.gameState;
        
        // Change direction based on key press
        switch (e.key) {
            case 'ArrowUp':
                if (gameState.direction !== 'down') gameState.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (gameState.direction !== 'up') gameState.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (gameState.direction !== 'right') gameState.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (gameState.direction !== 'left') gameState.nextDirection = 'right';
                break;
            case ' ':
                // Space bar to restart game
                if (!gameState.gameActive) this.game.restart();
                break;
        }
    }
}