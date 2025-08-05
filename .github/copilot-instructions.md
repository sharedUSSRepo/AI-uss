# CoPilot Instructions: Police Chase Grid Game (Pygame)

## Project Overview

This is a Pygame-based game where the player is a police officer chasing a thief within a randomly generated grid world. The grid will include walls placed at initialization. The thief will attempt to collect 5 bags of money placed randomly on the ground using path planning algorithms. If the thief successfully collects all 5 bags, the player loses. If the player catches the thief before that, the player wins. The player (cop) follows the mouse cursor, while the thief AI plans optimal paths toward the bags.

## Responsibilities for GitHub Copilot

Copilot should help with writing and maintaining clean, modular, and extensible Python code based on the following requirements and constraints.

## Technical and Non-Functional Requirements

### NFR1: Core Engine Class

- All environment logic must be encapsulated in a single class, e.g., Playground.
- This includes:
  - Grid creation (based on adjustable size)
  - Wall placement at generation
  - Object placement (cop, thief, money bags)
  - State tracking

### NFR2: World State

- The Playground class must maintain the state of the world in a 2D data structure, like List[List[Tile]] or List[List[str]].
- This structure will later be used by AI search algorithms (e.g., A*, BFS) to determine the thief’s path to each bag of money.

### NFR3: Decoupled Logic

- Rendering logic must be separate from game logic.
- The game state (object positions, grid content) must be handled independently from how they’re drawn.
- This allows algorithms to update the world without needing to render each frame, supporting headless simulations or testing.

### NFR4: Technology

- Use Python 3, Pygame, and Git.
- All code must be:
  - Compatible with Pygame’s rendering loop
  - Modular and well-documented
  - Committed using clear and meaningful messages

## Development Guidelines for Copilot

- Always create functions/methods inside the appropriate class or module.
- Avoid mixing UI rendering with game state logic.
- Favor readable, beginner-friendly Python syntax.
- Write comments or docstrings for key functions and classes.
- Use pygame.Rect, pygame.Surface, etc., appropriately and avoid global state where possible.
