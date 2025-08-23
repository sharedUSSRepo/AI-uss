/**
 * Game engine - handles game state, move validation, and execution
 */

import { Board, COLORS, PIECE_TYPES } from './board.js';

export class GameEngine {
    constructor() {
        this.board = new Board();
        this.currentPlayer = COLORS.WHITE;
        this.moveHistory = [];
        this.gameStatus = 'playing'; // 'playing', 'checkmate', 'stalemate', 'draw'
        this.lastMove = null;
        this.halfMoveClock = 0; // For 50-move rule
        this.fullMoveNumber = 1;
    }

    // Get legal moves for the current player
    getLegalMoves(color = this.currentPlayer) {
        const pseudoLegalMoves = this.board.generatePseudoLegalMoves(color);
        const legalMoves = [];

        for (const move of pseudoLegalMoves) {
            if (this.isLegalMove(move)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    // Check if a move is legal (doesn't leave own king in check)
    isLegalMove(move) {
        // Make a temporary copy of the board
        const tempBoard = this.board.clone();
        const piece = tempBoard.getPiece(move.from[0], move.from[1]);
        
        if (!piece) return false;

        // Apply the move temporarily
        tempBoard.setPiece(move.to[0], move.to[1], piece);
        tempBoard.setPiece(move.from[0], move.from[1], null);

        // Check if this move leaves the king in check
        return !tempBoard.isInCheck(piece.color);
    }

    // Make a move if it's legal
    makeMove(from, to) {
        const move = { from, to };
        
        if (!this.isValidMoveFormat(move)) {
            return { success: false, error: 'Invalid move format' };
        }

        const piece = this.board.getPiece(from[0], from[1]);
        
        if (!piece) {
            return { success: false, error: 'No piece at source square' };
        }

        if (piece.color !== this.currentPlayer) {
            return { success: false, error: 'Not your piece' };
        }

        if (!this.isLegalMove(move)) {
            return { success: false, error: 'Illegal move' };
        }

        // Execute the move
        const capturedPiece = this.board.getPiece(to[0], to[1]);
        
        // Store move in history
        const moveRecord = {
            from,
            to,
            piece: piece.clone(),
            capturedPiece: capturedPiece ? capturedPiece.clone() : null,
            halfMoveClock: this.halfMoveClock,
            fullMoveNumber: this.fullMoveNumber
        };

        this.moveHistory.push(moveRecord);

        // Apply the move
        this.board.setPiece(to[0], to[1], piece);
        this.board.setPiece(from[0], from[1], null);
        piece.moved = true;

        // Update clocks
        if (piece.type === PIECE_TYPES.PAWN || capturedPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (this.currentPlayer === COLORS.BLACK) {
            this.fullMoveNumber++;
        }

        // Handle pawn promotion (basic - always promote to queen)
        if (piece.type === PIECE_TYPES.PAWN) {
            const promotionRow = piece.color === COLORS.WHITE ? 0 : 7;
            if (to[0] === promotionRow) {
                piece.type = PIECE_TYPES.QUEEN;
                moveRecord.promotion = PIECE_TYPES.QUEEN;
            }
        }

        this.lastMove = move;
        this.currentPlayer = this.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        // Check game status
        this.updateGameStatus();

        return { 
            success: true, 
            capturedPiece,
            promotion: moveRecord.promotion 
        };
    }

    // Undo the last move
    undoMove() {
        if (this.moveHistory.length === 0) {
            return { success: false, error: 'No moves to undo' };
        }

        const lastMoveRecord = this.moveHistory.pop();
        
        // Restore the piece to original position
        this.board.setPiece(lastMoveRecord.from[0], lastMoveRecord.from[1], lastMoveRecord.piece);
        this.board.setPiece(lastMoveRecord.to[0], lastMoveRecord.to[1], lastMoveRecord.capturedPiece);

        // Restore game state
        this.halfMoveClock = lastMoveRecord.halfMoveClock;
        this.fullMoveNumber = lastMoveRecord.fullMoveNumber;
        this.currentPlayer = this.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        this.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
        this.gameStatus = 'playing';

        return { success: true };
    }

    // Update game status (checkmate, stalemate, draw)
    updateGameStatus() {
        const legalMoves = this.getLegalMoves();
        const isInCheck = this.board.isInCheck(this.currentPlayer);

        if (legalMoves.length === 0) {
            if (isInCheck) {
                this.gameStatus = 'checkmate';
            } else {
                this.gameStatus = 'stalemate';
            }
        } else if (this.halfMoveClock >= 100) { // 50-move rule (100 half-moves)
            this.gameStatus = 'draw';
        } else if (this.isInsufficientMaterial()) {
            this.gameStatus = 'draw';
        } else {
            this.gameStatus = 'playing';
        }
    }

    // Check for insufficient material draw
    isInsufficientMaterial() {
        const pieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                if (piece) {
                    pieces.push(piece);
                }
            }
        }

        // King vs King
        if (pieces.length === 2) {
            return true;
        }

        // King and Bishop/Knight vs King
        if (pieces.length === 3) {
            const nonKings = pieces.filter(p => p.type !== PIECE_TYPES.KING);
            if (nonKings.length === 1) {
                const piece = nonKings[0];
                return piece.type === PIECE_TYPES.BISHOP || piece.type === PIECE_TYPES.KNIGHT;
            }
        }

        return false;
    }

    // Validate move format
    isValidMoveFormat(move) {
        return move.from && move.to && 
               Array.isArray(move.from) && Array.isArray(move.to) &&
               move.from.length === 2 && move.to.length === 2 &&
               this.board.isValidSquare(move.from[0], move.from[1]) &&
               this.board.isValidSquare(move.to[0], move.to[1]);
    }

    // Get pieces that can move to a specific square (for move notation)
    getPiecesMovingTo(to, pieceType, color) {
        const moves = this.getLegalMoves(color);
        return moves.filter(move => {
            const piece = this.board.getPiece(move.from[0], move.from[1]);
            return piece.type === pieceType && 
                   move.to[0] === to[0] && move.to[1] === to[1];
        });
    }

    // Convert move to algebraic notation
    moveToAlgebraic(move, capturedPiece = null) {
        const piece = this.board.getPiece(move.to[0], move.to[1]);
        if (!piece) return '';

        const files = 'abcdefgh';
        const ranks = '87654321';
        
        const fromSquare = files[move.from[1]] + ranks[move.from[0]];
        const toSquare = files[move.to[1]] + ranks[move.to[1]];

        if (piece.type === PIECE_TYPES.PAWN) {
            if (capturedPiece) {
                return files[move.from[1]] + 'x' + toSquare;
            }
            return toSquare;
        }

        let notation = piece.type.toUpperCase();
        
        if (capturedPiece) {
            notation += 'x';
        }
        
        notation += toSquare;

        // Add check/checkmate notation
        const oppositeColor = piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        if (this.board.isInCheck(oppositeColor)) {
            if (this.gameStatus === 'checkmate') {
                notation += '#';
            } else {
                notation += '+';
            }
        }

        return notation;
    }

    // Get current game state for AI or external use
    getGameState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            moveHistory: this.moveHistory,
            lastMove: this.lastMove,
            legalMoves: this.getLegalMoves(),
            isInCheck: this.board.isInCheck(this.currentPlayer)
        };
    }

    // Reset the game
    reset() {
        this.board = new Board();
        this.currentPlayer = COLORS.WHITE;
        this.moveHistory = [];
        this.gameStatus = 'playing';
        this.lastMove = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
    }
}
