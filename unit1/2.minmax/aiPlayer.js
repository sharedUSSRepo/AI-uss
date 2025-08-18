// AI Player Implementation with Different Difficulty Levels
class AIPlayer {
    constructor(symbol, difficulty = 1) {
        this.symbol = symbol;
        this.difficulty = difficulty;
        this.randomness = 0.50; // For easy mode
    }
    
    /**
     * Get the AI's move based on difficulty level
     * @param {Array} board - Current board state
     * @returns {Object} - Move information including index and debug data
     */
    getMove(board) {
        const startTime = performance.now();
        let result;
        
        if (this.difficulty === 1) {
            result = this.getEasyMove(board);
        } else {
            result = this.getHardMove(board);
        }
        
        const endTime = performance.now();
        
        return {
            move: result.move,
            debugInfo: this.generateDebugInfo(result, endTime - startTime)
        };
    }
    
    /**
     * Easy mode: Minimax with probabilistic randomization
     * @param {Array} board - Current board state
     * @returns {Object} - Move result with additional info
     */
    getEasyMove(board) {
        const moves = MinimaxAlgorithm.getAllMovesWithScores(board, this.symbol);
        let selectedMove;
        let wasRandomized = false;
        
        if (Math.random() < this.randomness) {
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
                    selectedMove = moves[i];
                    wasRandomized = true;
                    break;
                }
            }
        }
        
        if (!selectedMove) {
            // Return best move
            selectedMove = moves.reduce((best, current) => 
                current.score > best.score ? current : best
            );
        }
        
        return {
            move: selectedMove.index,
            score: selectedMove.score,
            allMoves: moves,
            wasRandomized: wasRandomized,
            algorithm: 'minimax'
        };
    }
    
    /**
     * Hard mode: Minimax with alpha-beta pruning
     * @param {Array} board - Current board state
     * @returns {Object} - Move result with additional info
     */
    getHardMove(board) {
        const bestMove = MinimaxAlphaBeta.getBestMove(board, this.symbol);
        
        // Get additional statistics for debugging
        const stats = MinimaxAlphaBeta.getBestMoveWithStats(board, this.symbol);
        
        return {
            move: bestMove,
            score: stats.bestScore,
            nodesExplored: stats.nodesExplored,
            wasRandomized: false,
            algorithm: 'minimax-alpha-beta'
        };
    }
    
    /**
     * Generate debug information for the move
     * @param {Object} result - Move result from getEasyMove or getHardMove
     * @param {number} executionTime - Time taken to calculate move
     * @returns {string} - Formatted debug information
     */
    generateDebugInfo(result, executionTime) {
        let debugInfo = `AI Difficulty: Level ${this.difficulty}\n`;
        debugInfo += `Algorithm: ${result.algorithm}\n`;
        
        if (this.difficulty === 1) {
            debugInfo += `Randomization: ${result.wasRandomized ? 'Yes' : 'No'} (${(this.randomness * 100)}% chance)\n`;
            if (result.allMoves) {
                debugInfo += `Move scores: ${result.allMoves.map(m => `${m.index}:${m.score}`).join(', ')}\n`;
            }
        } else {
            if (result.nodesExplored) {
                debugInfo += `Nodes explored: ${result.nodesExplored}\n`;
            }
        }
        
        debugInfo += `Selected move: ${result.move} (score: ${result.score})\n`;
        debugInfo += `Calculation time: ${executionTime.toFixed(2)}ms`;
        
        return debugInfo;
    }
    
    /**
     * Set the randomness factor for easy mode
     * @param {number} randomness - Value between 0 and 1
     */
    setRandomness(randomness) {
        this.randomness = Math.max(0, Math.min(1, randomness));
    }
    
    /**
     * Set the difficulty level
     * @param {number} difficulty - 1 for easy, 2 for hard
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
}
