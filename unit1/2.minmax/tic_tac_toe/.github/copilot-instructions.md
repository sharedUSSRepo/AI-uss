## Goal
Implement a complete Tic-Tac-Toe game with two selectable difficulty levels:
Level 1 (easy): Minimax with occasional probabilistic randomization to make sub-optimal moves.
Level 2 (hard): Minimax with alpha–beta pruning for optimal play.
Deliver a small, testable module plus a minimal UI (CLI or web) to play against the AI.

## Scope & Requirements
### Core rules
3×3 board, players X and O (AI can be either).
Detect win, loss, draw.
Legal moves: empty cells only.

## Data model
Board representation: 9-cell list/array or 3×3 matrix.
Players: enum/strings X and O.
State must be immutable in search (create new states on simulate).

## AI levels
Level 1 – Easy
Use standard Minimax evaluation but introduce randomness:
Parameter randomness ∈ [0,1] (default 0.25).

With probability randomness, pick a random move sampled from a probability distribution derived from Minimax scores (e.g., softmax over scores) rather than the best move.

Otherwise, pick the best Minimax move.

Depth: full game tree (Tic-Tac-Toe is small), or stop early if terminal.

Level 2 – Hard

Use Minimax with alpha–beta pruning.

Always return the optimal move (no randomness).

Full-depth search.

## Evaluation
Terminal states: +1 for AI win, −1 for AI loss, 0 for draw
Non-terminal heuristic (optional; not required if full depth):
Count lines where AI can still win minus lines where opponent can still win.

## Tools
The program will run using a simple html, css, and javascript setup. Separate the files if needed.