// Tic-Tac-Toe AI Game - Main Game Controller
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.difficulty = 1;
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.ai = new AIPlayer(this.aiPlayer, this.difficulty);
        this.scores = { player: 0, ai: 0, draw: 0 };
        this.debugMode = true;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = parseInt(e.target.value);
            this.ai.setDifficulty(this.difficulty);
        });
        document.getElementById('playerSymbol').addEventListener('change', (e) => {
            this.humanPlayer = e.target.value;
            this.aiPlayer = this.humanPlayer === 'X' ? 'O' : 'X';
            this.ai = new AIPlayer(this.aiPlayer, this.difficulty);
        });
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }
    
    startNewGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateDisplay();
        this.updateGameStatus('Game started! Make your move.');
        
        // If AI goes first, make AI move
        if (this.aiPlayer === 'X') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    handleCellClick(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (!this.gameActive || this.board[index] !== null || this.currentPlayer !== this.humanPlayer) {
            return;
        }
        
        this.makeMove(index, this.humanPlayer);
        
        if (this.gameActive && this.currentPlayer === this.aiPlayer) {
            setTimeout(() => this.makeAIMove(), 300);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateDisplay();
        
        const result = this.checkGameEnd();
        if (result && result.type !== 'ongoing') {
            this.handleGameEnd(result);
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        const aiResult = this.ai.getMove(this.board);
        this.updateDebugInfo(aiResult.debugInfo);
        this.makeMove(aiResult.move, this.aiPlayer);
    }
    
    checkGameEnd() {
        return GameUtils.getGameStatus(this.board);
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result.type === 'win') {
            this.highlightWinningCells(result.pattern);
            if (result.winner === this.humanPlayer) {
                this.updateGameStatus('You win! 🎉');
                this.scores.player++;
            } else {
                this.updateGameStatus('AI wins! 🤖');
                this.scores.ai++;
            }
        } else {
            this.updateGameStatus("It's a draw! 🤝");
            this.scores.draw++;
        }
        
        this.updateScoreBoard();
    }
    
    highlightWinningCells(pattern) {
        if (!pattern) return;
        
        pattern.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
    }
    
    updateDisplay() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const value = this.board[index];
            cell.textContent = value || '';
            cell.className = 'cell';
            
            if (value) {
                cell.classList.add(value.toLowerCase());
            }
            
            if (!this.gameActive) {
                cell.classList.add('disabled');
            }
        });
    }
    
    updateGameStatus(message) {
        document.getElementById('gameStatus').textContent = message;
    }
    
    updateScoreBoard() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('drawScore').textContent = this.scores.draw;
    }
    
    updateDebugInfo(info) {
        if (this.debugMode) {
            document.getElementById('debugInfo').textContent = info;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
});
