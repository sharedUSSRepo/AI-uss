/**
 * UI handling - rendering the board, handling user interactions
 */

import { COLORS, PIECE_TYPES } from './board.js';

export class ChessUI {
    constructor(engine) {
        this.engine = engine;
        this.selectedSquare = null;
        this.highlightedSquares = [];
        this.flipped = false;
        this.moveHistory = [];
        
        this.initializeBoard();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeBoard() {
        const boardElement = document.getElementById('chess-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add file and rank labels for first/last squares
                if (col === 0) {
                    square.dataset.rank = 8 - row;
                }
                if (row === 7) {
                    square.dataset.file = String.fromCharCode(97 + col); // 'a' to 'h'
                }

                square.addEventListener('click', (e) => this.handleSquareClick(e));
                boardElement.appendChild(square);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.engine.reset();
            this.selectedSquare = null;
            this.highlightedSquares = [];
            this.moveHistory = [];
            this.updateUI();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            const result = this.engine.undoMove();
            if (result.success) {
                if (this.moveHistory.length > 0) {
                    this.moveHistory.pop();
                }
                this.selectedSquare = null;
                this.highlightedSquares = [];
                this.updateUI();
            }
        });

        document.getElementById('flip-board-btn').addEventListener('click', () => {
            this.flipped = !this.flipped;
            this.renderBoard();
        });
    }

    handleSquareClick(event) {
        const row = parseInt(event.currentTarget.dataset.row);
        const col = parseInt(event.currentTarget.dataset.col);

        if (this.selectedSquare) {
            // Try to make a move
            if (this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
                // Clicking the same square - deselect
                this.clearSelection();
            } else {
                // Try to make the move
                const result = this.engine.makeMove(this.selectedSquare, [row, col]);
                if (result.success) {
                    // Add move to history display
                    const algebraic = this.engine.moveToAlgebraic(
                        { from: this.selectedSquare, to: [row, col] },
                        result.capturedPiece
                    );
                    this.moveHistory.push(algebraic);
                    
                    this.clearSelection();
                    this.updateUI();
                } else {
                    // Invalid move - try selecting the clicked square instead
                    this.selectSquare(row, col);
                }
            }
        } else {
            // Select a piece
            this.selectSquare(row, col);
        }
    }

    selectSquare(row, col) {
        const piece = this.engine.board.getPiece(row, col);
        
        if (piece && piece.color === this.engine.currentPlayer) {
            this.selectedSquare = [row, col];
            this.highlightLegalMoves(row, col);
            this.renderBoard();
        } else {
            this.clearSelection();
        }
    }

    clearSelection() {
        this.selectedSquare = null;
        this.highlightedSquares = [];
        this.renderBoard();
    }

    highlightLegalMoves(row, col) {
        const legalMoves = this.engine.getLegalMoves();
        this.highlightedSquares = legalMoves
            .filter(move => move.from[0] === row && move.from[1] === col)
            .map(move => move.to);
    }

    updateUI() {
        this.renderBoard();
        this.updateGameInfo();
        this.updateMoveList();
        this.updateCapturedPieces();
    }

    renderBoard() {
        const boardElement = document.getElementById('chess-board');
        const squares = boardElement.children;

        for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Clear previous styling
            square.classList.remove('selected', 'highlighted', 'last-move');
            square.innerHTML = '';

            // Add piece if present
            const piece = this.engine.board.getPiece(row, col);
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', piece.color);
                
                // Set the piece initial as text content
                const pieceInitial = this.getPieceInitial(piece.type);
                pieceElement.textContent = pieceInitial;
                
                square.appendChild(pieceElement);
            }

            // Highlight selected square
            if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
                square.classList.add('selected');
            }

            // Highlight legal move targets
            if (this.highlightedSquares.some(pos => pos[0] === row && pos[1] === col)) {
                square.classList.add('highlighted');
            }

            // Highlight last move
            if (this.engine.lastMove) {
                const lastMove = this.engine.lastMove;
                if ((lastMove.from[0] === row && lastMove.from[1] === col) ||
                    (lastMove.to[0] === row && lastMove.to[1] === col)) {
                    square.classList.add('last-move');
                }
            }
        }
    }

    updateGameInfo() {
        const currentTurnElement = document.getElementById('current-turn');
        const gameStatusElement = document.getElementById('game-status');

        // Update current player
        const playerName = this.engine.currentPlayer === COLORS.WHITE ? 'White' : 'Black';
        currentTurnElement.textContent = `${playerName} to move`;

        // Update game status
        let statusText = 'Game in progress';
        if (this.engine.gameStatus === 'checkmate') {
            const winner = this.engine.currentPlayer === COLORS.WHITE ? 'Black' : 'White';
            statusText = `Checkmate! ${winner} wins`;
        } else if (this.engine.gameStatus === 'stalemate') {
            statusText = 'Stalemate! Draw';
        } else if (this.engine.gameStatus === 'draw') {
            statusText = 'Draw';
        } else if (this.engine.board.isInCheck(this.engine.currentPlayer)) {
            statusText = `${playerName} is in check`;
        }

        gameStatusElement.textContent = statusText;

        // Update button states
        document.getElementById('undo-btn').disabled = this.engine.moveHistory.length === 0;
    }

    updateMoveList() {
        const moveListElement = document.getElementById('move-list');
        moveListElement.innerHTML = '';

        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i] || '';
            const blackMove = this.moveHistory[i + 1] || '';

            const moveEntry = document.createElement('div');
            moveEntry.classList.add('move-entry');
            moveEntry.textContent = `${moveNumber}. ${whiteMove} ${blackMove}`;
            moveListElement.appendChild(moveEntry);
        }

        // Scroll to bottom
        moveListElement.scrollTop = moveListElement.scrollHeight;
    }

    updateCapturedPieces() {
        const capturedWhite = document.getElementById('captured-white');
        const capturedBlack = document.getElementById('captured-black');

        capturedWhite.innerHTML = '';
        capturedBlack.innerHTML = '';

        // Count captured pieces from move history
        const capturedByBlack = [];
        const capturedByWhite = [];

        this.engine.moveHistory.forEach(moveRecord => {
            if (moveRecord.capturedPiece) {
                if (moveRecord.capturedPiece.color === COLORS.WHITE) {
                    capturedByBlack.push(moveRecord.capturedPiece);
                } else {
                    capturedByWhite.push(moveRecord.capturedPiece);
                }
            }
        });

        // Display captured pieces
        capturedByBlack.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.classList.add('piece', piece.color);
            pieceElement.style.fontSize = '12px';
            pieceElement.style.margin = '2px';
            pieceElement.style.width = '20px';
            pieceElement.style.height = '20px';
            pieceElement.textContent = this.getPieceInitial(piece.type);
            capturedWhite.appendChild(pieceElement);
        });

        capturedByWhite.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.classList.add('piece', piece.color);
            pieceElement.style.fontSize = '12px';
            pieceElement.style.margin = '2px';
            pieceElement.style.width = '20px';
            pieceElement.style.height = '20px';
            pieceElement.textContent = this.getPieceInitial(piece.type);
            capturedBlack.appendChild(pieceElement);
        });
    }

    // Get square coordinates from algebraic notation (e.g., 'e4' -> [4, 4])
    algebraicToCoords(algebraic) {
        const file = algebraic.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
        const rank = 8 - parseInt(algebraic[1]); // '8' = 0, '7' = 1, etc.
        return [rank, file];
    }

    // Convert coordinates to algebraic notation
    coordsToAlgebraic(row, col) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return file + rank;
    }

    // Get piece initial for display
    getPieceInitial(pieceType) {
        const initials = {
            [PIECE_TYPES.KING]: 'K',
            [PIECE_TYPES.QUEEN]: 'Q',
            [PIECE_TYPES.ROOK]: 'R',
            [PIECE_TYPES.BISHOP]: 'B',
            [PIECE_TYPES.KNIGHT]: 'N',
            [PIECE_TYPES.PAWN]: 'P'
        };
        return initials[pieceType] || '?';
    }
}
