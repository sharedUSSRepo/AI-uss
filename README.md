# Police Chase Grid Game

A Pygame-based pathfinding visualization game where a police officer chases a thief through a randomly generated grid world. The thief uses various pathfinding algorithms (A*, BFS, DFS) to collect money bags while avoiding capture.

## Features

- **Three Pathfinding Algorithms**: A* (A-star), Breadth-First Search (BFS), and Depth-First Search (DFS)
- **Dynamic Grid Sizing**: Supports grids from 5x5 up to 1000x1000
- **Adaptive Window Size**: Tile size automatically adjusts to maintain consistent window size
- **Visual Pathfinding**: See explored nodes, frontier, final path, and movement trail (in visual benchmark mode)
- **Maze Validation**: Ensures all money bags are reachable before starting
- **Comprehensive Benchmarking**: Performance testing with CSV export
- **Multiple Game Modes**: Normal gameplay, headless benchmark, and visual benchmark

## Requirements

This project uses [uv](https://github.com/astral-sh/uv) for Python package management.

## Installation

1. Install uv if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Clone the repository:
```bash
git clone https://github.com/SharedUSSRepo/AI-uss
cd AI
```

3. Install dependencies:
```bash
uv sync
```

## Usage

### Main Game (`main.py`)

Run the police chase game with various pathfinding algorithms:

#### Basic Usage
```bash
# Default: A* algorithm on 20x20 grid
uv run python main.py

# Specify algorithm and grid size
uv run python main.py --algorithm bfs --grid 50
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--algorithm` | str | `a_star` | Pathfinding algorithm: `a_star`, `bfs`, or `dfs` |
| `--grid` | int | `20` | Grid size (creates square grid, 5-1000) |
| `--benchmark` | flag | `False` | Headless benchmark mode (no cop, no window) |
| `--visual-benchmark` | flag | `False` | Visual benchmark with pathfinding visualization |

#### Examples

```bash
# Play with DFS algorithm on 30x30 grid
uv run python main.py --algorithm dfs --grid 30

# Benchmark A* algorithm (headless, fast)
uv run python main.py --algorithm a_star --benchmark --grid 100

# Visual benchmark showing pathfinding process
uv run python main.py --algorithm bfs --visual-benchmark --grid 25
```

### Benchmarking (`benchmark.py`)

Run automated performance tests and export results to CSV:

#### Basic Usage
```bash
# Run 10 iterations of A* on 20x20 grid
uv run python benchmark.py --algorithm a_star --iterations 10

# Test different algorithm
uv run python benchmark.py --algorithm bfs --grid 50 --iterations 5
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--algorithm` | str | `a_star` | Algorithm to benchmark: `a_star`, `bfs`, or `dfs` |
| `--grid` | int | `20` | Grid size (5-1000) |
| `--iterations` | int | `2` | Number of test iterations (1-100) |

#### Examples

```bash
# Quick benchmark: 5 iterations of BFS on 20x20
uv run python benchmark.py --algorithm bfs --iterations 5

# Performance test: A* on large grid
uv run python benchmark.py --algorithm a_star --grid 200 --iterations 10

# Compare different algorithms (run separately)
uv run python benchmark.py --algorithm a_star --iterations 20
uv run python benchmark.py --algorithm bfs --iterations 20
uv run python benchmark.py --algorithm dfs --iterations 20
```

## Game Controls

### Normal Game Mode
- **WASD** or **Arrow Keys**: Move the police officer
- **ESC**: Quit game
- **Goal**: Catch the thief before he collects all 5 money bags

### Visual Benchmark Mode
- **ESC**: Quit benchmark
- **Visual Elements**:
  - 🟫 **Dark Gray**: Walls
  - ⬛ **Black**: Empty spaces
  - 🟫 **Light Gray**: Explored nodes (algorithm visited)
  - 🟦 **Blue**: Frontier nodes (algorithm considering)
  - 🟩 **Green**: Final chosen path
  - 🟡 **Yellow**: Money bags
  - 🔴 **Red**: Thief
  - 🔵 **Blue**: Police officer (normal mode only)
  - **Orange Trail**: Thief's movement path (clears when collecting money)

## Output Files

### Benchmark Results
Benchmark runs automatically generate CSV files with performance metrics:

- **Filename**: `benchmark_results_YYYYMMDD_HHMMSS.csv`
- **Location**: Same directory as script
- **Columns**:
  - `algorithm`: Algorithm used (A*, BFS, DFS)
  - `grid_size`: Grid dimensions
  - `iteration`: Test iteration number
  - `expanded_nodes`: Number of nodes explored
  - `time_ms`: Execution time in milliseconds

### Console Output
Both scripts provide real-time feedback:

```
A* Metrics - Expanded nodes: 45, Time: 2.34ms
BFS Metrics - Expanded nodes: 127, Time: 3.67ms
DFS Metrics - Expanded nodes: 89, Time: 1.98ms
```

## Performance Notes

### Grid Size Recommendations

| Grid Size | Use Case | Expected Performance |
|-----------|----------|---------------------|
| 20x20 | Learning/Testing | Very fast (< 5ms) |
| 50x50 | Medium complexity | Fast (< 20ms) |
| 100x100 | Performance testing | Moderate (< 100ms) |
| 500x500 | Stress testing | Slow (seconds) |
| 1000x1000 | Maximum supported | Very slow (minutes) |

### Algorithm Characteristics

- **A* (A-star)**: Usually fastest and most efficient, finds optimal path
- **BFS**: Finds optimal path, explores more nodes than A*
- **DFS**: May find suboptimal path, can be very fast or very slow

## Troubleshooting

### Common Issues

1. **"No path found" warnings**: The maze generator occasionally creates unsolvable puzzles. The game will regenerate automatically.

2. **Performance issues on large grids**: Grids larger than 200x200 may be slow. Start with smaller sizes for testing.

3. **Benchmark hanging**: Very large grids (800x800+) might timeout. The benchmark script includes 60-second timeouts per iteration.

### Dependencies

Required Python packages (automatically managed by uv):
- pygame 2.6.1+
- typer (CLI interface)
- Standard library: csv, subprocess, re, os, datetime

## Development

### Project Structure
```
AI/
├── main.py              # Main game engine
├── benchmark.py         # Benchmarking script  
├── assets/             # Game assets
│   ├── cop.png         # Police officer sprite
│   └── criminal.png    # Thief sprite
├── pyproject.toml      # Project configuration
├── poetry.lock         # Dependency lockfile
└── README.md          # This file
```

### Algorithm Implementation
All pathfinding algorithms include performance monitoring and return:
- Execution time in milliseconds
- Number of nodes explored
- Complete path from start to goal

The algorithms are implemented with proper visualization support, collecting explored nodes, frontier nodes, and the final path for display.
