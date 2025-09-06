from grid import Grid

class Player:
    def __init__(self, grid):
        self.score = 0
        self.player = []
        self.x_pos = 0
        self.y_pos = 0
        self.grid = grid
        self.ROWS = grid.get_ROW()
        self.COLS = grid.get_COL()
        self.KB = []

    def update_KB(self):
        self.KB = self.grid.get_KB()

    def move(self, mov: str):
        """
        Move the robot to a new position.

        Parameters
        ----------
        x : int
            Row index of the cell (0-based). Valid range is 0 .. ROW-1.
        y : int
            Column index of the cell (0-based). Valid range is 0 .. COL-1.

        Returns
        -------
        None
        """

        self.update_KB()

        next_pos = [self.x_pos, self.y_pos] # next pos with current position if all fails
        if ((self.y_pos - 1 >= 0) and mov == "up"): next_pos = (self.x_pos, self.y_pos - 1)
        if (self.x_pos - 1 >= 0) and mov == "left": next_pos = (self.x_pos - 1, self.y_pos)
        if (self.y_pos + 1 < self.ROWS) and mov == "down": next_pos = (self.x_pos, self.y_pos + 1)
        if (self.x_pos + 1 < self.COLS) and mov == "right": next_pos = (self.x_pos + 1, self.y_pos)

        print(next_pos)

        # FIX: the move is ilegal, this still removes the robot from the KB.
        # Leaving no robot.
        self.KB[next_pos[1]][next_pos[0]][0] = 1  # Move the robot to that cell
        self.KB[self.x_pos][self.y_pos][0] = 0 # Clear the current robot cell
        self.x_pos, self.y_pos = next_pos

        self.grid.set_KB(self.KB)
        print(grid)
        # visited.append((x, y))

grid = Grid()
print(grid)

player = Player(grid)
print(player)
player.move("right")

print(grid)
