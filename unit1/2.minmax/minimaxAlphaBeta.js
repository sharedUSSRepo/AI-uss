// Minimax Algorithm with Alpha-Beta Pruning
class MinimaxAlphaBeta {
    /**
     * Minimax algorithm with alpha-beta pruning for optimization
     * @param {Array} board - Current board state
     * @param {number} depth - Current search depth
     * @param {boolean} isMaximizing - Whether this is a maximizing turn
     * @param {string} aiPlayer - AI player symbol ('X' or 'O')
     * @param {number} alpha - Alpha value for pruning
     * @param {number} beta - Beta value for pruning
     * @returns {number} - Evaluation score
     */
    static minimaxAlphaBeta(board, depth, isMaximizing, aiPlayer, alpha, beta) {
        const result = GameUtils.evaluateBoard(board, aiPlayer);
        
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
    
    /**
     * Get best move using minimax with alpha-beta pruning
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
                const score = this.minimaxAlphaBeta(boardCopy, 0, false, aiPlayer, -Infinity, Infinity);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    /**
     * Get performance statistics for the alpha-beta algorithm
     * @param {Array} board - Current board state
     * @param {string} aiPlayer - AI player symbol
     * @returns {Object} - Statistics including best move, nodes explored, etc.
     */
    static getBestMoveWithStats(board, aiPlayer) {
        let bestScore = -Infinity;
        let bestMove = 0;
        let nodesExplored = 0;
        const startTime = performance.now();
        
        // Override the minimax method to count nodes
        const originalMethod = this.minimaxAlphaBeta;
        this.minimaxAlphaBeta = function(board, depth, isMaximizing, aiPlayer, alpha, beta) {
            nodesExplored++;
            return originalMethod.call(this, board, depth, isMaximizing, aiPlayer, alpha, beta);
        };
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                const boardCopy = [...board];
                boardCopy[i] = aiPlayer;
                const score = this.minimaxAlphaBeta(boardCopy, 0, false, aiPlayer, -Infinity, Infinity);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        // Restore original method
        this.minimaxAlphaBeta = originalMethod;
        
        const endTime = performance.now();
        
        return {
            bestMove: bestMove,
            bestScore: bestScore,
            nodesExplored: nodesExplored,
            executionTime: endTime - startTime
        };
    }
}
