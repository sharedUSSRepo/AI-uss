# Copilot Instructions — Chess Project (pure HTML/CSS/JS)

## Project overview

Build a web chess game (single-page app) implemented with pure HTML, CSS and JavaScript. It must implement **all conventional chess rules** (legal moves, castling, en passant, promotion, stalemate/checkmate, threefold repetition, 50-move rule). The UI should visually resemble modern web chess sites (clean board, piece sprites or SVG, move list, and simple controls).

Primary extra requirement: a configurable AI opponent using **Minimax + alpha-beta pruning** and pluggable heuristics. The research objective is to **compare how different heuristics affect AI effectiveness** (measured by win/draw/loss ratios and other metrics).

---

## Goals & success criteria

- **Functional game**: legal move generation & full rules.
- **Playable UI**: move list, ability to undo/redo, select pieces, highlight legal moves, and basic animations.
- **Configurable AI**: Minimax with alpha-beta, adjustable depth/time, and interchangeable heuristic functions.
- **Evaluation harness**: run tournaments between AIs with different heuristics, collect results, and export metrics (CSV).
- **Research-ready**: clear experiment setup so you can vary heuristics and measure win rates.

---

## Tech stack

- HTML (single `index.html`) — layout + UI controls
- CSS (single `styles.css`) — responsive grid-based design; mimic chess.com aesthetic
- JavaScript (ES6 modules) — core engine, UI glue, AI, experiment runner

No frameworks or build tools required; the game should run by opening `index.html` in a browser.

---

## Suggested repository structure

```
/ (root)
  index.html
  styles.css
  /src
    main.js            # app entry and UI glue
    board.js           # board representation & rules (move generation)
    engine.js          # game state, move application, undo stack
    ai.js              # Minimax + alpha-beta, iterative deepening
    heuristics.js      # collection of heuristic functions (pluggable)
    perft.js           # perft tests to validate move-gen correctness
    ui.js              # DOM rendering, input handling, animations
    experiments.js     # tournament runner + logging
    utils.js           # helper utilities
  /assets
    pieces.svg/png
  README.md
```

---

## Getting started (developer)

1. Clone repository.
2. Open `index.html` in a browser (no server required). Use Live Server if you prefer.
3. Main dev entry: `src/main.js` — it should initialize UI and the game engine.

---

## Core implementation notes — rules & engine

### Board representation
- Use a simple 8x8 array model for clarity (`board[row][col]`), or use a 1D 64-slot array with helper functions.
- Each square stores either `null` or a piece object `{type: 'p','n','b','r','q','k', color: 'w'|'b', moved: boolean}`.

### Move generation & validation
- Separate **pseudo-legal move generation** from **legal move filtering** (filter out moves that leave own king in check).
- Implement castling rules (king/rook unmoved, squares between empty, not moving through check).
- Implement en passant with a `lastMove` record or a `enPassantSquare` state.
- Implement promotion UI: when a pawn reaches the back rank, prompt for promotion piece.

### Game state tracking
- Track move history for undo/redo, FEN-like serializing (optional), fifty-move counter, repetition history (store Zobrist or FEN strings), fullmove counter, halfmove clock.

### Validation tools
- Implement `perft(depth)` to count nodes from start position and compare to known perft numbers for debugging move-gen correctness.

---

## AI: Minimax, alpha-beta & engine integration

### Core AI (src/ai.js)
- Implement **Minimax with alpha-beta pruning**.
- Support both **fixed depth** and **time-limited iterative deepening**.
- Implement **move ordering** (captures first, checks, killer moves) to improve pruning.
- Optional: implement a **transposition table** (simple JS Map keyed by FEN) for caching.

### Interface
- Expose a function `ai.getBestMove(gameState, options)` where `options` include `{depth, timeLimitMs, heuristicId}`.
- `getBestMove` should return `{from, to, promotion}`.

---

## Heuristics (src/heuristics.js)

Design heuristics as pluggable functions that take `(gameState, color)` and return a numeric evaluation (higher = better for white). Keep heuristics composable using weights.

Provide a set of built-in heuristics to test:

1. **Material-only**: classic piece values (P=100, N=320, B=330, R=500, Q=900, K=20000).
2. **Material + Piece-Square Tables**: add PST bonuses for central control and development.
3. **Mobility**: number of legal moves available.
4. **King Safety**: evaluate pawn shield + open-files near king.
5. **Pawn Structure**: doubled, isolated, backward pawns penalties; passed pawn bonuses.
6. **Center Control**: control of central squares (e4,d4,e5,d5).
7. **Tempo / Development**: minor piece development early in the game.

Make it easy to create heuristic combinations and weight them. Example exported config:

```js
{
  id: 'W01',
  name: 'Material + PST',
  weights: { material: 1.0, pst: 0.2 }
}
```

---

## Experiment & evaluation framework (src/experiments.js)

Create a runner that can execute many games automatically between two AI configurations and collect metrics.

Features to include:

- Batch run N games between `heuristicA` and `heuristicB`.
- Option to swap colors to reduce bias.
- Time control or fixed-depth play.
- Logging per-game: moves, result (1-0/0-1/1/2-1 for draw), nodes searched, avg time/move.
- Export results to CSV and JSON (download or save to `localStorage`).

Evaluation metrics:

- **Win/Loss/Draw ratio** for each heuristic.
- **Points** (win=1, draw=0.5, loss=0).
- **Nodes per move**, **average search depth** and **average time per move**.
- Use at least 50–200 games per pair for stable estimates.

Statistical note: report confidence intervals or at least raw counts; larger N improves reliability.

---

## UI requirements (minimal & optional polish)

Minimal:
- Click/tap to select piece and show legal moves.
- Drag-and-drop optional.
- Move list (algebraic notation), captured pieces display.
- Buttons: New Game, Undo, Redo, Flip Board, AI Difficulty (depth/time), Choose heuristic presets, Run Tournament.

Polish (optional):
- Smooth piece animations, move highlighting, animated captures, responsive layout for mobile.
- Game clocks and PGN export.

---

## Testing & validation

- Use `perft` to validate move-gen at low depths against known perft numbers for the initial position.
- Unit tests for special rules: castling availability, en passant capture, promotion, threefold repetition detection.
- Manual sanity-check matches vs. a baseline AI.

---

## Suggested milestones

1. **MVP (Week 1)**: board UI, legal move generation, basic move application, turn switching.
2. **Rules complete (Week 2)**: castling, en passant, promotion, draw rules, perft validated.
3. **Basic AI (Week 3)**: Minimax + alpha-beta, material heuristic, configurable depth.
4. **Heuristics & experiments (Week 4)**: implement heuristic set and experiments runner.
5. **Polish & analysis (Week 5)**: UI polish, run experiments and analyze results, document findings.

---

## Developer guidelines & conventions

- Keep code modular and small ES6 modules.
- Use descriptive names, JSDoc comments for public functions.
- Keep performance in mind: avoid heavy allocations inside the search loop.
- Document any heuristic or parameter you add in `heuristics.js`.

---

## Example commands / dev helpers

- `window.runTournament(config)` — run batch experiments from browser console.
- `window.exportResults()` — download CSV of the last experiment.
- `window.perft(depth)` — run perft from current position.

---

## Issues & templates (short)

Make issue templates for:
- Bug: Move generation error (attach FEN and sequence to reproduce)
- Enhancement: New heuristic or optimization
- Experiment: New comparison request (heuristic A vs B with parameters)


---

## Notes for Copilot (how to help)

When you ask the code assistant (Copilot) for help, request focused tasks such as:
- "Generate move-generation function for bishops and knights (pseudo-legal)."
- "Create Minimax+alpha-beta implementation with iterative deepening scaffold."
- "Add a piece-square table heuristic and example PST values."
- "Write perft function and example output comparison for depth 1–4."

Always request unit tests (or perft checks) after implementing move-generation or rule changes.

---

## Final advice

1. Start simple: get move generation and UI working before optimizing AI. Use perft and small unit tests to ensure correctness. For heuristic experiments, keep parameter sets small and change one variable at a time to draw causal conclusions about effectiveness.
2. Keep the code simple. Good code is better than clever code. Keep in mind that if the code needs to be maintained, clarity is key.
