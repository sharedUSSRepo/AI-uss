/**
 * Chess evaluation heuristics
 * Each heuristic function takes (gameState, color) and returns a numeric evaluation
 * Higher values = better for the given color
 */

import { COLORS, PIECE_TYPES } from './board.js';

// Basic piece values for reference
export const PIECE_VALUES = {
    [PIECE_TYPES.PAWN]: 100,
    [PIECE_TYPES.KNIGHT]: 320,
    [PIECE_TYPES.BISHOP]: 330,
    [PIECE_TYPES.ROOK]: 500,
    [PIECE_TYPES.QUEEN]: 900,
    [PIECE_TYPES.KING]: 20000
};

/**
 * King Safety Heuristic
 * Evaluates how safe the king is based on:
 * - Pawn shield around the king
 * - Open files near the king
 * - King position relative to the center (early vs late game)
 * - Distance from enemy pieces
 */
export function evaluateKingSafety(gameState, color) {
    const board = gameState.board;
    const kingPos = board.findKing(color);
    
    if (!kingPos) return -10000; // King not found = game over
    
    const [kingRow, kingCol] = kingPos;
    let safety = 0;
    
    const breakdown = {
        pawnShield: 0,
        openFiles: 0,
        kingPosition: 0,
        enemyProximity: 0
    };
    
    // 1. Pawn shield evaluation
    breakdown.pawnShield = evaluatePawnShield(board, kingRow, kingCol, color);
    safety += breakdown.pawnShield;
    
    // 2. Open files near king penalty
    const openFilePenalty = evaluateOpenFiles(board, kingCol, color) * 50;
    breakdown.openFiles = -openFilePenalty;
    safety -= openFilePenalty;
    
    // 3. King position safety (avoid center early, prefer safety)
    breakdown.kingPosition = evaluateKingPosition(board, kingRow, kingCol, color);
    safety += breakdown.kingPosition;
    
    // 4. Enemy piece proximity penalty
    const proximityPenalty = evaluateEnemyProximity(board, kingRow, kingCol, color);
    breakdown.enemyProximity = -proximityPenalty;
    safety -= proximityPenalty;
    
    // Store breakdown for debug display
    if (typeof window !== 'undefined' && window.debugInfo) {
        window.debugInfo.lastEvaluation = {
            heuristic: 'King Safety',
            totalScore: safety,
            breakdown: breakdown
        };
    }
    
    return safety;
}

/**
 * Evaluate pawn shield around the king
 */
function evaluatePawnShield(board, kingRow, kingCol, color) {
    let shieldValue = 0;
    const direction = color === COLORS.WHITE ? -1 : 1; // White pawns move up, black down
    
    // Check the three squares in front of the king
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const checkCol = kingCol + colOffset;
        if (checkCol < 0 || checkCol >= 8) continue;
        
        // Check for pawn in front of king (1 and 2 squares ahead)
        for (let rowOffset = 1; rowOffset <= 2; rowOffset++) {
            const checkRow = kingRow + (direction * rowOffset);
            if (checkRow < 0 || checkRow >= 8) continue;
            
            const piece = board.getPiece(checkRow, checkCol);
            if (piece && piece.type === PIECE_TYPES.PAWN && piece.color === color) {
                // Reward pawn shield, more for closer pawns
                shieldValue += rowOffset === 1 ? 30 : 15;
                break; // Found pawn in this column
            }
        }
    }
    
    return shieldValue;
}

/**
 * Evaluate open files near the king (dangerous for enemy rooks/queens)
 */
function evaluateOpenFiles(board, kingCol, color) {
    let openFiles = 0;
    
    // Check king's file and adjacent files
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const checkCol = kingCol + colOffset;
        if (checkCol < 0 || checkCol >= 8) continue;
        
        let hasFriendlyPawn = false;
        
        // Check entire file for friendly pawns
        for (let row = 0; row < 8; row++) {
            const piece = board.getPiece(row, checkCol);
            if (piece && piece.type === PIECE_TYPES.PAWN && piece.color === color) {
                hasFriendlyPawn = true;
                break;
            }
        }
        
        if (!hasFriendlyPawn) {
            openFiles++;
        }
    }
    
    return openFiles;
}

/**
 * Evaluate king position safety
 */
function evaluateKingPosition(board, kingRow, kingCol, color) {
    let positionValue = 0;
    
    // Determine if it's early/mid/late game based on material
    const materialCount = countMaterial(board);
    const isLateGame = materialCount < 20; // Rough estimate
    
    if (isLateGame) {
        // In endgame, king should be active (closer to center)
        const centerDistance = Math.abs(kingRow - 3.5) + Math.abs(kingCol - 3.5);
        positionValue += (7 - centerDistance) * 10;
    } else {
        // In early/mid game, king should stay safe (away from center)
        const cornerDistance = Math.min(
            Math.abs(kingRow - (color === COLORS.WHITE ? 7 : 0)), // Distance from back rank
            Math.abs(kingCol - 0), // Distance from a-file
            Math.abs(kingCol - 7)  // Distance from h-file
        );
        
        // Reward staying near starting area
        if (color === COLORS.WHITE) {
            positionValue += kingRow >= 6 ? 20 : 0; // Stay on back ranks
        } else {
            positionValue += kingRow <= 1 ? 20 : 0;
        }
    }
    
    return positionValue;
}

/**
 * Evaluate enemy piece proximity to king
 */
function evaluateEnemyProximity(board, kingRow, kingCol, color) {
    let proximityPenalty = 0;
    const enemyColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board.getPiece(row, col);
            if (piece && piece.color === enemyColor) {
                const distance = Math.max(Math.abs(row - kingRow), Math.abs(col - kingCol));
                
                // More dangerous pieces get higher weight
                let pieceWeight = 1;
                switch (piece.type) {
                    case PIECE_TYPES.QUEEN: pieceWeight = 4; break;
                    case PIECE_TYPES.ROOK: pieceWeight = 3; break;
                    case PIECE_TYPES.BISHOP: pieceWeight = 2; break;
                    case PIECE_TYPES.KNIGHT: pieceWeight = 2; break;
                    default: pieceWeight = 1;
                }
                
                // Penalty inversely proportional to distance
                if (distance <= 3) {
                    proximityPenalty += pieceWeight * (4 - distance) * 15;
                }
            }
        }
    }
    
    return proximityPenalty;
}

/**
 * Helper function to count total material on board
 */
function countMaterial(board) {
    let total = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board.getPiece(row, col);
            if (piece && piece.type !== PIECE_TYPES.KING) {
                total += PIECE_VALUES[piece.type] / 100; // Normalize to simpler counting
            }
        }
    }
    
    return total;
}

/**
 * Simple material-only heuristic for comparison
 */
export function evaluateMaterial(gameState, color) {
    const board = gameState.board;
    let materialValue = 0;
    const breakdown = {
        ownMaterial: 0,
        enemyMaterial: 0,
        materialAdvantage: 0
    };
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board.getPiece(row, col);
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                if (piece.color === color) {
                    materialValue += value;
                    breakdown.ownMaterial += value;
                } else {
                    materialValue -= value;
                    breakdown.enemyMaterial += value;
                }
            }
        }
    }
    
    breakdown.materialAdvantage = materialValue;
    
    // Add small random factor to avoid identical evaluations
    materialValue += Math.random() * 10 - 5;
    
    // Store breakdown for debug display
    if (typeof window !== 'undefined' && window.debugInfo) {
        window.debugInfo.lastEvaluation = {
            heuristic: 'Material Only',
            totalScore: materialValue,
            breakdown: breakdown
        };
    }
    
    return materialValue;
}

/**
 * Combined heuristic: Material + King Safety
 */
export function evaluateMaterialAndKingSafety(gameState, color) {
    const materialScore = evaluateMaterial(gameState, color);
    const kingSafetyScore = evaluateKingSafety(gameState, color);
    
    // Weight material more heavily than king safety
    const weightedKingSafety = kingSafetyScore * 0.3;
    const totalScore = materialScore + weightedKingSafety;
    
    // Store breakdown for debug display
    if (typeof window !== 'undefined' && window.debugInfo) {
        window.debugInfo.lastEvaluation = {
            heuristic: 'Material + King Safety',
            totalScore: totalScore,
            breakdown: {
                material: materialScore,
                kingSafety: kingSafetyScore,
                weightedKingSafety: weightedKingSafety
            }
        };
    }
    
    return totalScore;
}

// Export available heuristics
export const HEURISTICS = {
    MATERIAL_ONLY: {
        id: 'material',
        name: 'Material Only',
        evaluate: evaluateMaterial
    },
    KING_SAFETY: {
        id: 'king_safety',
        name: 'King Safety',
        evaluate: evaluateKingSafety
    },
    MATERIAL_AND_KING_SAFETY: {
        id: 'material_king',
        name: 'Material + King Safety',
        evaluate: evaluateMaterialAndKingSafety
    }
};
