export const CANVAS_CONFIG = {
    gridSize: 30,
    minGameSpeed: 70,
    initialGameSpeed: 200
};

export const COLORS = {
    snake: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'],
    food: ['#e94560', '#ff2e63', '#ff477e', '#ff719a', '#ff8fab'],
    background: '#0f3460',
    grid: '#16213e',
    ai: ['#3498db', '#2980b9', '#1abc9c', '#16a085']
};

export const GAME_MODES = {
    classic: { name: 'Classic', initialSpeed: 100, speedIncrease: true },
    timeAttack: { name: 'Time Attack', initialSpeed: 100, timeLimit: 120000, speedIncrease: true },
    survival: { name: 'Survival', initialSpeed: 100, obstacles: true, speedIncrease: true, maxBlocks: 20 },
    ai: { name: 'VS AI', initialSpeed: 100, aiOpponent: true, speedIncrease: true }
};