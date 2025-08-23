/**
 * Main entry point - initializes the chess game
 */

import { GameEngine } from './engine.js';
import { ChessUI } from './ui.js';

class ChessGame {
    constructor() {
        this.engine = new GameEngine();
        this.ui = null;
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
        // Initialize the UI
        this.ui = new ChessUI(this.engine);
        
        // Make game accessible from console for debugging
        window.chessGame = this;
        
        console.log('Chess game initialized!');
        console.log('Use window.chessGame to access the game from console');
    }

    // Debug methods for console use
    debug() {
        return {
            engine: this.engine,
            ui: this.ui,
            gameState: this.engine.getGameState(),
            board: this.engine.board.squares,
            legalMoves: this.engine.getLegalMoves()
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
}

// Initialize the game
new ChessGame();
