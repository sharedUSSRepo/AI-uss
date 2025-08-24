/**
 * Benchmarking system for AI vs AI games
 * Collects and exports performance data to CSV files
 */

export class BenchmarkLogger {
    constructor() {
        this.gameData = [];
        this.currentGameId = null;
        this.gameStartTime = null;
        this.moveCounter = 0;
    }

    /**
     * Start a new AI vs AI game session
     */
    startGame(whiteHeuristic, blackHeuristic, whiteDepth, blackDepth) {
        this.currentGameId = this.generateGameId();
        this.gameStartTime = Date.now();
        this.moveCounter = 0;
        
        console.log(`Starting benchmark for game ${this.currentGameId}: White(${whiteHeuristic}, depth=${whiteDepth}) vs Black(${blackHeuristic}, depth=${blackDepth})`);
        
        return this.currentGameId;
    }

    /**
     * Log a move made by an AI
     */
    logMove(data) {
        if (!this.currentGameId) {
            console.warn('No active game session for benchmark logging');
            return;
        }

        this.moveCounter++;
        
        const moveData = {
            game_id: this.currentGameId,
            move_number: this.moveCounter,
            timestamp: Date.now(),
            color: data.color,
            heuristic: data.heuristic,
            depth: data.depth,
            chosen_move: data.chosenMove,
            move_candidates: JSON.stringify(data.moveCandidates || []),
            move_scores: JSON.stringify(data.moveScores || {}),
            time_taken_ms: data.timeTaken,
            nodes_searched: data.nodesSearched,
            position_evaluation: data.positionEvaluation,
            game_status: data.gameStatus,
            move_algebraic: data.moveAlgebraic,
            captured_piece: data.capturedPiece || '',
            is_check: data.isCheck || false,
            evaluation_breakdown: JSON.stringify(data.evaluationBreakdown || {}),
            board_fen: data.boardFEN || '',
            material_balance: data.materialBalance || 0
        };

        this.gameData.push(moveData);
        
        console.log(`Logged move ${this.moveCounter} for ${data.color}: ${data.moveAlgebraic} (${data.timeTaken}ms, ${data.nodesSearched} nodes)`);
    }

    /**
     * End the current game session
     */
    endGame(gameResult, totalMoves, gameDuration) {
        if (!this.currentGameId) return;

        console.log(`Ending game ${this.currentGameId}: Result=${gameResult}, Moves=${totalMoves}, Duration=${gameDuration}ms`);
        
        // Add game summary data to the last few moves
        const gameEndData = {
            game_result: gameResult,
            total_moves: totalMoves,
            game_duration_ms: gameDuration,
            game_end_timestamp: Date.now()
        };

        // Add summary to recent moves for context
        this.gameData.slice(-5).forEach(move => {
            Object.assign(move, gameEndData);
        });
        
        this.currentGameId = null;
        this.gameStartTime = null;
    }

    /**
     * Export collected data to CSV
     */
    async exportToCSV() {
        if (this.gameData.length === 0) {
            console.log('No benchmark data to export');
            return null;
        }

        const csvContent = this.generateCSV();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `ai_benchmark_${timestamp}.csv`;
        
        // Create and trigger download
        this.downloadCSV(csvContent, filename);
        
        console.log(`Exported ${this.gameData.length} moves to ${filename}`);
        return filename;
    }

    /**
     * Clear all collected data
     */
    clearData() {
        this.gameData = [];
        this.currentGameId = null;
        this.gameStartTime = null;
        this.moveCounter = 0;
        console.log('Benchmark data cleared');
    }

    /**
     * Get current statistics
     */
    getStats() {
        if (this.gameData.length === 0) return null;

        const games = [...new Set(this.gameData.map(d => d.game_id))];
        const heuristics = [...new Set(this.gameData.map(d => d.heuristic))];
        
        const stats = {
            total_games: games.length,
            total_moves: this.gameData.length,
            unique_heuristics: heuristics,
            avg_time_per_move: this.gameData.reduce((sum, d) => sum + d.time_taken_ms, 0) / this.gameData.length,
            avg_nodes_per_move: this.gameData.reduce((sum, d) => sum + d.nodes_searched, 0) / this.gameData.length
        };

        return stats;
    }

    // Private helper methods
    generateGameId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    generateCSV() {
        if (this.gameData.length === 0) return '';

        // Define CSV headers
        const headers = [
            'game_id', 'move_number', 'timestamp', 'color', 'heuristic', 'depth',
            'chosen_move', 'move_candidates', 'move_scores', 'time_taken_ms', 'nodes_searched',
            'position_evaluation', 'game_status', 'move_algebraic', 'captured_piece',
            'is_check', 'evaluation_breakdown', 'board_fen', 'material_balance',
            'game_result', 'total_moves', 'game_duration_ms', 'game_end_timestamp'
        ];

        // Generate CSV content
        const csvRows = [headers.join(',')];
        
        this.gameData.forEach(row => {
            const csvRow = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                
                // Escape commas and quotes in values
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csvRows.push(csvRow.join(','));
        });

        return csvRows.join('\n');
    }

    downloadCSV(content, filename) {
        // Create blob and download link
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
}

// Create global instance
export const benchmarkLogger = new BenchmarkLogger();

// Make available in window for console access
if (typeof window !== 'undefined') {
    window.benchmarkLogger = benchmarkLogger;
}
