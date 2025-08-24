/**
 * Main entry point - initializes the chess game
 */

import { GameEngine } from './engine.js';
import { ChessUI } from './ui.js';
import { ChessAI } from './ai.js';
import { HEURISTICS } from './heuristics.js';

class ChessGame {
    constructor() {
        this.engine = new GameEngine();
        this.ui = null;
        this.ai = null;
        this.init();
    }

    init() {
        // Wait for DOM to be loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }

    setupGame() {
        // Initialize the UI (which includes AI integration)
        this.ui = new ChessUI(this.engine);
        this.ai = this.ui.ai;
        
        // Make game accessible from console for debugging
        window.chessGame = this;
        window.HEURISTICS = HEURISTICS;
        window.debugInfo = this.ai.debugInfo;
        
        // Expose AI instances for debugging
        this.whiteAI = this.ui.whiteAI;
        this.blackAI = this.ui.blackAI;
        window.chessGame.whiteAI = this.whiteAI;
        window.chessGame.blackAI = this.blackAI;
        
        console.log('Chess game with AI vs AI functionality initialized!');
        console.log('Available heuristics:', Object.keys(HEURISTICS));
        console.log('Game modes: Human vs AI, AI vs AI');
        console.log('Use window.chessGame to access the game from console');
        console.log('Debug panel shows real-time AI analysis');
    }

    // Debug methods for console use
    debug() {
        return {
            engine: this.engine,
            ui: this.ui,
            ai: this.ai,
            gameState: this.engine.getGameState(),
            board: this.engine.board.squares,
            legalMoves: this.engine.getLegalMoves(),
            heuristics: HEURISTICS
        };
    }

    // Helper method to make moves from console (for testing)
    makeMove(from, to) {
        const result = this.engine.makeMove(from, to);
        if (result.success && this.ui) {
            this.ui.updateUI();
        }
        return result;
    }

    // Helper method to get piece at position
    getPiece(row, col) {
        return this.engine.board.getPiece(row, col);
    }

    // Test AI move
    testAI() {
        if (this.ai) {
            const gameState = this.engine.getGameState();
            return this.ai.getBestMove(gameState);
        }
        return null;
    }

    // Evaluate current position with different heuristics
    evaluatePosition() {
        const gameState = this.engine.getGameState();
        const results = {};
        
        for (const [key, heuristic] of Object.entries(HEURISTICS)) {
            results[key] = {
                white: heuristic.evaluate(gameState, 'w'),
                black: heuristic.evaluate(gameState, 'b')
            };
        }
        
        return results;
    }
}

// Initialize the game
new ChessGame();
