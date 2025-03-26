class Database {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
    }

    async getHighScore(mode) {
        try {
            if (!mode) return 0;
            
            const response = await fetch(`${this.baseUrl}/high-score/${mode}`);
            if (!response.ok) {
                throw new Error('Failed to get high score');
            }
            const data = await response.json();
            return data.highScore || 0;
        } catch (error) {
            console.error('Error getting high score:', error);
            return 0;
        }
    }

    async saveScore(mode, playerName, score) {
        try {
            if (!mode) return false;
            
            const response = await fetch(`${this.baseUrl}/save-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode,
                    playerName,
                    score
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save score');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving score:', error);
            return false;
        }
    }

    async getLeaderboard(mode) {
        try {
            if (!mode) return [];
            
            const response = await fetch(`${this.baseUrl}/leaderboard/${mode}`);
            if (!response.ok) {
                throw new Error('Failed to get leaderboard');
            }
            const data = await response.json();
            return data.leaderboard || [];
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }

    async getAllLeaderboards() {
        try {
            const modes = ['classic', 'time_attack', 'survival', 'ai'];
            const leaderboards = {};
            
            for (const mode of modes) {
                leaderboards[mode] = await this.getLeaderboard(mode);
            }
            
            return leaderboards;
        } catch (error) {
            console.error('Error getting all leaderboards:', error);
            return {};
        }
    }
}

export const database = new Database(); 