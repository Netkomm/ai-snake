import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3003;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

let db;

async function initDatabase() {
    try {
        // Ensure the database directory exists
        const dbPath = './data';
        await fs.mkdir(dbPath, { recursive: true });
        
        db = await open({
            filename: './data/snake_game.db',
            driver: sqlite3.Database
        });

        // Create tables
        await db.exec(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mode TEXT NOT NULL,
                player_name TEXT NOT NULL,
                score INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS high_scores (
                mode TEXT PRIMARY KEY,
                score INTEGER NOT NULL,
                player_name TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Initialize high scores
        const modes = ['classic', 'time_attack', 'survival', 'ai'];
        for (const mode of modes) {
            await db.run(`
                INSERT OR IGNORE INTO high_scores (mode, score, player_name)
                VALUES (?, 0, 'Anonymous')
            `, [mode]);
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// API Routes
app.get('/high-score/:mode', async (req, res) => {
    try {
        const { mode } = req.params;
        const result = await db.get(
            'SELECT score FROM high_scores WHERE mode = ?',
            [mode]
        );
        res.json({ highScore: result ? result.score : 0 });
    } catch (error) {
        console.error('Error getting high score:', error);
        res.status(500).json({ error: 'Failed to get high score' });
    }
});

app.post('/save-score', async (req, res) => {
    let transaction = false;
    try {
        const { mode, playerName, score } = req.body;
        
        // Validate inputs
        if (!mode || !playerName || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Don't save anonymous scores
        if (!playerName.trim() || playerName.toLowerCase() === 'anonymous') {
            return res.status(400).json({ error: 'Valid player name required' });
        }
        
        // Start transaction
        await db.run('BEGIN TRANSACTION');
        transaction = true;
        
        // Insert into scores table
        await db.run(
            'INSERT INTO scores (mode, player_name, score) VALUES (?, ?, ?)',
            [mode, playerName, score]
        );
        
        // Update high score if necessary
        const currentHighScore = await db.get(
            'SELECT score FROM high_scores WHERE mode = ?',
            [mode]
        );
        
        if (!currentHighScore || score > currentHighScore.score) {
            await db.run(`
                UPDATE high_scores 
                SET score = ?, player_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE mode = ?
            `, [score, playerName, mode]);
        }
        
        // Commit transaction
        await db.run('COMMIT');
        transaction = false;
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving score:', error);
        // Only rollback if we started a transaction
        if (transaction) {
            try {
                await db.run('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get('/leaderboard/:mode', async (req, res) => {
    try {
        const { mode } = req.params;
        const results = await db.all(`
            SELECT player_name, score, created_at
            FROM scores 
            WHERE mode = ? 
            ORDER BY score DESC, created_at DESC
            LIMIT 7
        `, [mode]);
        res.json({ leaderboard: results || [] });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Initialize database before starting server
await initDatabase();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 