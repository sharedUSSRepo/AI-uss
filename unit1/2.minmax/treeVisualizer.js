// Tree Visualization for Minimax Algorithm
class MinimaxTreeVisualizer {
    constructor(canvasId, width = 800, height = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        this.tree = null;
        this.nodeRadius = 20;
        this.levelHeight = 100; // Increased from 80
        this.nodeSpacing = 60;  // Increased from 40
        
        // Pan and zoom properties
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.minScale = 0.3;
        this.maxScale = 2;
        
        // Click interaction properties
        this.selectedPath = null;
        this.onNodeClick = null; // Callback for when a node is clicked
        this.showFullTree = false; // Option to show unpruned tree
        this.showNodeValues = true; // Option to show node values
        
        // Colors for different node types
        this.colors = {
            max: '#4CAF50',      // Green for maximizing nodes
            min: '#F44336',      // Red for minimizing nodes
            terminal: '#2196F3', // Blue for terminal nodes
            selected: '#FF9800', // Orange for selected path
            text: '#333',
            line: '#666',
            pathHighlight: '#9C27B0', // Purple for clicked path
            dimmed: 'rgba(128, 128, 128, 0.3)' // Dimmed for unselected nodes
        };
        
        this.initializeControls();
    }
    
    /**
     * Set options for tree display
     */
    setDisplayOptions(showFullTree, showNodeValues) {
        this.showFullTree = showFullTree;
        this.showNodeValues = showNodeValues;
    }
    
    /**
     * Set callback function for node clicks
     */
    setNodeClickCallback(callback) {
        this.onNodeClick = callback;
    }
    
    /**
     * Handle mouse clicks on the canvas
     */
    handleNodeClick(mouseX, mouseY) {
        if (!this.tree) return;
        
        // Convert mouse coordinates to world coordinates
        const worldX = (mouseX - this.canvas.width / 2) / this.scale - this.offsetX;
        const worldY = (mouseY - this.canvas.height / 2) / this.scale - this.offsetY;
        
        // Find the clicked node
        const clickedNode = this.findNodeAt(this.tree, worldX, worldY);
        
        if (clickedNode) {
            // Build the path from root to this node
            const path = this.buildPathToNode(this.tree, clickedNode);
            
            if (path && path.length > 1) {
                this.selectedPath = path;
                
                // Simulate the board state at this node
                const simulatedBoard = this.simulateBoardFromPath(path);
                
                // Call the callback with path and board information
                if (this.onNodeClick) {
                    this.onNodeClick({
                        node: clickedNode,
                        path: path,
                        board: simulatedBoard,
                        moves: this.extractMovesFromPath(path)
                    });
                }
                
                // Redraw with highlighted path
                this.redrawWithSelectedPath();
            }
        }
    }
    
    /**
     * Find node at specific coordinates
     */
    findNodeAt(node, x, y) {
        if (!node) return null;
        
        // Check if click is within this node's radius
        const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (distance <= this.nodeRadius + 5) { // Add 5px tolerance
            return node;
        }
        
        // Recursively check children
        for (let child of node.children) {
            const found = this.findNodeAt(child, x, y);
            if (found) return found;
        }
        
        return null;
    }
    
    /**
     * Build path from root to target node
     */
    buildPathToNode(root, targetNode, currentPath = []) {
        const newPath = [...currentPath, root];
        
        if (root === targetNode) {
            return newPath;
        }
        
        for (let child of root.children) {
            const path = this.buildPathToNode(child, targetNode, newPath);
            if (path) return path;
        }
        
        return null;
    }
    
    /**
     * Simulate board state from a path of moves
     */
    simulateBoardFromPath(path) {
        // Get the initial board from the root
        const initialBoard = [...path[0].board];
        let currentBoard = [...initialBoard];
        
        // Apply moves from the path (skip root node)
        for (let i = 1; i < path.length; i++) {
            const node = path[i];
            if (node.move !== null) {
                const player = node.isMaximizing ? 
                    (this.aiPlayer === 'X' ? 'O' : 'X') : // Previous move was by opponent
                    this.aiPlayer; // Previous move was by AI
                currentBoard[node.move] = player;
            }
        }
        
        return currentBoard;
    }
    
    /**
     * Extract sequence of moves from path
     */
    extractMovesFromPath(path) {
        const moves = [];
        for (let i = 1; i < path.length; i++) {
            if (path[i].move !== null) {
                moves.push({
                    move: path[i].move,
                    player: path[i].isMaximizing ? 
                        (this.aiPlayer === 'X' ? 'O' : 'X') : 
                        this.aiPlayer,
                    isAI: !path[i].isMaximizing
                });
            }
        }
        return moves;
    }
    
    /**
     * Redraw tree with selected path highlighted
     */
    redrawWithSelectedPath() {
        if (this.tree) {
            this.clear();
            this.resetTransform();
            this.applyTransform();
            this.drawTreeWithSelectedPath(this.tree);
            this.resetTransform();
            this.drawLegend();
            this.drawControls();
        }
    }
    
    /**
     * Initialize mouse and touch controls for pan and zoom
     */
    initializeControls() {
        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoom = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoom, mouseX, mouseY);
        });
        
        // Mouse events for panning
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.lastMouseX = e.clientX - rect.left;
            this.lastMouseY = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                this.offsetX += (mouseX - this.lastMouseX) / this.scale;
                this.offsetY += (mouseY - this.lastMouseY) / this.scale;
                
                this.lastMouseX = mouseX;
                this.lastMouseY = mouseY;
                
                this.redraw();
            } else {
                this.canvas.style.cursor = 'grab';
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.isDragging = true;
                const rect = this.canvas.getBoundingClientRect();
                this.lastMouseX = e.touches[0].clientX - rect.left;
                this.lastMouseY = e.touches[0].clientY - rect.top;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const touchY = e.touches[0].clientY - rect.top;
                
                this.offsetX += (touchX - this.lastMouseX) / this.scale;
                this.offsetY += (touchY - this.lastMouseY) / this.scale;
                
                this.lastMouseX = touchX;
                this.lastMouseY = touchY;
                
                this.redraw();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
        });
        
        // Double-click to reset view
        this.canvas.addEventListener('dblclick', () => {
            this.resetView();
        });
        
        // Single click to interact with nodes
        this.canvas.addEventListener('click', (e) => {
            if (!this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                this.handleNodeClick(mouseX, mouseY);
            }
        });
        
        // Set initial cursor
        this.canvas.style.cursor = 'grab';
    }
    
    /**
     * Zoom in or out at a specific point
     */
    zoom(factor, centerX, centerY) {
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor));
        
        if (newScale !== this.scale) {
            // Adjust offset to zoom towards the mouse position
            const worldX = (centerX - this.canvas.width / 2) / this.scale - this.offsetX;
            const worldY = (centerY - this.canvas.height / 2) / this.scale - this.offsetY;
            
            this.scale = newScale;
            
            const newWorldX = (centerX - this.canvas.width / 2) / this.scale - this.offsetX;
            const newWorldY = (centerY - this.canvas.height / 2) / this.scale - this.offsetY;
            
            this.offsetX += newWorldX - worldX;
            this.offsetY += newWorldY - worldY;
            
            this.redraw();
        }
    }
    
    /**
     * Reset view to default position and scale
     */
    resetView() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.redraw();
    }
    
    /**
     * Apply current transformation matrix
     */
    applyTransform() {
        this.ctx.setTransform(
            this.scale, 0, 0, this.scale,
            this.canvas.width / 2 + this.offsetX * this.scale,
            this.canvas.height / 2 + this.offsetY * this.scale
        );
    }
    
    /**
     * Reset transformation matrix
     */
    resetTransform() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    /**
     * Redraw the entire tree with current transformations
     */
    redraw() {
        if (this.tree) {
            this.clear();
            this.resetTransform();
            this.applyTransform();
            if (this.selectedPath && this.selectedPath.length > 0) {
                this.drawTreeWithSelectedPath(this.tree);
            } else {
                this.drawTree(this.tree);
            }
            this.resetTransform();
            this.drawLegend();
            this.drawControls();
        }
    }
    
    /**
     * Draw the complete tree (without path highlighting)
     */
    drawTree(node, parent = null) {
        if (parent) {
            this.drawEdge(parent, node);
        }
        
        this.drawNode(node);
        
        node.children.forEach(child => {
            this.drawTree(child, node);
        });
    }
    
    /**
     * Build and visualize the minimax tree
     * @param {Array} board - Initial board state
     * @param {string} aiPlayer - AI player symbol
     * @param {number} maxDepth - Maximum search depth
     */
    visualizeTree(board, aiPlayer, maxDepth = 3) {
        this.clear();
        
        if (this.showFullTree) {
            // Build tree without pruning (standard minimax)
            this.tree = this.buildTreeNoPruning(board, aiPlayer, 0, maxDepth, true);
        } else {
            // Build tree with alpha-beta pruning
            this.tree = this.buildTree(board, aiPlayer, 0, maxDepth, true);
        }
        
        this.calculatePositions(this.tree, 0, -200, 600);
        this.resetTransform();
        this.applyTransform();
        if (this.selectedPath && this.selectedPath.length > 0) {
            this.drawTreeWithSelectedPath(this.tree);
        } else {
            this.drawTree(this.tree);
        }
        this.resetTransform();
        this.drawLegend();
        this.drawControls();
    }
    
    /**
     * Build the minimax tree structure
     */
    buildTree(board, aiPlayer, depth, maxDepth, isMaximizing, alpha = -Infinity, beta = Infinity, parentMove = null) {
        const node = {
            board: [...board],
            depth: depth,
            isMaximizing: isMaximizing,
            children: [],
            value: null,
            move: parentMove,
            alpha: alpha,
            beta: beta,
            pruned: false,
            isTerminal: false,
            x: 0,
            y: 0,
            id: Math.random().toString(36).substr(2, 9), // Add unique ID for node identification
            prunedBoundValue: false, // Flag to indicate if using alpha/beta bound
            boundType: null, // 'alpha' or 'beta'
            boundValue: null // The bound value used
        };
        
        // Store AI player for later use
        this.aiPlayer = aiPlayer;
        
        // Check if this is a terminal state
        const gameStatus = GameUtils.getGameStatus(board);
        if (gameStatus.type !== 'ongoing') {
            node.isTerminal = true;
            if (gameStatus.type === 'win') {
                node.value = gameStatus.winner === aiPlayer ? 1 : -1;
            } else {
                node.value = 0; // Draw
            }
            return node;
        }
        
        // If we've reached max depth, evaluate the position
        if (depth >= maxDepth) {
            node.value = this.evaluatePosition(board, aiPlayer);
            node.isTerminal = true;
            return node;
        }
        
        // Generate children
        const availableMoves = GameUtils.getEmptyPositions(board);
        let bestValue = isMaximizing ? -Infinity : Infinity;
        let hasUnprunedChildren = false;
        
        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            const newBoard = [...board];
            newBoard[move] = isMaximizing ? aiPlayer : (aiPlayer === 'X' ? 'O' : 'X');
            
            const child = this.buildTree(
                newBoard, 
                aiPlayer, 
                depth + 1, 
                maxDepth, 
                !isMaximizing, 
                alpha, 
                beta, 
                move
            );
            
            node.children.push(child);
            
            if (!child.pruned) {
                hasUnprunedChildren = true;
                if (isMaximizing) {
                    bestValue = Math.max(bestValue, child.value);
                    alpha = Math.max(alpha, bestValue);
                } else {
                    bestValue = Math.min(bestValue, child.value);
                    beta = Math.min(beta, bestValue);
                }
            }
            
            // Alpha-beta pruning
            if (beta <= alpha) {
                // Mark remaining children as pruned
                for (let j = i + 1; j < availableMoves.length; j++) {
                    const prunedMove = availableMoves[j];
                    node.children.push({
                        move: prunedMove,
                        pruned: true,
                        depth: depth + 1,
                        isMaximizing: !isMaximizing,
                        value: null,
                        children: [],
                        x: 0,
                        y: 0
                    });
                }
                break;
            }
        }
        
        // If all children were pruned, we need the actual minimax value for visualization
        // but for the algorithm, we can use the bound. Let's calculate both.
        if (!hasUnprunedChildren && node.children.length > 0) {
            // For the algorithm: use the bound (this is what alpha-beta uses for decisions)
            const algorithmValue = isMaximizing ? alpha : beta;
            
            // For visualization: calculate the actual minimax value
            const actualValue = this.getActualMinimaxValue(board, aiPlayer, depth, maxDepth, isMaximizing);
            
            bestValue = algorithmValue; // Use bound for algorithm correctness
            node.actualValue = actualValue; // Store actual value for display
            node.prunedBoundValue = true;
            node.boundType = isMaximizing ? 'alpha' : 'beta';
            node.boundValue = algorithmValue;
        }
        
        node.value = bestValue;
        return node;
    }
    
    /**
     * Calculate the actual minimax value without pruning (for visualization)
     */
    getActualMinimaxValue(board, aiPlayer, depth, maxDepth, isMaximizing) {
        // Check if this is a terminal state
        const gameStatus = GameUtils.getGameStatus(board);
        if (gameStatus.type !== 'ongoing') {
            if (gameStatus.type === 'win') {
                return gameStatus.winner === aiPlayer ? 1 : -1;
            } else {
                return 0; // Draw
            }
        }
        
        // If we've reached max depth, evaluate the position
        if (depth >= maxDepth) {
            return this.evaluatePosition(board, aiPlayer);
        }
        
        // Standard minimax without pruning
        const availableMoves = GameUtils.getEmptyPositions(board);
        let bestValue = isMaximizing ? -Infinity : Infinity;
        
        for (let move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = isMaximizing ? aiPlayer : (aiPlayer === 'X' ? 'O' : 'X');
            
            const value = this.getActualMinimaxValue(
                newBoard, 
                aiPlayer, 
                depth + 1, 
                maxDepth, 
                !isMaximizing
            );
            
            if (isMaximizing) {
                bestValue = Math.max(bestValue, value);
            } else {
                bestValue = Math.min(bestValue, value);
            }
        }
        
        return bestValue;
    }

    /**
     * Evaluate a board position heuristically    /**
     * Build the minimax tree structure without alpha-beta pruning
     */
    buildTreeNoPruning(board, aiPlayer, depth, maxDepth, isMaximizing, parentMove = null) {
        const node = {
            board: [...board],
            depth: depth,
            isMaximizing: isMaximizing,
            children: [],
            value: null,
            move: parentMove,
            alpha: -Infinity,
            beta: Infinity,
            pruned: false,
            isTerminal: false,
            x: 0,
            y: 0,
            id: Math.random().toString(36).substr(2, 9)
        };
        
        // Store AI player for later use
        this.aiPlayer = aiPlayer;
        
        // Check if this is a terminal state
        const gameStatus = GameUtils.getGameStatus(board);
        if (gameStatus.type !== 'ongoing') {
            node.isTerminal = true;
            if (gameStatus.type === 'win') {
                node.value = gameStatus.winner === aiPlayer ? 1 : -1;
            } else {
                node.value = 0; // Draw
            }
            return node;
        }
        
        // If we've reached max depth, evaluate the position
        if (depth >= maxDepth) {
            node.value = this.evaluatePosition(board, aiPlayer);
            node.isTerminal = true;
            return node;
        }
        
        // Generate ALL children without pruning
        const availableMoves = GameUtils.getEmptyPositions(board);
        let bestValue = isMaximizing ? -Infinity : Infinity;
        
        for (let move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = isMaximizing ? aiPlayer : (aiPlayer === 'X' ? 'O' : 'X');
            
            const child = this.buildTreeNoPruning(
                newBoard, 
                aiPlayer, 
                depth + 1, 
                maxDepth, 
                !isMaximizing, 
                move
            );
            
            node.children.push(child);
            
            if (isMaximizing) {
                bestValue = Math.max(bestValue, child.value);
            } else {
                bestValue = Math.min(bestValue, child.value);
            }
        }
        
        node.value = bestValue;
        return node;
    }
    
    /**
     * Simple position evaluation for non-terminal nodes
     */
    evaluatePosition(board, aiPlayer) {
        // Simple heuristic: count potential winning lines
        const opponent = aiPlayer === 'X' ? 'O' : 'X';
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        let score = 0;
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const line = [board[a], board[b], board[c]];
            
            if (line.filter(cell => cell === aiPlayer).length > 0 && 
                line.filter(cell => cell === opponent).length === 0) {
                score += 0.1;
            } else if (line.filter(cell => cell === opponent).length > 0 && 
                      line.filter(cell => cell === aiPlayer).length === 0) {
                score -= 0.1;
            }
        }
        
        return Math.max(-0.9, Math.min(0.9, score));
    }
    
    /**
     * Calculate positions for all nodes in the tree
     */
    calculatePositions(node, x, y, width) {
        node.x = x;
        node.y = y;
        
        if (node.children.length === 0) {
            return;
        }
        
        const childWidth = width / Math.max(1, node.children.length - 1 || 1);
        const startX = x - width / 2;
        
        node.children.forEach((child, index) => {
            const childX = node.children.length === 1 ? x : startX + index * childWidth;
            const childY = y + this.levelHeight;
            this.calculatePositions(child, childX, childY, width * 0.7); // Reduced from 0.8 to 0.7 for more spacing
        });
    }
    
    /**
     * Draw the complete tree with selected path highlighting
     */
    drawTreeWithSelectedPath(node, parent = null) {
        const isInSelectedPath = this.selectedPath && this.selectedPath.includes(node);
        const isSelectedPathActive = this.selectedPath && this.selectedPath.length > 0;
        
        if (parent) {
            this.drawEdgeWithPath(parent, node, isInSelectedPath, isSelectedPathActive);
        }
        
        this.drawNodeWithPath(node, isInSelectedPath, isSelectedPathActive);
        
        node.children.forEach(child => {
            this.drawTreeWithSelectedPath(child, node);
        });
    }
    
    /**
     * Draw an edge with path highlighting
     */
    drawEdgeWithPath(parent, child, isInPath, hasSelectedPath) {
        if (child.pruned) {
            this.ctx.strokeStyle = '#ccc';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
        } else if (isInPath) {
            this.ctx.strokeStyle = this.colors.pathHighlight;
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([]);
        } else if (hasSelectedPath) {
            this.ctx.strokeStyle = this.colors.dimmed;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([]);
        } else {
            this.ctx.strokeStyle = this.colors.line;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([]);
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(parent.x, parent.y + this.nodeRadius);
        this.ctx.lineTo(child.x, child.y - this.nodeRadius);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    /**
     * Draw a node with path highlighting
     */
    drawNodeWithPath(node, isInPath, hasSelectedPath) {
        let fillColor;
        let strokeColor;
        let textColor;
        
        if (node.pruned) {
            fillColor = '#f0f0f0';
            strokeColor = '#ccc';
            textColor = '#999';
        } else if (isInPath) {
            if (node.isTerminal) {
                fillColor = this.colors.pathHighlight;
            } else if (node.isMaximizing) {
                fillColor = this.colors.max;
            } else {
                fillColor = this.colors.min;
            }
            strokeColor = this.colors.pathHighlight;
            textColor = 'white';
        } else if (hasSelectedPath) {
            if (node.isTerminal) {
                fillColor = this.colors.dimmed;
            } else if (node.isMaximizing) {
                fillColor = this.colors.dimmed;
            } else {
                fillColor = this.colors.dimmed;
            }
            strokeColor = this.colors.dimmed;
            textColor = '#999';
        } else {
            if (node.isTerminal) {
                fillColor = this.colors.terminal;
            } else if (node.isMaximizing) {
                fillColor = this.colors.max;
            } else {
                fillColor = this.colors.min;
            }
            strokeColor = this.colors.line;
            textColor = this.colors.text;
        }
        
        // Draw node circle
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = isInPath ? 3 : 2;
        
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        if (!node.pruned) {
            this.ctx.stroke();
        }
        
        // If this is a node using pruned bound value, add a special indicator
        if (node.prunedBoundValue) {
            this.ctx.strokeStyle = '#9B59B6'; // Purple for bound values
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius + 3, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // Draw node text
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (node.pruned) {
            this.ctx.fillText('✂', node.x, node.y);
        } else {
            let displayValue;
            if (this.showNodeValues) {
                if (node.prunedBoundValue && node.actualValue !== undefined) {
                    // Show actual minimax value for nodes with pruned children
                    displayValue = node.actualValue.toFixed(1);
                } else if (node.prunedBoundValue) {
                    // Show bound information as fallback
                    displayValue = `${node.boundType === 'alpha' ? '≤' : '≥'}${node.boundValue.toFixed(1)}`;
                } else {
                    displayValue = node.value !== null ? node.value.toFixed(1) : '?';
                }
            } else {
                displayValue = node.isTerminal ? 'T' : (node.isMaximizing ? 'MAX' : 'MIN');
            }
            this.ctx.fillText(displayValue, node.x, node.y);
        }
        
        // Draw move label
        if (node.move !== null) {
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = isInPath ? this.colors.pathHighlight : this.colors.text;
            this.ctx.fillText(`m${node.move}`, node.x, node.y - this.nodeRadius - 10);
        }
        
        // Draw node type label
        if (!node.pruned && !node.isTerminal) {
            this.ctx.font = '8px Arial';
            this.ctx.fillText(node.isMaximizing ? 'MAX' : 'MIN', node.x, node.y + this.nodeRadius + 12);
        }
    }
    
    /**
     * Draw an edge between two nodes
     */
    drawEdge(parent, child) {
        this.ctx.strokeStyle = child.pruned ? '#ccc' : this.colors.line;
        this.ctx.lineWidth = child.pruned ? 1 : 2;
        this.ctx.setLineDash(child.pruned ? [5, 5] : []);
        
        this.ctx.beginPath();
        this.ctx.moveTo(parent.x, parent.y + this.nodeRadius);
        this.ctx.lineTo(child.x, child.y - this.nodeRadius);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    /**
     * Draw a single node
     */
    drawNode(node) {
        let fillColor;
        
        if (node.pruned) {
            fillColor = '#f0f0f0';
        } else if (node.isTerminal) {
            fillColor = this.colors.terminal;
        } else if (node.isMaximizing) {
            fillColor = this.colors.max;
        } else {
            fillColor = this.colors.min;
        }
        
        // Draw node circle
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = this.colors.line;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        if (!node.pruned) {
            this.ctx.stroke();
        }
        
        // If this is a node using pruned bound value, add a special indicator
        if (node.prunedBoundValue) {
            this.ctx.strokeStyle = '#9B59B6'; // Purple for bound values
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius + 3, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // Draw node text
        this.ctx.fillStyle = node.pruned ? '#999' : this.colors.text;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (node.pruned) {
            this.ctx.fillText('✂', node.x, node.y);
        } else {
            let displayValue;
            if (this.showNodeValues) {
                if (node.prunedBoundValue && node.actualValue !== undefined) {
                    // Show actual minimax value for nodes with pruned children
                    displayValue = node.actualValue.toFixed(1);
                } else if (node.prunedBoundValue) {
                    // Show bound information as fallback
                    displayValue = `${node.boundType === 'alpha' ? '≤' : '≥'}${node.boundValue.toFixed(1)}`;
                } else {
                    displayValue = node.value !== null ? node.value.toFixed(1) : '?';
                }
            } else {
                displayValue = node.isTerminal ? 'T' : (node.isMaximizing ? 'MAX' : 'MIN');
            }
            this.ctx.fillText(displayValue, node.x, node.y);
        }
        
        // Draw move label
        if (node.move !== null) {
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = this.colors.text;
            this.ctx.fillText(`m${node.move}`, node.x, node.y - this.nodeRadius - 10);
        }
        
        // Draw node type label
        if (!node.pruned && !node.isTerminal) {
            this.ctx.font = '8px Arial';
            this.ctx.fillText(node.isMaximizing ? 'MAX' : 'MIN', node.x, node.y + this.nodeRadius + 12);
        }
    }
    
    /**
     * Draw legend explaining the visualization
     */
    drawLegend() {
        const legendX = 20;
        const legendY = 20;
        const lineHeight = 25;
        
        // Draw legend background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(legendX - 10, legendY - 15, 280, 180);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.strokeRect(legendX - 10, legendY - 15, 280, 180);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = this.colors.text;
        this.ctx.textAlign = 'left';
        
        // Title
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Minimax Tree Legend:', legendX, legendY);
        
        this.ctx.font = '12px Arial';
        
        // MAX nodes
        this.drawLegendItem(legendX, legendY + lineHeight, this.colors.max, 'MAX nodes (AI turn)');
        
        // MIN nodes
        this.drawLegendItem(legendX, legendY + lineHeight * 2, this.colors.min, 'MIN nodes (opponent turn)');
        
        // Terminal nodes
        this.drawLegendItem(legendX, legendY + lineHeight * 3, this.colors.terminal, 'Terminal/evaluated nodes');
        
        // Pruned nodes
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.beginPath();
        this.ctx.arc(legendX + 10, legendY + lineHeight * 4, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.fillStyle = this.colors.text;
        this.ctx.fillText('✂', legendX + 10, legendY + lineHeight * 4);
        this.ctx.fillText(this.showFullTree ? 'No pruning shown' : 'Pruned nodes (α-β)', legendX + 25, legendY + lineHeight * 4);
        
        // Values explanation
        if (this.showNodeValues) {
            this.ctx.fillText('Values: +1 = AI win, -1 = AI loss, 0 = draw', legendX, legendY + lineHeight * 5.5);
        } else {
            this.ctx.fillText('T = Terminal, MAX/MIN = Node type', legendX, legendY + lineHeight * 5.5);
        }
        this.ctx.fillText('m# = move position (0-8)', legendX, legendY + lineHeight * 6.5);
    }
    
    /**
     * Draw control instructions
     */
    drawControls() {
        const controlsX = this.canvas.width - 300;
        const controlsY = 20;
        const lineHeight = 20;
        
        // Draw controls background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(controlsX - 10, controlsY - 10, 290, 140);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.strokeRect(controlsX - 10, controlsY - 10, 290, 140);
        
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = this.colors.text;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Controls:', controlsX, controlsY);
        
        this.ctx.font = '12px Arial';
        this.ctx.fillText('🖱️ Drag to pan', controlsX, controlsY + lineHeight * 1.5);
        this.ctx.fillText('🖱️ Mouse wheel to zoom', controlsX, controlsY + lineHeight * 2.5);
        this.ctx.fillText('🖱️ Double-click to reset view', controlsX, controlsY + lineHeight * 3.5);
        this.ctx.fillText('🖱️ Click node to see path', controlsX, controlsY + lineHeight * 4.5);
        this.ctx.fillText(`📏 Zoom: ${(this.scale * 100).toFixed(0)}%`, controlsX, controlsY + lineHeight * 5.5);
        this.ctx.fillText(`🌳 Mode: ${this.showFullTree ? 'Full Tree' : 'With Pruning'}`, controlsX, controlsY + lineHeight * 6.5);
    }
    
    /**
     * Draw a legend item
     */
    drawLegendItem(x, y, color, text) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.fillText(text, x + 25, y);
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Highlight the best path through the tree
     */
    highlightBestPath(bestMove) {
        if (!this.tree) return;
        
        // Redraw with highlighting
        this.clear();
        this.resetTransform();
        this.applyTransform();
        this.drawTree(this.tree);
        this.findAndHighlightPath(this.tree, bestMove);
        this.resetTransform();
        this.drawLegend();
        this.drawControls();
    }
    
    /**
     * Find and highlight the path to the best move
     */
    findAndHighlightPath(node, bestMove, isRoot = true) {
        if (isRoot && node.children.length > 0) {
            // Find the child that corresponds to the best move
            const bestChild = node.children.find(child => child.move === bestMove);
            if (bestChild) {
                // Apply transform for highlighting
                this.resetTransform();
                this.applyTransform();
                this.highlightNode(node);
                this.highlightNode(bestChild);
                this.highlightEdge(node, bestChild);
                this.resetTransform();
            }
        }
    }
    
    /**
     * Highlight a specific node
     */
    highlightNode(node) {
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius + 2, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    /**
     * Highlight an edge
     */
    highlightEdge(parent, child) {
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 4;
        
        this.ctx.beginPath();
        this.ctx.moveTo(parent.x, parent.y + this.nodeRadius);
        this.ctx.lineTo(child.x, child.y - this.nodeRadius);
        this.ctx.stroke();
    }
}
