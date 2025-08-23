/**
 * Board representation and basic chess logic
 * Using 8x8 array for simplicity
 */

export const PIECE_TYPES = {
    PAWN: 'p',
    KNIGHT: 'n',
    BISHOP: 'b',
    ROOK: 'r',
    QUEEN: 'q',
    KING: 'k'
};

export const COLORS = {
    WHITE: 'w',
    BLACK: 'b'
};

export class Piece {
    constructor(type, color, moved = false) {
        this.type = type;
        this.color = color;
        this.moved = moved;
    }

    clone() {
        return new Piece(this.type, this.color, this.moved);
    }

    toString() {
        return this.color === COLORS.WHITE ? this.type.toUpperCase() : this.type;
    }
}

export class Board {
    constructor() {
        this.squares = Array(8).fill(null).map(() => Array(8).fill(null));
        this.initializeBoard();
    }

    initializeBoard() {
        // Place black pieces
        this.squares[0][0] = new Piece(PIECE_TYPES.ROOK, COLORS.BLACK);
        this.squares[0][1] = new Piece(PIECE_TYPES.KNIGHT, COLORS.BLACK);
        this.squares[0][2] = new Piece(PIECE_TYPES.BISHOP, COLORS.BLACK);
        this.squares[0][3] = new Piece(PIECE_TYPES.QUEEN, COLORS.BLACK);
        this.squares[0][4] = new Piece(PIECE_TYPES.KING, COLORS.BLACK);
        this.squares[0][5] = new Piece(PIECE_TYPES.BISHOP, COLORS.BLACK);
        this.squares[0][6] = new Piece(PIECE_TYPES.KNIGHT, COLORS.BLACK);
        this.squares[0][7] = new Piece(PIECE_TYPES.ROOK, COLORS.BLACK);
        
        for (let col = 0; col < 8; col++) {
            this.squares[1][col] = new Piece(PIECE_TYPES.PAWN, COLORS.BLACK);
        }

        // Place white pieces
        this.squares[7][0] = new Piece(PIECE_TYPES.ROOK, COLORS.WHITE);
        this.squares[7][1] = new Piece(PIECE_TYPES.KNIGHT, COLORS.WHITE);
        this.squares[7][2] = new Piece(PIECE_TYPES.BISHOP, COLORS.WHITE);
        this.squares[7][3] = new Piece(PIECE_TYPES.QUEEN, COLORS.WHITE);
        this.squares[7][4] = new Piece(PIECE_TYPES.KING, COLORS.WHITE);
        this.squares[7][5] = new Piece(PIECE_TYPES.BISHOP, COLORS.WHITE);
        this.squares[7][6] = new Piece(PIECE_TYPES.KNIGHT, COLORS.WHITE);
        this.squares[7][7] = new Piece(PIECE_TYPES.ROOK, COLORS.WHITE);

        for (let col = 0; col < 8; col++) {
            this.squares[6][col] = new Piece(PIECE_TYPES.PAWN, COLORS.WHITE);
        }
    }

    getPiece(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) {
            return null;
        }
        return this.squares[row][col];
    }

    setPiece(row, col, piece) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            this.squares[row][col] = piece;
        }
    }

    isEmpty(row, col) {
        return this.getPiece(row, col) === null;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    clone() {
        const newBoard = new Board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                newBoard.setPiece(row, col, piece ? piece.clone() : null);
            }
        }
        return newBoard;
    }

    // Generate pseudo-legal moves (doesn't check for checks)
    generatePseudoLegalMoves(color) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    moves.push(...this.getPieceMoves(row, col));
                }
            }
        }
        
        return moves;
    }

    getPieceMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        switch (piece.type) {
            case PIECE_TYPES.PAWN:
                return this.getPawnMoves(row, col);
            case PIECE_TYPES.KNIGHT:
                return this.getKnightMoves(row, col);
            case PIECE_TYPES.BISHOP:
                return this.getBishopMoves(row, col);
            case PIECE_TYPES.ROOK:
                return this.getRookMoves(row, col);
            case PIECE_TYPES.QUEEN:
                return this.getQueenMoves(row, col);
            case PIECE_TYPES.KING:
                return this.getKingMoves(row, col);
            default:
                return [];
        }
    }

    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.getPiece(row, col);
        const direction = piece.color === COLORS.WHITE ? -1 : 1;
        const startRow = piece.color === COLORS.WHITE ? 6 : 1;

        // Forward move
        if (this.isEmpty(row + direction, col)) {
            moves.push({ from: [row, col], to: [row + direction, col] });
            
            // Double move from starting position
            if (row === startRow && this.isEmpty(row + 2 * direction, col)) {
                moves.push({ from: [row, col], to: [row + 2 * direction, col] });
            }
        }

        // Captures
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (this.isValidSquare(row + direction, newCol)) {
                const targetPiece = this.getPiece(row + direction, newCol);
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({ from: [row, col], to: [row + direction, newCol] });
                }
            }
        }

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const piece = this.getPiece(row, col);
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [deltaRow, deltaCol] of knightMoves) {
            const newRow = row + deltaRow;
            const newCol = col + deltaCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push({ from: [row, col], to: [newRow, newCol] });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col) {
        return this.getSlidingMoves(row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }

    getRookMoves(row, col) {
        return this.getSlidingMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }

    getQueenMoves(row, col) {
        return this.getSlidingMoves(row, col, [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ]);
    }

    getSlidingMoves(row, col, directions) {
        const moves = [];
        const piece = this.getPiece(row, col);

        for (const [deltaRow, deltaCol] of directions) {
            let newRow = row + deltaRow;
            let newCol = col + deltaCol;

            while (this.isValidSquare(newRow, newCol)) {
                const targetPiece = this.getPiece(newRow, newCol);
                
                if (!targetPiece) {
                    moves.push({ from: [row, col], to: [newRow, newCol] });
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({ from: [row, col], to: [newRow, newCol] });
                    }
                    break; // Can't move past any piece
                }
                
                newRow += deltaRow;
                newCol += deltaCol;
            }
        }

        return moves;
    }

    getKingMoves(row, col) {
        const moves = [];
        const piece = this.getPiece(row, col);
        
        for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
            for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                if (deltaRow === 0 && deltaCol === 0) continue;
                
                const newRow = row + deltaRow;
                const newCol = col + deltaCol;
                
                if (this.isValidSquare(newRow, newCol)) {
                    const targetPiece = this.getPiece(newRow, newCol);
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push({ from: [row, col], to: [newRow, newCol] });
                    }
                }
            }
        }

        return moves;
    }

    // Find king position for a given color
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    // Check if a square is under attack by the opposite color
    isSquareUnderAttack(row, col, attackingColor) {
        const moves = this.generatePseudoLegalMoves(attackingColor);
        return moves.some(move => move.to[0] === row && move.to[1] === col);
    }

    // Check if the given color's king is in check
    isInCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;
        
        const oppositeColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        return this.isSquareUnderAttack(kingPosition[0], kingPosition[1], oppositeColor);
    }
}
