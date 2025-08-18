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
        if (result) {
            this.handleGameEnd(result);
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }
    
    checkGameEnd() {
        return GameUtils.getGameStatus(this.board);
    }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        const aiResult = this.ai.getMove(this.board);
        this.updateDebugInfo(aiResult.debugInfo);
        this.makeMove(aiResult.move, this.aiPlayer);
    }
    
    getEasyMove() {
        const randomness = 0.25;
        
        // Get all possible moves with their minimax scores
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const boardCopy = [...this.board];
                boardCopy[i] = this.aiPlayer;
                const score = this.minimax(boardCopy, 0, false, this.aiPlayer);
                moves.push({ index: i, score: score });
            }
        }
        
        if (Math.random() < randomness) {
            // Use softmax to create probability distribution from scores
            const scores = moves.map(m => m.score);
            const maxScore = Math.max(...scores);
            const expScores = scores.map(s => Math.exp((s - maxScore) * 2)); // Temperature = 0.5
            const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);
            const probabilities = expScores.map(exp => exp / sumExp);
            
            // Select move based on probability distribution
            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < moves.length; i++) {
                cumulative += probabilities[i];
                if (rand <= cumulative) {
                    return moves[i].index;
                }
            }
        }
        
        // Return best move
        return moves.reduce((best, current) => 
            current.score > best.score ? current : best
        ).index;
    }
    
    getHardMove() {
        let bestScore = -Infinity;
        let bestMove = 0;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const boardCopy = [...this.board];
                boardCopy[i] = this.aiPlayer;
                const score = this.minimaxAlphaBeta(boardCopy, 0, false, this.aiPlayer, -Infinity, Infinity);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing, aiPlayer) {
        const result = this.evaluateBoard(board, aiPlayer);
        
        if (result !== null) {
            return result;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = aiPlayer;
                    const score = this.minimax(board, depth + 1, false, aiPlayer);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            const opponent = aiPlayer === 'X' ? 'O' : 'X';
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = opponent;
                    const score = this.minimax(board, depth + 1, true, aiPlayer);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    minimaxAlphaBeta(board, depth, isMaximizing, aiPlayer, alpha, beta) {
        const result = this.evaluateBoard(board, aiPlayer);
        
        if (result !== null) {
            return result;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = aiPlayer;
                    const score = this.minimaxAlphaBeta(board, depth + 1, false, aiPlayer, alpha, beta);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    
                    if (beta <= alpha) {
                        break; // Alpha-beta pruning
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            const opponent = aiPlayer === 'X' ? 'O' : 'X';
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = opponent;
                    const score = this.minimaxAlphaBeta(board, depth + 1, true, aiPlayer, alpha, beta);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    
                    if (beta <= alpha) {
                        break; // Alpha-beta pruning
                    }
                }
            }
            return bestScore;
        }
    }
    
    evaluateBoard(board, aiPlayer) {
        const winner = this.checkWinner(board);
        
        if (winner === aiPlayer) {
            return 1;
        } else if (winner === (aiPlayer === 'X' ? 'O' : 'X')) {
            return -1;
        } else if (this.isBoardFull(board)) {
            return 0;
        }
        
        return null; // Game not finished
    }
    
    checkWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }
    
    isBoardFull(board) {
        return board.every(cell => cell !== null);
    }
    
    checkGameEnd() {
        const winner = this.checkWinner(this.board);
        
        if (winner) {
            return { type: 'win', winner: winner };
        } else if (this.isBoardFull(this.board)) {
            return { type: 'draw' };
        }
        
        return null;
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result.type === 'win') {
            this.highlightWinningCells();
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
    
    highlightWinningCells() {
        const winner = this.checkWinner(this.board);
        if (!winner) return;
        
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
                document.querySelector(`[data-index="${a}"]`).classList.add('winning');
                document.querySelector(`[data-index="${b}"]`).classList.add('winning');
                document.querySelector(`[data-index="${c}"]`).classList.add('winning');
                break;
            }
        }
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
