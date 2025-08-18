// Game Utilities - Common functions for game logic
class GameUtils {
    /**
     * Check if there's a winner on the board
     * @param {Array} board - Current board state
     * @returns {string|null} - Winner symbol or null if no winner
     */
    static checkWinner(board) {
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
    
    /**
     * Check if the board is completely filled
     * @param {Array} board - Current board state
     * @returns {boolean} - True if board is full
     */
    static isBoardFull(board) {
        return board.every(cell => cell !== null);
    }
    
    /**
     * Evaluate the board state for minimax algorithm
     * @param {Array} board - Current board state
     * @param {string} aiPlayer - AI player symbol
     * @returns {number|null} - Score (+1 for AI win, -1 for AI loss, 0 for draw, null for ongoing)
     */
    static evaluateBoard(board, aiPlayer) {
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
    
    /**
     * Get all empty positions on the board
     * @param {Array} board - Current board state
     * @returns {Array} - Array of empty position indices
     */
    static getEmptyPositions(board) {
        const empty = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                empty.push(i);
            }
        }
        return empty;
    }
    
    /**
     * Check if a move is valid
     * @param {Array} board - Current board state
     * @param {number} position - Position to check
     * @returns {boolean} - True if move is valid
     */
    static isValidMove(board, position) {
        return position >= 0 && position < board.length && board[position] === null;
    }
    
    /**
     * Make a copy of the board with a move applied
     * @param {Array} board - Current board state
     * @param {number} position - Position to make move
     * @param {string} player - Player symbol
     * @returns {Array} - New board state with move applied
     */
    static makeMove(board, position, player) {
        if (!this.isValidMove(board, position)) {
            throw new Error(`Invalid move at position ${position}`);
        }
        
        const newBoard = [...board];
        newBoard[position] = player;
        return newBoard;
    }
    
    /**
     * Get the winning pattern if there's a winner
     * @param {Array} board - Current board state
     * @returns {Array|null} - Winning pattern indices or null
     */
    static getWinningPattern(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return pattern;
            }
        }
        
        return null;
    }
    
    /**
     * Get game status
     * @param {Array} board - Current board state
     * @returns {Object} - Game status {type: 'ongoing'|'win'|'draw', winner?: string, pattern?: Array}
     */
    static getGameStatus(board) {
        const winner = this.checkWinner(board);
        
        if (winner) {
            return {
                type: 'win',
                winner: winner,
                pattern: this.getWinningPattern(board)
            };
        } else if (this.isBoardFull(board)) {
            return {
                type: 'draw'
            };
        } else {
            return {
                type: 'ongoing'
            };
        }
    }
    
    /**
     * Convert board position to row/column coordinates
     * @param {number} position - Board position (0-8)
     * @returns {Object} - {row, col} coordinates
     */
    static positionToCoordinates(position) {
        return {
            row: Math.floor(position / 3),
            col: position % 3
        };
    }
    
    /**
     * Convert row/column coordinates to board position
     * @param {number} row - Row (0-2)
     * @param {number} col - Column (0-2)
     * @returns {number} - Board position (0-8)
     */
    static coordinatesToPosition(row, col) {
        return row * 3 + col;
    }
    
    /**
     * Get a string representation of the board for debugging
     * @param {Array} board - Current board state
     * @returns {string} - Formatted board string
     */
    static boardToString(board) {
        let result = '\n';
        for (let i = 0; i < 9; i += 3) {
            result += ` ${board[i] || ' '} | ${board[i+1] || ' '} | ${board[i+2] || ' '} \n`;
            if (i < 6) result += '---|---|---\n';
        }
        return result;
    }
}
