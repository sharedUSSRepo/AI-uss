/**
 * UI handling - rendering the board, handling user interactions
 */

import { COLORS, PIECE_TYPES } from './board.js';
import { ChessAI } from './ai.js';

export class ChessUI {
    constructor(engine) {
        this.engine = engine;
        this.selectedSquare = null;
        this.highlightedSquares = [];
        this.flipped = false;
        this.moveHistory = [];
        
        // AI integration
        this.ai = new ChessAI();
        this.aiEnabled = true;
        this.aiColor = COLORS.BLACK;
        this.isAIThinking = false;
        
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
            this.isAIThinking = false;
            this.updateUI();
            
            // If AI plays white, make AI move
            if (this.aiEnabled && this.aiColor === COLORS.WHITE) {
                this.makeAIMove();
            }
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            if (this.isAIThinking) return;
            
            const result = this.engine.undoMove();
            if (result.success) {
                if (this.moveHistory.length > 0) {
                    this.moveHistory.pop();
                }
                
                // If playing vs AI, undo AI's move too
                if (this.aiEnabled && this.engine.moveHistory.length > 0) {
                    const secondUndo = this.engine.undoMove();
                    if (secondUndo.success && this.moveHistory.length > 0) {
                        this.moveHistory.pop();
                    }
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

        // AI controls
        document.getElementById('ai-enabled').addEventListener('change', (e) => {
            this.aiEnabled = e.target.checked;
            if (this.aiEnabled && this.engine.currentPlayer === this.aiColor && this.engine.gameStatus === 'playing') {
                this.makeAIMove();
            }
        });

        document.getElementById('ai-color').addEventListener('change', (e) => {
            this.aiColor = e.target.value === 'white' ? COLORS.WHITE : COLORS.BLACK;
            if (this.aiEnabled && this.engine.currentPlayer === this.aiColor && this.engine.gameStatus === 'playing') {
                this.makeAIMove();
            }
        });

        document.getElementById('ai-depth').addEventListener('change', (e) => {
            this.ai.updateSettings({ depth: parseInt(e.target.value) });
        });

        document.getElementById('ai-heuristic').addEventListener('change', (e) => {
            this.ai.updateSettings({ heuristicId: e.target.value });
        });
    }

    handleSquareClick(event) {
        if (this.isAIThinking) return; // Don't allow moves while AI is thinking
        
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
                    
                    // Make AI move if enabled and game is still playing
                    if (this.aiEnabled && this.engine.gameStatus === 'playing' && 
                        this.engine.currentPlayer === this.aiColor) {
                        this.makeAIMove();
                    }
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

    async makeAIMove() {
        if (this.isAIThinking || this.engine.gameStatus !== 'playing') return;
        
        console.log('Making AI move for', this.engine.currentPlayer);
        
        this.isAIThinking = true;
        this.updateGameInfo(); // Show "AI thinking"
        
        try {
            // Use setTimeout to allow UI update before AI calculation
            setTimeout(async () => {
                try {
                    const gameState = this.engine.getGameState();
                    console.log('Game state passed to AI:', {
                        currentPlayer: gameState.currentPlayer,
                        legalMovesCount: gameState.legalMoves.length,
                        gameStatus: gameState.gameStatus
                    });

                    const aiMove = this.ai.getBestMove(gameState);
                    
                    if (aiMove) {
                        console.log('AI selected move:', aiMove);
                        const result = this.engine.makeMove(aiMove.from, aiMove.to);
                        if (result.success) {
                            const algebraic = this.engine.moveToAlgebraic(aiMove, result.capturedPiece);
                            this.moveHistory.push(algebraic);
                            console.log('AI move successful:', algebraic);
                        } else {
                            console.error('AI move failed:', result.error);
                        }
                    } else {
                        console.error('AI returned no move');
                    }
                } catch (innerError) {
                    console.error('Inner AI Error:', innerError);
                }
                
                this.isAIThinking = false;
                this.updateUI();
            }, 100);
        } catch (error) {
            console.error('AI Error:', error);
            this.isAIThinking = false;
            this.updateUI();
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
        this.updateDebugPanel();
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
        
        if (this.isAIThinking) {
            currentTurnElement.textContent = 'AI is thinking...';
        } else if (this.aiEnabled && this.engine.currentPlayer === this.aiColor) {
            currentTurnElement.textContent = `${playerName} (AI) to move`;
        } else {
            currentTurnElement.textContent = `${playerName} to move`;
        }

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
        document.getElementById('undo-btn').disabled = this.engine.moveHistory.length === 0 || this.isAIThinking;
        document.getElementById('new-game-btn').disabled = this.isAIThinking;
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

    // Update the debug panel with AI information
    updateDebugPanel() {
        // Update AI status
        const aiStatusElement = document.getElementById('ai-status');
        if (this.isAIThinking) {
            if (window.debugInfo && window.debugInfo.currentMove) {
                aiStatusElement.textContent = `Analyzing move: ${window.debugInfo.currentMove}`;
            } else {
                aiStatusElement.textContent = 'AI is thinking...';
            }
        } else if (this.aiEnabled && this.engine.currentPlayer === this.aiColor) {
            aiStatusElement.textContent = 'Ready to move';
        } else {
            aiStatusElement.textContent = 'Waiting for human player';
        }

        // Update search stats
        if (window.debugInfo && window.debugInfo.searchStats) {
            const stats = window.debugInfo.searchStats;
            document.getElementById('nodes-searched').textContent = stats.nodesSearched || 0;
            document.getElementById('search-time').textContent = `${stats.timeElapsed || 0}ms`;
            document.getElementById('search-depth').textContent = stats.depth || 0;
        }

        // Update position evaluation for all heuristics
        this.updatePositionEvaluation();

        // Update move analysis
        this.updateMoveAnalysis();

        // Update heuristic breakdown
        this.updateHeuristicBreakdown();
    }

    updatePositionEvaluation() {
        const evaluationElement = document.getElementById('position-evaluation');
        const gameState = this.engine.getGameState();
        
        const heuristics = [
            { id: 'material', name: 'Material', heuristic: window.HEURISTICS?.MATERIAL_ONLY },
            { id: 'king_safety', name: 'King Safety', heuristic: window.HEURISTICS?.KING_SAFETY },
            { id: 'material_king', name: 'Combined', heuristic: window.HEURISTICS?.MATERIAL_AND_KING_SAFETY }
        ];

        let html = '';
        heuristics.forEach(h => {
            if (h.heuristic) {
                try {
                    const whiteScore = h.heuristic.evaluate(gameState, COLORS.WHITE);
                    const blackScore = h.heuristic.evaluate(gameState, COLORS.BLACK);
                    
                    html += `
                        <div class="evaluation-item">
                            <div class="evaluation-label">${h.name}</div>
                            <div class="evaluation-scores">
                                <div class="evaluation-score ${whiteScore > 0 ? 'positive' : 'negative'}">
                                    W: ${whiteScore.toFixed(1)}
                                </div>
                                <div class="evaluation-score ${blackScore > 0 ? 'positive' : 'negative'}">
                                    B: ${blackScore.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    html += `
                        <div class="evaluation-item">
                            <div class="evaluation-label">${h.name}</div>
                            <div class="evaluation-score">Error</div>
                        </div>
                    `;
                }
            }
        });

        evaluationElement.innerHTML = html;
    }

    updateMoveAnalysis() {
        const moveAnalysisElement = document.getElementById('move-analysis');
        
        if (window.debugInfo && window.debugInfo.movesCandidates && window.debugInfo.movesCandidates.length > 0) {
            let html = '';
            const topMoves = window.debugInfo.movesCandidates.slice(0, 5); // Show top 5 moves
            
            topMoves.forEach(candidate => {
                html += `
                    <div class="move-candidate ${candidate.isBest ? 'best' : ''}">
                        <div class="move-notation">${candidate.move}</div>
                        <div class="move-score">${candidate.score.toFixed(1)}</div>
                    </div>
                `;
            });
            
            moveAnalysisElement.innerHTML = html;
        } else {
            moveAnalysisElement.innerHTML = '<div class="debug-info">No move analysis available</div>';
        }
    }

    updateHeuristicBreakdown() {
        const breakdownElement = document.getElementById('heuristic-breakdown');
        
        if (window.debugInfo && window.debugInfo.lastEvaluation) {
            const eval_ = window.debugInfo.lastEvaluation;
            let html = `<div class="heuristic-detail">`;
            html += `<div class="debug-info"><strong>${eval_.heuristic}</strong></div>`;
            html += `<div class="heuristic-component">
                        <span class="heuristic-name">Total Score:</span>
                        <span class="heuristic-value">${eval_.totalScore.toFixed(1)}</span>
                     </div>`;
            
            if (eval_.breakdown) {
                Object.entries(eval_.breakdown).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        html += `
                            <div class="heuristic-component">
                                <span class="heuristic-name">${key}:</span>
                                <span class="heuristic-value">${value.toFixed(1)}</span>
                            </div>
                        `;
                    }
                });
            }
            
            html += `</div>`;
            breakdownElement.innerHTML = html;
        } else {
            breakdownElement.innerHTML = '<div class="debug-info">No heuristic breakdown available</div>';
        }
    }
}
