/**
 * js/ai.js
 * Chess Minimax AI with Alpha-Beta Pruning & Move Ordering
 */

const ChessAI = (() => {
    // Piece weights for evaluation
    const PIECE_VALUES = {
        p: 100,
        r: 500,
        n: 320,
        b: 330,
        q: 900,
        k: 20000
    };

    /**
     * Piece-Square Tables (PST)
     * Heuristics representing positional strength of pieces depending on coordinate.
     * Evaluated from White's perspective (mirrored for Black).
     * Higher is better.
     */
    const PAWN_PST = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ];

    const KNIGHT_PST = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ];

    const BISHOP_PST = [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ];

    const ROOK_PST = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ];

    const QUEEN_PST = [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  5,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ];

    // Middle Game King safety
    const KING_PST_MID = [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ];

    // Endgame active King
    const KING_PST_END = [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ];

    /**
     * Converts coordinate to board index for PST arrays
     * Since chessboard.js goes a8 (0,0) to h1 (7,7), we use standard indices.
     */
    function getPSTValue(pieceType, color, col, row, isEndgame) {
        // If Black, we must mirror the row because PST is specified for White
        const r = color === 'w' ? row : (7 - row);
        const c = col;

        switch (pieceType) {
            case 'p': return PAWN_PST[r][c];
            case 'n': return KNIGHT_PST[r][c];
            case 'b': return BISHOP_PST[r][c];
            case 'r': return ROOK_PST[r][c];
            case 'q': return QUEEN_PST[r][c];
            case 'k': return isEndgame ? KING_PST_END[r][c] : KING_PST_MID[r][c];
            default: return 0;
        }
    }

    /**
     * Checks if board is in endgame (Queens gone, or minor pieces left)
     */
    function checkIfEndgame(boardState) {
        let majorCount = 0;
        let whiteQueen = false;
        let blackQueen = false;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece) {
                    if (piece.type === 'q') {
                        if (piece.color === 'w') whiteQueen = true;
                        else blackQueen = true;
                    } else if (piece.type === 'r' || piece.type === 'b' || piece.type === 'n') {
                        majorCount++;
                    }
                }
            }
        }
        
        // Endgame conditions:
        // 1. Both queens are gone.
        // 2. Each side with a queen has at most one other minor/major piece.
        if (!whiteQueen && !blackQueen) return true;
        if (whiteQueen && !blackQueen && majorCount <= 1) return true;
        if (!whiteQueen && blackQueen && majorCount <= 1) return true;
        return false;
    }

    /**
     * Evaluate board static position. Positive is good for White, Negative is good for Black.
     */
    function evaluateBoard(chessInstance) {
        const board = chessInstance.board();
        const isEndgame = checkIfEndgame(board);
        let totalEvaluation = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    const type = piece.type;
                    const color = piece.color;
                    
                    // Material base value
                    let val = PIECE_VALUES[type];
                    
                    // Positional value from PST
                    val += getPSTValue(type, color, c, r, isEndgame);

                    if (color === 'w') {
                        totalEvaluation += val;
                    } else {
                        totalEvaluation -= val;
                    }
                }
            }
        }

        return totalEvaluation;
    }

    /**
     * Move Ordering for faster Alpha-Beta Pruning (MVV-LVA Heuristics)
     * Checks captures first, then promotions, checks, and rest.
     */
    function orderMoves(chessInstance, movesList) {
        return movesList.map(mv => {
            let score = 0;

            // Capture heuristic: MVV-LVA (Most Valuable Victim, Least Valuable Assault)
            if (mv.captured) {
                const victimVal = PIECE_VALUES[mv.captured] || 0;
                const attackerVal = PIECE_VALUES[mv.piece] || 0;
                score += 10000 + (victimVal * 10) - attackerVal;
            }

            // Promotion heuristic
            if (mv.promotion) {
                score += 8000;
            }

            // Delivers check heuristic
            chessInstance.move(mv);
            if (chessInstance.in_check()) {
                score += 5000;
            }
            chessInstance.undo();

            // Castle bonus
            if (mv.flags.includes('k') || mv.flags.includes('q')) {
                score += 2000;
            }

            return { move: mv, score: score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.move);
    }

    /**
     * Alpha-Beta Minimax search
     */
    let nodesSearched = 0; // count nodes for statistics
    
    function minimax(chessInstance, depth, alpha, beta, isMaximizingPlayer) {
        nodesSearched++;

        // Base cases
        if (depth === 0 || chessInstance.game_over()) {
            return evaluateBoard(chessInstance);
        }

        const rawMoves = chessInstance.moves({ verbose: true });
        // Order moves to cause early alpha-beta cutoffs!
        const legalMoves = orderMoves(chessInstance, rawMoves);

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (let i = 0; i < legalMoves.length; i++) {
                chessInstance.move(legalMoves[i]);
                const score = minimax(chessInstance, depth - 1, alpha, beta, false);
                chessInstance.undo();
                maxEval = Math.max(maxEval, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break; // Prune branch
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < legalMoves.length; i++) {
                chessInstance.move(legalMoves[i]);
                const score = minimax(chessInstance, depth - 1, alpha, beta, true);
                chessInstance.undo();
                minEval = Math.min(minEval, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break; // Prune branch
                }
            }
            return minEval;
        }
    }

    /**
     * Gets the best move for the active color
     * Runs in a non-blocking setTimeout chunk.
     * @param {Object} chessInstance - Chess.js instance
     * @param {number} difficultyLevel - 1 (Easy) to 5 (Professional)
     * @returns {Promise} Resolves with the chosen move object
     */
    function getBestMove(chessInstance, difficultyLevel) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const legalMoves = chessInstance.moves({ verbose: true });
                if (legalMoves.length === 0) {
                    resolve(null);
                    return;
                }

                // 1. EASY (Nível 1): Depth 1 + 35% chance of picking a completely random blunder!
                if (difficultyLevel === 1) {
                    if (Math.random() < 0.35) {
                        const randomIdx = Math.floor(Math.random() * legalMoves.length);
                        resolve(legalMoves[randomIdx]);
                        return;
                    }
                }

                // Map difficulty level to Minimax Search Depth
                // Level 1: depth 1
                // Level 2: depth 2 (Solid beginner)
                // Level 3: depth 3 (Strong amateur)
                // Level 4: depth 4 (Advanced club player)
                // Level 5: depth 4 with deep evaluation + dynamic endgame extension to depth 5 if moves are low!
                let searchDepth = 2;
                if (difficultyLevel === 1) searchDepth = 1;
                else if (difficultyLevel === 2) searchDepth = 2;
                else if (difficultyLevel === 3) searchDepth = 3;
                else if (difficultyLevel >= 4) {
                    searchDepth = 4;
                    // For professional level, check if moves are few (endgame), if so extend depth to 5 for accuracy!
                    if (difficultyLevel === 5 && legalMoves.length <= 12) {
                        searchDepth = 5;
                    }
                }

                const isAIWhite = chessInstance.turn() === 'w';
                let bestMove = null;
                
                // Sort moves before iterating
                const orderedMoves = orderMoves(chessInstance, legalMoves);
                nodesSearched = 0;
                
                const startTime = performance.now();

                if (isAIWhite) {
                    // Maximize
                    let bestScore = -Infinity;
                    for (let i = 0; i < orderedMoves.length; i++) {
                        const mv = orderedMoves[i];
                        chessInstance.move(mv);
                        const score = minimax(chessInstance, searchDepth - 1, -Infinity, Infinity, false);
                        chessInstance.undo();
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = mv;
                        }
                    }
                } else {
                    // Minimize
                    let bestScore = Infinity;
                    for (let i = 0; i < orderedMoves.length; i++) {
                        const mv = orderedMoves[i];
                        chessInstance.move(mv);
                        const score = minimax(chessInstance, searchDepth - 1, -Infinity, Infinity, true);
                        chessInstance.undo();
                        
                        if (score < bestScore) {
                            bestScore = score;
                            bestMove = mv;
                        }
                    }
                }

                const endTime = performance.now();
                console.log(`AI thought: level ${difficultyLevel}, depth ${searchDepth}, nodes: ${nodesSearched}, time: ${(endTime - startTime).toFixed(1)}ms`);

                // Fallback to random if bestMove is still null
                if (!bestMove && legalMoves.length > 0) {
                    bestMove = legalMoves[0];
                }

                resolve(bestMove);
            }, 50); // Small timeout allows browser render thread to refresh loading panel before starting compute
        });
    }

    return {
        getBestMove
    };
})();
