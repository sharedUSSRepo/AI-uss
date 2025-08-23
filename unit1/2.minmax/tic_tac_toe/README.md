# Tic-Tac-Toe AI Game

A complete Tic-Tac-Toe game implementation with AI opponents using minimax algorithms.

## Project Structure

The project is modularized into separate files for better organization and maintainability:

### Core Files

- **`index.html`** - Main HTML file with the game interface
- **`style.css`** - CSS styling for the game interface
- **`game.js`** - Main game controller and UI logic

### Algorithm Modules

- **`gameUtils.js`** - Common game utilities and board evaluation functions
- **`minimax.js`** - Standard minimax algorithm implementation
- **`minimaxAlphaBeta.js`** - Minimax with alpha-beta pruning optimization
- **`aiPlayer.js`** - AI player class with difficulty levels

## Features

### AI Difficulty Levels

**Level 1 (Easy)**
- Uses standard minimax algorithm
- Introduces 25% randomness to make suboptimal moves
- Uses softmax probability distribution for more natural "mistakes"

**Level 2 (Hard)**
- Uses minimax with alpha-beta pruning
- Always plays optimally
- More efficient with tree pruning

### Game Features

- ✅ Player can choose X or O
- ✅ Real-time score tracking
- ✅ Visual feedback with winning animations
- ✅ Debug information showing AI decision process
- ✅ Responsive design for mobile and desktop

## Module Descriptions

### `gameUtils.js`
Contains utility functions for:
- Board evaluation and winner detection
- Game state management
- Move validation
- Board representation helpers

### `minimax.js`
Implements the classic minimax algorithm:
- Recursive game tree search
- Move scoring and selection
- Best move calculation

### `minimaxAlphaBeta.js`
Enhanced minimax with optimizations:
- Alpha-beta pruning for efficiency
- Performance statistics tracking
- Reduced search space

### `aiPlayer.js`
AI player implementation:
- Difficulty level management
- Move selection strategies
- Debug information generation
- Randomization for easy mode

## How to Run

1. Open `index.html` in a web browser
2. Select difficulty level and your symbol (X or O)
3. Click "New Game" to start playing
4. Watch the debug information to see AI decision-making

## Technical Details

- **Evaluation Function**: +1 for AI win, -1 for AI loss, 0 for draw
- **Search Depth**: Full game tree (optimal for Tic-Tac-Toe)
- **Pruning**: Alpha-beta pruning in hard mode for efficiency
- **Randomization**: Probabilistic move selection in easy mode

## Code Architecture

The modular design allows for:
- Easy testing of individual algorithms
- Swappable AI implementations
- Clean separation of concerns
- Extensibility for additional difficulty levels or algorithms
