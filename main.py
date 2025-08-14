import pygame as pg
import random
import heapq
import typer
import time

TITLE = "Police Chase Grid"
TARGET_WINDOW_SIZE = 1000  # Target window size in pixels
NUM_MONEY_BAGS = 5

def calculate_tile_size(grid_width, grid_height):
    """Calculate tile size to fit the grid in the target window size."""
    # Use the larger dimension to ensure the window fits
    max_dimension = max(grid_width, grid_height)
    tile_size = TARGET_WINDOW_SIZE // max_dimension
    # Ensure minimum tile size of 1 pixel and maximum of 40 pixels
    return max(1, min(tile_size, 40))


def a_star_search(grid, start, goal, visualization_data=None):
    """Perform A* search to find the shortest path from start to goal."""
    start_time = time.time()
    expanded_nodes = 0
    rows, cols = len(grid), len(grid[0])
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    # Visualization data
    explored = set()
    frontier = set()

    while open_set:
        _, current = heapq.heappop(open_set)
        expanded_nodes += 1
        explored.add(current)
        
        # Update frontier (nodes in open_set)
        frontier = set(item[1] for item in open_set)

        if current == goal:
            end_time = time.time()
            path = reconstruct_path(came_from, current)
            
            # Store visualization data if provided
            if visualization_data is not None:
                visualization_data['explored'] = explored.copy()
                visualization_data['frontier'] = frontier.copy()
                visualization_data['path'] = path.copy()
            
            print(f"A* Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms")
            return path

        for neighbor in get_neighbors(current, rows, cols):
            if grid[neighbor[0]][neighbor[1]] == 1:  # Wall
                continue

            tentative_g_score = g_score[current] + 1

            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                if neighbor not in [item[1] for item in open_set]:
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

    end_time = time.time()
    
    # Store visualization data even if no path found
    if visualization_data is not None:
        visualization_data['explored'] = explored.copy()
        visualization_data['frontier'] = frontier.copy()
        visualization_data['path'] = []
    
    print(f"A* Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms, Path: Not found")
    return []  # No path found


def heuristic(a, b):
    """Heuristic function for A* (Manhattan distance)."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def get_neighbors(pos, rows, cols):
    """Get valid neighbors for a position."""
    neighbors = []
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        r, c = pos[0] + dr, pos[1] + dc
        if 0 <= r < rows and 0 <= c < cols:
            neighbors.append((r, c))
    return neighbors


def reconstruct_path(came_from, current):
    """Reconstruct the path from start to goal."""
    path = []
    while current in came_from:
        path.append(current)
        current = came_from[current]
    path.reverse()
    return path


def bfs_search(grid, start, goal, visualization_data=None):
    """Perform BFS search to find a path from start to goal."""
    from collections import deque
    
    start_time = time.time()
    expanded_nodes = 0
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = set([start])
    came_from = {}
    
    # Visualization data
    explored = set()
    frontier = set(queue)

    while queue:
        current = queue.popleft()
        expanded_nodes += 1
        explored.add(current)
        
        # Update frontier (nodes currently in queue)
        frontier = set(queue)

        if current == goal:
            end_time = time.time()
            path = reconstruct_path(came_from, current)
            
            # Store visualization data if provided
            if visualization_data is not None:
                visualization_data['explored'] = explored.copy()
                visualization_data['frontier'] = frontier.copy()
                visualization_data['path'] = path.copy()
            
            print(f"BFS Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms")
            return path

        for neighbor in get_neighbors(current, rows, cols):
            if grid[neighbor[0]][neighbor[1]] == 1:  # Wall
                continue
            
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                queue.append(neighbor)

    end_time = time.time()
    
    # Store visualization data even if no path found
    if visualization_data is not None:
        visualization_data['explored'] = explored.copy()
        visualization_data['frontier'] = frontier.copy()
        visualization_data['path'] = []
    
    print(f"BFS Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms, Path: Not found")
    return []  # No path found


def dfs_search(grid, start, goal, visualization_data=None):
    """Perform DFS search to find a path from start to goal."""
    start_time = time.time()
    expanded_nodes = 0
    rows, cols = len(grid), len(grid[0])
    stack = [start]
    visited = set([start])
    came_from = {}
    
    # Visualization data
    explored = set()
    frontier = set(stack)

    while stack:
        current = stack.pop()
        expanded_nodes += 1
        explored.add(current)
        
        # Update frontier (nodes currently in stack)
        frontier = set(stack)

        if current == goal:
            end_time = time.time()
            path = reconstruct_path(came_from, current)
            
            # Store visualization data if provided
            if visualization_data is not None:
                visualization_data['explored'] = explored.copy()
                visualization_data['frontier'] = frontier.copy()
                visualization_data['path'] = path.copy()
            
            print(f"DFS Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms")
            return path

        for neighbor in get_neighbors(current, rows, cols):
            if grid[neighbor[0]][neighbor[1]] == 1:  # Wall
                continue
            
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                stack.append(neighbor)

    end_time = time.time()
    
    # Store visualization data even if no path found
    if visualization_data is not None:
        visualization_data['explored'] = explored.copy()
        visualization_data['frontier'] = frontier.copy()
        visualization_data['path'] = []
    
    print(f"DFS Metrics - Expanded nodes: {expanded_nodes}, Time: {(end_time - start_time)*1000:.2f}ms, Path: Not found")
    return []  # No path found


class Cop:
    def __init__(self, surface, playground, grid_width, grid_height, tile_size=40):
        self.surface = surface
        self.playground = playground
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.tile_size = tile_size
        self.pos = self._generate_random_position()
        self.image = pg.image.load("./assets/cop.png")
        self.image = pg.transform.scale(self.image, (self.tile_size, self.tile_size))

    def _generate_random_position(self):
        while True:
            row = random.randint(0, self.grid_height - 1)
            col = random.randint(0, self.grid_width - 1)
            if (
                self.playground.grid[row][col] == 0
                and (row, col) not in self.playground.money_bags
            ):
                return (col * self.tile_size + self.tile_size // 2, row * self.tile_size + self.tile_size // 2)

    def draw(self):
        x, y = self.pos[0] - self.tile_size // 2, self.pos[1] - self.tile_size // 2
        self.surface.blit(self.image, (x, y))

    def move(self, direction):
        x, y = self.pos
        if direction == "UP":
            y -= self.tile_size
        elif direction == "DOWN":
            y += self.tile_size
        elif direction == "LEFT":
            x -= self.tile_size
        elif direction == "RIGHT":
            x += self.tile_size

        grid_x, grid_y = x // self.tile_size, y // self.tile_size

        # Check for collision with walls
        if 0 <= grid_y < self.grid_height and 0 <= grid_x < self.grid_width:
            if self.playground.grid[grid_y][grid_x] == 0:  # Not a wall
                self.pos = (x, y)


class Playground:
    def __init__(self, surface, grid_width, grid_height, benchmark_mode=False, tile_size=40):
        self.surface = surface
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.benchmark_mode = benchmark_mode
        self.tile_size = tile_size
        self.grid = [[0 for _ in range(grid_width)] for _ in range(grid_height)]
        self.walls = []
        self.money_bags = []
        
        # Visualization data for pathfinding
        self.visualization_data = {
            'explored': set(),
            'frontier': set(),
            'path': []
        }
        
        # Trail data for showing thief's actual movement
        self.trail = []  # List of (row, col) positions the thief has visited
        
        self.generate_valid_maze()

    def generate_valid_maze(self):
        """Generate a maze and ensure all money bags are reachable."""
        grid_size = self.grid_width * self.grid_height
        
        # Reduce validation attempts for very large grids to improve performance
        if grid_size >= 1000000:  # 1000x1000 or larger
            max_attempts = 3
        elif grid_size >= 100000:  # 316x316 or larger
            max_attempts = 5
        else:
            max_attempts = 10
            
        for attempt in range(max_attempts):
            # Clear previous state
            self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
            self.walls = []
            self.money_bags = []
            
            # Generate walls and money bags
            self.generate_walls()
            self.place_money_bags()
            
            # Check if maze is solvable
            if self.is_maze_solvable():
                if not self.benchmark_mode:
                    print(f"Valid maze generated on attempt {attempt + 1}")
                break
            elif not self.benchmark_mode:
                print(f"Attempt {attempt + 1}: Maze unsolvable, regenerating...")
        else:
            # If we couldn't generate a valid maze, create a minimal one with no walls
            if not self.benchmark_mode:
                print("Warning: Creating maze with minimal walls to ensure solvability")
            self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
            self.walls = []
            self.money_bags = []
            self.place_money_bags()

    def is_maze_solvable(self):
        """Check if all money bags are reachable using BFS from any valid starting position."""
        if not self.money_bags:
            return True
        
        # Find a valid starting position (any non-wall cell)
        start_pos = None
        for row in range(self.grid_height):
            for col in range(self.grid_width):
                if self.grid[row][col] == 0:  # Not a wall
                    start_pos = (row, col)
                    break
            if start_pos:
                break
        
        if not start_pos:
            return False  # No valid starting position
        
        # Use BFS to check reachability of all money bags
        visited = set()
        queue = [start_pos]
        visited.add(start_pos)
        reachable_bags = set()
        
        while queue:
            current_row, current_col = queue.pop(0)
            
            # Check if current position has a money bag
            if (current_row, current_col) in self.money_bags:
                reachable_bags.add((current_row, current_col))
            
            # Explore neighbors
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                new_row, new_col = current_row + dr, current_col + dc
                
                if (0 <= new_row < self.grid_height and 
                    0 <= new_col < self.grid_width and 
                    (new_row, new_col) not in visited and 
                    self.grid[new_row][new_col] == 0):  # Not a wall
                    
                    visited.add((new_row, new_col))
                    queue.append((new_row, new_col))
        
        # Check if all money bags are reachable
        return len(reachable_bags) == len(self.money_bags)

    def add_to_trail(self, row, col):
        """Add a position to the thief's trail."""
        if hasattr(self, 'show_visualization') and self.show_visualization:
            position = (row, col)
            if position not in self.trail:
                self.trail.append(position)
                # Limit trail length to prevent memory issues and visual clutter
                if len(self.trail) > 100:
                    self.trail.pop(0)
    
    def clear_trail(self):
        """Clear the thief's trail when a coin is collected."""
        if hasattr(self, 'show_visualization') and self.show_visualization:
            self.trail.clear()

    def generate_walls(self):
        # Fixed wall density of 15% for all grid sizes
        for row in range(self.grid_height):
            for col in range(self.grid_width):
                if random.random() < 0.15:  # 15% chance to place a wall
                    self.grid[row][col] = 1
                    self.walls.append((row, col))

    def place_money_bags(self):
        placed = 0
        while placed < NUM_MONEY_BAGS:
            row = random.randint(0, self.grid_height - 1)
            col = random.randint(0, self.grid_width - 1)
            if self.grid[row][col] == 0 and (row, col) not in self.money_bags:
                self.money_bags.append((row, col))
                placed += 1

    def draw(self):
        # First, draw the base grid (walls and empty spaces)
        for row in range(self.grid_height):
            for col in range(self.grid_width):
                color = (40, 40, 40) if self.grid[row][col] == 1 else (0, 0, 0)  # Walls or empty
                
                # Only show visualization in visual benchmark mode
                if self.benchmark_mode and hasattr(self, 'show_visualization') and self.show_visualization:
                    # Check if this cell is part of the visualization
                    if (row, col) in self.visualization_data.get('explored', set()):
                        color = (80, 80, 80)  # Light gray for explored nodes
                    elif (row, col) in self.visualization_data.get('frontier', set()):
                        color = (0, 100, 200)  # Blue for frontier nodes
                    elif (row, col) in [(p[0], p[1]) for p in self.visualization_data.get('path', [])]:
                        color = (0, 200, 0)  # Green for final path
                    
                    # Show thief's trail (actual movement path)
                    if (row, col) in self.trail:
                        # Create a gradient effect for the trail (newer positions are brighter)
                        trail_index = self.trail.index((row, col))
                        trail_intensity = min(255, 100 + (trail_index * 10))  # Fade from dark to bright
                        color = (trail_intensity, trail_intensity // 2, 0)  # Orange trail
                    
                    # Keep walls darker
                    if self.grid[row][col] == 1:
                        color = (40, 40, 40)  # Dark gray for walls
                
                pg.draw.rect(
                    self.surface,
                    color,
                    (col * self.tile_size, row * self.tile_size, self.tile_size, self.tile_size),
                )

        # Draw money bags on top
        for (row, col) in self.money_bags:
            pg.draw.circle(
                self.surface,
                (255, 215, 0),  # Gold color for money bags
                (col * self.tile_size + self.tile_size // 2, row * self.tile_size + self.tile_size // 2),
                max(5, self.tile_size // 4),  # Scale circle size with tile size
            )


class Thief:
    def __init__(self, surface, playground, algorithm="a_star", grid_width=20, grid_height=20, tile_size=40):
        self.surface = surface
        self.playground = playground
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.tile_size = tile_size
        self.pos = self._generate_random_position()
        self.collected = 0
        self.path = []
        self.image = pg.image.load("./assets/criminal.png")
        self.image = pg.transform.scale(self.image, (self.tile_size, self.tile_size))
        self.move_counter = 0  # Counter to control movement speed
        self.algorithm = algorithm

    def _generate_random_position(self):
        while True:
            row = random.randint(0, self.grid_height - 1)
            col = random.randint(0, self.grid_width - 1)
            if (
                self.playground.grid[row][col] == 0
                and (row, col) not in self.playground.money_bags
            ):
                # Add starting position to trail
                self.playground.add_to_trail(row, col)
                return (col * self.tile_size + self.tile_size // 2, row * self.tile_size + self.tile_size // 2)

    def draw(self):
        x, y = self.pos[0] - self.tile_size // 2, self.pos[1] - self.tile_size // 2
        self.surface.blit(self.image, (x, y))

    def move_to_bag(self):
        if not self.playground.money_bags:
            return

        # In benchmark mode, move every frame for faster execution
        if self.playground.benchmark_mode:
            pass  # Move every frame in benchmark mode
        else:
            # Normal game mode: move only on every second frame
            self.move_counter += 1
            if self.move_counter % 2 != 0:
                return

        thief_x, thief_y = self.pos[0] // self.tile_size, self.pos[1] // self.tile_size

        if not self.path:
            # Find the closest money bag
            closest_bag = min(
                self.playground.money_bags,
                key=lambda bag: abs(bag[0] - thief_y) + abs(bag[1] - thief_x),
            )
            
            # Only collect visualization data in visual benchmark mode
            visualization_data = None
            if hasattr(self.playground, 'show_visualization') and self.playground.show_visualization:
                # Clear previous visualization data
                self.playground.visualization_data = {'explored': set(), 'frontier': set(), 'path': []}
                visualization_data = self.playground.visualization_data
            
            if self.algorithm == "a_star":
                self.path = a_star_search(
                    self.playground.grid, (thief_y, thief_x), closest_bag, visualization_data
                )
            elif self.algorithm == "dfs":
                self.path = dfs_search(
                    self.playground.grid, (thief_y, thief_x), closest_bag, visualization_data
                )
            else:  # Default to BFS
                self.path = bfs_search(
                    self.playground.grid, (thief_y, thief_x), closest_bag, visualization_data
                )
            
            # If no path is found to the closest bag, try other bags
            if not self.path:
                # Try all other money bags to see if any are reachable
                for bag in self.playground.money_bags:
                    if bag == closest_bag:
                        continue  # Already tried this one
                    
                    # Only collect visualization data in visual benchmark mode
                    if hasattr(self.playground, 'show_visualization') and self.playground.show_visualization:
                        # Clear previous visualization data for retry
                        self.playground.visualization_data = {'explored': set(), 'frontier': set(), 'path': []}
                        visualization_data = self.playground.visualization_data
                    else:
                        visualization_data = None
                    
                    if self.algorithm == "a_star":
                        alternate_path = a_star_search(
                            self.playground.grid, (thief_y, thief_x), bag, visualization_data
                        )
                    elif self.algorithm == "dfs":
                        alternate_path = dfs_search(
                            self.playground.grid, (thief_y, thief_x), bag, visualization_data
                        )
                    else:  # Default to BFS
                        alternate_path = bfs_search(
                            self.playground.grid, (thief_y, thief_x), bag, visualization_data
                        )
                    
                    if alternate_path:
                        self.path = alternate_path
                        break
                
                # If still no path found to any bag, the game is unsolvable
                if not self.path:
                    print("WARNING: No path found to any money bag! Game is unsolvable.")
                    print("This could happen if:")
                    print("- Thief is completely surrounded by walls")
                    print("- All money bags are unreachable")
                    print("- Grid generation created an unsolvable maze")
                    # Force end the game by declaring the thief can't continue
                    self.playground.money_bags.clear()
                    return

        if self.path:
            next_step = self.path.pop(0)
            self.pos = (
                next_step[1] * self.tile_size + self.tile_size // 2,
                next_step[0] * self.tile_size + self.tile_size // 2,
            )
            
            # Add current position to trail for visualization
            self.playground.add_to_trail(next_step[0], next_step[1])

            # Check for collecting a money bag
            if next_step in self.playground.money_bags:
                self.playground.money_bags.remove(next_step)
                self.collected += 1
                # Clear the trail when a coin is collected
                self.playground.clear_trail()
                # Also clear the path visualization for the next search
                if hasattr(self.playground, 'show_visualization') and self.playground.show_visualization:
                    self.playground.visualization_data = {'explored': set(), 'frontier': set(), 'path': []}


class Game:
    def __init__(self, algorithm="a_star", grid_width=20, grid_height=20, benchmark=False, visual_benchmark=False, seed=None):
        # Set random seed if provided before any pygame initialization
        if seed is not None:
            random.seed(seed)
            
        pg.init()
        self.clock = pg.time.Clock()
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.benchmark = benchmark
        self.visual_benchmark = visual_benchmark
        
        # Calculate dynamic tile size
        self.tile_size = calculate_tile_size(grid_width, grid_height)
        
        if self.benchmark and not self.visual_benchmark:
            # In benchmark mode, create a minimal display
            pg.display.set_mode((1, 1))
            pg.display.set_caption("Benchmark Mode - Hidden")
        else:
            # Normal mode or visual benchmark with full display
            window_width = grid_width * self.tile_size
            window_height = grid_height * self.tile_size
            self.surface = pg.display.set_mode((window_width, window_height))
            if self.visual_benchmark:
                pg.display.set_caption("Visual Benchmark Mode")
            else:
                pg.display.set_caption(TITLE)
        
        self.loop = True
        
        # Use surface for playground if we're showing visuals
        surface_for_playground = None if (benchmark and not visual_benchmark) else self.surface
        self.playground = Playground(surface_for_playground, grid_width, grid_height, benchmark, self.tile_size)
        
        # Enable visualization only in visual benchmark mode
        if visual_benchmark:
            self.playground.show_visualization = True

        # Ensure cop and thief do not overlap (skip cop in benchmark mode)
        if self.benchmark:
            self.cop = None
            thief_surface = None if not self.visual_benchmark else self.surface
            self.thief = Thief(thief_surface, self.playground, algorithm, grid_width, grid_height, self.tile_size)
        else:
            while True:
                self.cop = Cop(self.surface, self.playground, grid_width, grid_height, self.tile_size)
                self.thief = Thief(self.surface, self.playground, algorithm, grid_width, grid_height, self.tile_size)
                if self.cop.pos != self.thief.pos:
                    break

    def main(self):
        while self.loop:
            self.grid_loop()
        pg.quit()

    def grid_loop(self):
        # Render graphics in normal mode or visual benchmark mode
        if not self.benchmark or self.visual_benchmark:
            self.surface.fill((0, 0, 0))
            self.playground.draw()
            self.thief.draw()
            if self.cop:  # Only draw cop if it exists (not in benchmark mode)
                self.cop.draw()

        for event in pg.event.get():
            if event.type == pg.QUIT:
                self.loop = False
            elif event.type == pg.KEYDOWN:
                if event.key == pg.K_ESCAPE:
                    self.loop = False
                # Only handle cop movement if not in benchmark mode
                elif not self.benchmark:
                    if event.key in (pg.K_w, pg.K_UP):
                        self.cop.move("UP")
                    elif event.key in (pg.K_s, pg.K_DOWN):
                        self.cop.move("DOWN")
                    elif event.key in (pg.K_a, pg.K_LEFT):
                        self.cop.move("LEFT")
                    elif event.key in (pg.K_d, pg.K_RIGHT):
                        self.cop.move("RIGHT")

        # Thief moves towards the closest money bag
        self.thief.move_to_bag()

        # Win/Loss condition
        if self.thief.collected >= NUM_MONEY_BAGS:
            if self.benchmark:
                print("Benchmark complete! The thief collected all the money.")
            else:
                print("You lose! The thief collected all the money.")
            self.loop = False
        elif not self.benchmark and self._cop_catches_thief():
            print("You win! The cop caught the thief.")
            self.loop = False

        # Update display and frame rate based on mode
        if not self.benchmark:
            # Normal game mode
            pg.display.update()
            self.clock.tick(10)  # Normal game speed: 10 FPS
        elif self.visual_benchmark:
            # Visual benchmark mode - slower than headless but visible
            pg.display.update()
            self.clock.tick(60)  # Fast but visible: 60 FPS
        else:
            # Headless benchmark mode - ultra fast
            self.clock.tick(0)  # Run as fast as possible
            self.clock.tick(0)  # Run as fast as possible

    def _cop_catches_thief(self):
        if self.benchmark or self.cop is None:
            return False
        cx, cy = self.cop.pos
        tx, ty = self.thief.pos
        return abs(cx - tx) < self.tile_size // 2 and abs(cy - ty) < self.tile_size // 2


def main(
    algorithm: str = typer.Option("a_star", help="Pathfinding algorithm to use: 'bfs', 'dfs', or 'a_star'"),
    grid: int = typer.Option(20, help="Grid size (creates a square grid of grid x grid)"),
    benchmark: bool = typer.Option(False, help="Benchmark mode - disables cop spawning for pure pathfinding testing"),
    visual_benchmark: bool = typer.Option(False, help="Visual benchmark mode - shows window during benchmark"),
    seed: int = typer.Option(None, help="Random seed for reproducible map generation (optional)")
):
    """Police Chase Grid Game - Choose pathfinding algorithm and grid size for the game."""
    if algorithm not in ["bfs", "dfs", "a_star"]:
        typer.echo(f"Error: Invalid algorithm '{algorithm}'. Choose 'bfs', 'dfs', or 'a_star'.")
        raise typer.Exit(1)
    
    if grid < 5:
        typer.echo("Error: Grid size must be at least 5.")
        raise typer.Exit(1)
    
    if grid > 1000:
        typer.echo("Error: Grid size must be at most 1000.")
        raise typer.Exit(1)
    
    # Set random seed if provided
    if seed is not None:
        random.seed(seed)
        if not benchmark:
            typer.echo(f"Using random seed: {seed}")
    
    # If visual_benchmark is True, also enable benchmark mode
    if visual_benchmark:
        benchmark = True
        typer.echo(f"Starting VISUAL BENCHMARK mode with {algorithm.upper()} algorithm on a {grid}x{grid} grid...")
        typer.echo("Note: Cop is disabled. Window will show thief pathfinding.")
    elif benchmark:
        typer.echo(f"Starting BENCHMARK mode with {algorithm.upper()} algorithm on a {grid}x{grid} grid...")
        typer.echo("Note: Cop is disabled. Only thief pathfinding will be tested.")
    else:
        typer.echo(f"Starting game with {algorithm.upper()} algorithm on a {grid}x{grid} grid...")
    
    mygame = Game(algorithm, grid, grid, benchmark, visual_benchmark, seed)
    mygame.main()


if __name__ == "__main__":
    typer.run(main)
