// Minimax Algorithm Implementation
class MinimaxAlgorithm {
    /**
     * Standard minimax algorithm without pruning
     * @param {Array} board - Current board state
     * @param {number} depth - Current search depth
     * @param {boolean} isMaximizing - Whether this is a maximizing turn
     * @param {string} aiPlayer - AI player symbol ('X' or 'O')
     * @returns {number} - Evaluation score
     */
    static minimax(board, depth, isMaximizing, aiPlayer) {
        const result = GameUtils.evaluateBoard(board, aiPlayer);
        
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
    
    /**
     * Get best move using standard minimax
     * @param {Array} board - Current board state
     * @param {string} aiPlayer - AI player symbol
     * @returns {number} - Best move index
     */
    static getBestMove(board, aiPlayer) {
        let bestScore = -Infinity;
        let bestMove = 0;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                const boardCopy = [...board];
                boardCopy[i] = aiPlayer;
                const score = this.minimax(boardCopy, 0, false, aiPlayer);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    /**
     * Get all possible moves with their minimax scores
     * @param {Array} board - Current board state
     * @param {string} aiPlayer - AI player symbol
     * @returns {Array} - Array of {index, score} objects
     */
    static getAllMovesWithScores(board, aiPlayer) {
        const moves = [];
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                const boardCopy = [...board];
                boardCopy[i] = aiPlayer;
                const score = this.minimax(boardCopy, 0, false, aiPlayer);
                moves.push({ index: i, score: score });
            }
        }
        
        return moves;
    }
}
