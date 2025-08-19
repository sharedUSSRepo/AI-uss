// Tic-Tac-Toe AI Game - Main Game Controller
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.difficulty = 1;
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.ai = new AIPlayer(this.aiPlayer, this.difficulty);
        this.scores = { player: 0, ai: 0, draw: 0 };
        this.debugMode = true;
        this.treeVisualizer = null;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
        
        // Initialize tree visualizer after DOM is ready
        setTimeout(() => {
            this.treeVisualizer = new MinimaxTreeVisualizer('treeCanvas', 800, 400);
            
            // Set up node click callback
            this.treeVisualizer.setNodeClickCallback((pathData) => {
                this.showPathPreview(pathData);
            });
            
            // Set initial display options
            const showFullTree = document.getElementById('showFullTree').checked;
            const showNodeValues = document.getElementById('showNodeValues').checked;
            this.treeVisualizer.setDisplayOptions(showFullTree, showNodeValues);
        }, 100);
    }
    
    /**
     * Regenerate tree visualization with current AI result
     */
    regenerateTreeVisualization() {
        if (this.treeVisualizer && this.lastAIResult) {
            this.treeVisualizer.visualizeTree(
                this.lastAIResult.treeData.board, 
                this.lastAIResult.treeData.aiPlayer, 
                3
            );
            
            // Re-highlight the chosen path after a short delay
            setTimeout(() => {
                this.treeVisualizer.highlightBestPath(this.lastAIResult.treeData.bestMove);
            }, 200);
        }
    }
    
    /**
     * Show path preview when a tree node is clicked
     */
    showPathPreview(pathData) {
        const pathPreview = document.getElementById('pathPreview');
        const moveSequence = document.getElementById('moveSequence');
        const boardPreview = document.getElementById('boardPreview');
        
        // Show the preview section
        pathPreview.style.display = 'block';
        
        // Clear previous content
        moveSequence.innerHTML = '';
        boardPreview.innerHTML = '';
        
        // Display move sequence
        if (pathData.moves.length === 0) {
            moveSequence.innerHTML = '<div class="move-item">Root position - no moves yet</div>';
        } else {
            pathData.moves.forEach((move, index) => {
                const moveDiv = document.createElement('div');
                moveDiv.className = `move-item ${move.isAI ? 'ai-move' : 'player-move'}`;
                moveDiv.innerHTML = `
                    <span>${index + 1}. ${move.isAI ? 'AI' : 'Player'} plays ${move.player} at position ${move.move}</span>
                `;
                moveSequence.appendChild(moveDiv);
            });
        }
        
        // Display board preview
        const previewBoard = document.createElement('div');
        previewBoard.className = 'preview-board';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            
            if (pathData.board[i]) {
                cell.textContent = pathData.board[i];
                cell.classList.add(pathData.board[i].toLowerCase());
                
                // Check if this is a move from the selected path
                const isPathMove = pathData.moves.some(move => move.move === i);
                if (!isPathMove && pathData.board[i]) {
                    // This is a move from the original game, dim it
                    cell.classList.add('dim');
                }
            }
            
            previewBoard.appendChild(cell);
        }
        
        boardPreview.appendChild(previewBoard);
        
        // Add node information
        const nodeInfo = document.createElement('div');
        nodeInfo.style.marginTop = '10px';
        nodeInfo.style.fontSize = '12px';
        nodeInfo.style.color = '#666';
        nodeInfo.innerHTML = `
            <strong>Node Value:</strong> ${pathData.node.value !== null ? pathData.node.value.toFixed(2) : 'N/A'}<br>
            <strong>Node Type:</strong> ${pathData.node.isTerminal ? 'Terminal' : (pathData.node.isMaximizing ? 'MAX' : 'MIN')}<br>
            <strong>Depth:</strong> ${pathData.node.depth}
        `;
        boardPreview.appendChild(nodeInfo);
    }
    
    /**
     * Clear the path preview display
     */
    clearPathPreview() {
        const pathPreview = document.getElementById('pathPreview');
        pathPreview.style.display = 'none';
        
        // Clear selected path in tree visualizer
        if (this.treeVisualizer) {
            this.treeVisualizer.selectedPath = null;
            this.treeVisualizer.redraw();
        }
    }
    
    bindEvents() {
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = parseInt(e.target.value);
            this.ai.setDifficulty(this.difficulty);
        });
        document.getElementById('playerSymbol').addEventListener('change', (e) => {
            this.humanPlayer = e.target.value;
            this.aiPlayer = this.humanPlayer === 'X' ? 'O' : 'X';
            this.ai = new AIPlayer(this.aiPlayer, this.difficulty);
        });
        
        document.getElementById('clearPath').addEventListener('click', () => {
            this.clearPathPreview();
        });
        
        // Tree visualization options
        document.getElementById('showFullTree').addEventListener('change', (e) => {
            if (this.treeVisualizer) {
                const showNodeValues = document.getElementById('showNodeValues').checked;
                this.treeVisualizer.setDisplayOptions(e.target.checked, showNodeValues);
                this.regenerateTreeVisualization();
            }
        });
        
        document.getElementById('showNodeValues').addEventListener('change', (e) => {
            if (this.treeVisualizer) {
                const showFullTree = document.getElementById('showFullTree').checked;
                this.treeVisualizer.setDisplayOptions(showFullTree, e.target.checked);
                this.treeVisualizer.redraw();
            }
        });
        
        // Horizontal spacing slider
        document.getElementById('horizontalSpacing').addEventListener('input', (e) => {
            const spacing = parseInt(e.target.value);
            document.getElementById('spacingValue').textContent = spacing + 'px';
            if (this.treeVisualizer) {
                this.treeVisualizer.updateHorizontalSpacing(spacing);
            }
        });
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }
    
    startNewGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.lastAIResult = null; // Clear stored AI result
        this.updateDisplay();
        this.updateGameStatus('Game started! Make your move.');
        
        // Clear any path preview
        this.clearPathPreview();
        
        // If AI goes first, make AI move
        if (this.aiPlayer === 'X') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    handleCellClick(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (!this.gameActive || this.board[index] !== null || this.currentPlayer !== this.humanPlayer) {
            return;
        }
        
        this.makeMove(index, this.humanPlayer);
        
        if (this.gameActive && this.currentPlayer === this.aiPlayer) {
            setTimeout(() => this.makeAIMove(), 300);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateDisplay();
        
        const result = this.checkGameEnd();
        if (result && result.type !== 'ongoing') {
            this.handleGameEnd(result);
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        const aiResult = this.ai.getMove(this.board);
        this.lastAIResult = aiResult; // Store for regenerating tree
        
        // Update debug info
        this.updateDebugInfo(aiResult.debugInfo);
        
        // Visualize the decision tree
        if (this.treeVisualizer && aiResult.treeData) {
            this.treeVisualizer.visualizeTree(
                aiResult.treeData.board, 
                aiResult.treeData.aiPlayer, 
                3 // Max depth for visualization
            );
            
            // Highlight the chosen path after a short delay
            setTimeout(() => {
                this.treeVisualizer.highlightBestPath(aiResult.treeData.bestMove);
            }, 500);
        }
        
        this.makeMove(aiResult.move, this.aiPlayer);
    }
    
    checkGameEnd() {
        return GameUtils.getGameStatus(this.board);
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result.type === 'win') {
            this.highlightWinningCells(result.pattern);
            if (result.winner === this.humanPlayer) {
                this.updateGameStatus('You win! 🎉');
                this.scores.player++;
            } else {
                this.updateGameStatus('AI wins! 🤖');
                this.scores.ai++;
            }
        } else {
            this.updateGameStatus("It's a draw! 🤝");
            this.scores.draw++;
        }
        
        this.updateScoreBoard();
    }
    
    highlightWinningCells(pattern) {
        if (!pattern) return;
        
        pattern.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
    }
    
    updateDisplay() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const value = this.board[index];
            cell.textContent = value || '';
            cell.className = 'cell';
            
            if (value) {
                cell.classList.add(value.toLowerCase());
            }
            
            if (!this.gameActive) {
                cell.classList.add('disabled');
            }
        });
    }
    
    updateGameStatus(message) {
        document.getElementById('gameStatus').textContent = message;
    }
    
    updateScoreBoard() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('drawScore').textContent = this.scores.draw;
    }
    
    updateDebugInfo(info) {
        if (this.debugMode) {
            document.getElementById('debugInfo').textContent = info;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
});
