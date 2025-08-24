/**
 * AI implementation with Minimax + Alpha-Beta pruning
 */

import { COLORS } from './board.js';
import { HEURISTICS } from './heuristics.js';

export class ChessAI {
    constructor(options = {}) {
        this.maxDepth = options.depth || 3;
        this.heuristicId = options.heuristicId || 'material_king';
        this.timeLimit = options.timeLimit || 5000; // 5 seconds
        this.nodesSearched = 0;
        this.startTime = 0;
        this.debugInfo = {
            currentMove: null,
            movesCandidates: [],
            evaluationBreakdown: null,
            searchStats: {}
        };
    }

    /**
     * Get the best move for the given game state
     */
    getBestMove(gameState, options = {}) {
        console.log('AI getBestMove called for', gameState.currentPlayer);
        
        const depth = options.depth || this.maxDepth;
        const heuristicId = options.heuristicId || this.heuristicId;
        const timeLimit = options.timeLimit || this.timeLimit;

        // Initialize debug info
        this.debugInfo.movesCandidates = [];
        this.debugInfo.searchStats = {
            depth: depth,
            heuristic: heuristicId,
            nodesSearched: 0,
            timeElapsed: 0
        };

        // Make debug info available globally
        if (typeof window !== 'undefined') {
            window.debugInfo = this.debugInfo;
        }

        this.nodesSearched = 0;
        this.startTime = Date.now();
        
        // Map heuristic IDs to the actual heuristic objects
        const heuristicMap = {
            'material': HEURISTICS.MATERIAL_ONLY,
            'king_safety': HEURISTICS.KING_SAFETY,
            'material_king': HEURISTICS.MATERIAL_AND_KING_SAFETY
        };
        
        const heuristic = heuristicMap[heuristicId];
        if (!heuristic) {
            console.error(`Unknown heuristic: ${heuristicId}. Available: ${Object.keys(heuristicMap).join(', ')}`);
            throw new Error(`Unknown heuristic: ${heuristicId}`);
        }

        console.log('Using heuristic:', heuristic.name);

        const color = gameState.currentPlayer;
        const legalMoves = this.getLegalMoves(gameState);

        console.log('Found', legalMoves.length, 'legal moves');

        if (legalMoves.length === 0) {
            console.log('No legal moves available');
            return null; // No legal moves
        }

        if (legalMoves.length === 1) {
            console.log('Only one legal move:', legalMoves[0]);
            return legalMoves[0]; // Only one move
        }

        // Use iterative deepening for better time management
        let bestMove = legalMoves[0];
        let bestScore = -Infinity;

        console.log('Evaluating', legalMoves.length, 'moves at depth', depth);

        // Try each legal move
        for (let i = 0; i < legalMoves.length; i++) {
            const move = legalMoves[i];
            if (this.isTimeUp(timeLimit)) break;

            console.log(`Evaluating move ${i + 1}/${legalMoves.length}:`, this.moveToString(move));
            this.debugInfo.currentMove = this.moveToString(move);

            // Make the move on a copy of the game state
            const newGameState = this.makeMove(gameState, move);
            
            // Evaluate this move using minimax
            const score = this.minimax(
                newGameState, 
                depth - 1, 
                -Infinity, 
                Infinity, 
                false, // AI just moved, so now it's opponent's turn (minimize)
                heuristic,
                color,
                timeLimit
            );

            console.log(`Move ${this.moveToString(move)} scored: ${score}`);

            // Store move candidate for debug
            this.debugInfo.movesCandidates.push({
                move: this.moveToString(move),
                score: score,
                isBest: false
            });

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                console.log(`New best move: ${this.moveToString(move)} (score: ${score})`);
                
                // Update best move flag
                this.debugInfo.movesCandidates.forEach(candidate => {
                    candidate.isBest = candidate.move === this.moveToString(move);
                });
            }
        }

        // Finalize debug info
        this.debugInfo.searchStats.nodesSearched = this.nodesSearched;
        this.debugInfo.searchStats.timeElapsed = Date.now() - this.startTime;
        
        // Sort candidates by score for better display
        this.debugInfo.movesCandidates.sort((a, b) => b.score - a.score);

        console.log(`AI searched ${this.nodesSearched} nodes in ${Date.now() - this.startTime}ms`);
        console.log(`Best move: ${this.moveToString(bestMove)} (score: ${bestScore})`);

        return bestMove;
    }

    /**
     * Minimax algorithm with alpha-beta pruning
     */
    minimax(gameState, depth, alpha, beta, isMaximizing, heuristic, aiColor, timeLimit) {
        this.nodesSearched++;

        // Time cutoff
        if (this.isTimeUp(timeLimit)) {
            return this.evaluatePosition(gameState, heuristic, aiColor);
        }

        // Base case: reached maximum depth or game over
        if (depth === 0 || gameState.gameStatus !== 'playing') {
            return this.evaluatePosition(gameState, heuristic, aiColor);
        }

        const legalMoves = this.getLegalMoves(gameState);
        
        if (legalMoves.length === 0) {
            // No legal moves - game over
            return this.evaluateGameOver(gameState, aiColor);
        }

        // Sort moves for better alpha-beta pruning (captures first, checks, etc.)
        const sortedMoves = this.orderMoves(gameState, legalMoves);

        if (isMaximizing) {
            let maxEval = -Infinity;
            
            for (const move of sortedMoves) {
                if (this.isTimeUp(timeLimit)) break;
                
                const newGameState = this.makeMove(gameState, move);
                const eval_ = this.minimax(newGameState, depth - 1, alpha, beta, false, heuristic, aiColor, timeLimit);
                
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            
            return maxEval;
        } else {
            let minEval = Infinity;
            
            for (const move of sortedMoves) {
                if (this.isTimeUp(timeLimit)) break;
                
                const newGameState = this.makeMove(gameState, move);
                const eval_ = this.minimax(newGameState, depth - 1, alpha, beta, true, heuristic, aiColor, timeLimit);
                
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            
            return minEval;
        }
    }

    /**
     * Create a new game state after making a move
     */
    makeMove(gameState, move) {
        // Clone the board and apply the move
        const newBoard = gameState.board.clone();
        const piece = newBoard.getPiece(move.from[0], move.from[1]);
        
        if (!piece) return gameState;
        
        // Apply the move
        newBoard.setPiece(move.to[0], move.to[1], piece);
        newBoard.setPiece(move.from[0], move.from[1], null);
        piece.moved = true;
        
        // Switch player
        const newPlayer = gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        // Create new game state
        const newGameState = {
            board: newBoard,
            currentPlayer: newPlayer,
            gameStatus: 'playing',
            lastMove: move,
            legalMoves: newBoard.generatePseudoLegalMoves(newPlayer).filter(m => this.isLegalMove(newBoard, m, newPlayer))
        };
        
        // Check for game over conditions
        if (newGameState.legalMoves.length === 0) {
            if (newBoard.isInCheck(newPlayer)) {
                newGameState.gameStatus = 'checkmate';
            } else {
                newGameState.gameStatus = 'stalemate';
            }
        }
        
        return newGameState;
    }

    /**
     * Check if a move is legal (doesn't leave king in check)
     */
    isLegalMove(board, move, color) {
        const tempBoard = board.clone();
        const piece = tempBoard.getPiece(move.from[0], move.from[1]);
        
        if (!piece || piece.color !== color) return false;
        
        // Apply move temporarily
        tempBoard.setPiece(move.to[0], move.to[1], piece);
        tempBoard.setPiece(move.from[0], move.from[1], null);
        
        // Check if this leaves king in check
        return !tempBoard.isInCheck(color);
    }

    /**
     * Clone the game state for simulation
     */
    cloneGameState(gameState) {
        // We'll pass the engine from outside to avoid circular dependencies
        // For now, create a minimal game state simulation
        return {
            board: gameState.board.clone(),
            currentPlayer: gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE,
            gameStatus: 'playing',
            lastMove: null,
            legalMoves: [],
            makeMove: (from, to) => {
                // Simple move execution for AI simulation
                const piece = this.board.getPiece(from[0], from[1]);
                if (piece) {
                    this.board.setPiece(to[0], to[1], piece);
                    this.board.setPiece(from[0], from[1], null);
                    piece.moved = true;
                }
            },
            getGameState: () => this
        };
    }

    /**
     * Get legal moves from game state
     */
    getLegalMoves(gameState) {
        if (gameState.legalMoves && gameState.legalMoves.length > 0) {
            return gameState.legalMoves;
        }
        
        // Generate legal moves if not provided
        const pseudoMoves = gameState.board.generatePseudoLegalMoves(gameState.currentPlayer);
        return pseudoMoves.filter(move => this.isLegalMove(gameState.board, move, gameState.currentPlayer));
    }

    /**
     * Evaluate the position using the given heuristic
     */
    evaluatePosition(gameState, heuristic, aiColor) {
        if (gameState.gameStatus === 'checkmate') {
            // Checkmate is very good/bad depending on who won
            const winner = gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            return winner === aiColor ? 10000 : -10000;
        }
        
        if (gameState.gameStatus === 'stalemate' || gameState.gameStatus === 'draw') {
            return 0; // Draw
        }

        try {
            const score = heuristic.evaluate(gameState, aiColor);
            return score;
        } catch (error) {
            console.error('Heuristic evaluation error:', error);
            return 0;
        }
    }

    /**
     * Evaluate game over positions
     */
    evaluateGameOver(gameState, aiColor) {
        if (gameState.gameStatus === 'checkmate') {
            const winner = gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            return winner === aiColor ? 10000 : -10000;
        }
        return 0; // Draw
    }

    /**
     * Order moves for better alpha-beta pruning
     */
    orderMoves(gameState, moves) {
        const board = gameState.board;
        
        return moves.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            
            // Prioritize captures
            const captureA = board.getPiece(a.to[0], a.to[1]);
            const captureB = board.getPiece(b.to[0], b.to[1]);
            
            if (captureA) scoreA += 100;
            if (captureB) scoreB += 100;
            
            // Prioritize moving more valuable pieces last (safer)
            const pieceA = board.getPiece(a.from[0], a.from[1]);
            const pieceB = board.getPiece(b.from[0], b.from[1]);
            
            if (pieceA) scoreA -= this.getPieceValue(pieceA.type);
            if (pieceB) scoreB -= this.getPieceValue(pieceB.type);
            
            return scoreB - scoreA;
        });
    }

    /**
     * Get piece value for move ordering
     */
    getPieceValue(pieceType) {
        const values = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100 };
        return values[pieceType] || 0;
    }

    /**
     * Check if time limit is exceeded
     */
    isTimeUp(timeLimit) {
        return Date.now() - this.startTime > timeLimit;
    }

    /**
     * Convert move to string for logging
     */
    moveToString(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = files[move.from[1]] + ranks[move.from[0]];
        const to = files[move.to[1]] + ranks[move.to[0]];
        return from + to;
    }

    /**
     * Update AI settings
     */
    updateSettings(options) {
        if (options.depth !== undefined) this.maxDepth = options.depth;
        if (options.heuristicId !== undefined) this.heuristicId = options.heuristicId;
        if (options.timeLimit !== undefined) this.timeLimit = options.timeLimit;
    }
}
