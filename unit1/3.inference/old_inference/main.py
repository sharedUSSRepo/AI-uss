pos1 = [1, 0, 0, 0, 0, 1] # robot, breeze, stinky, pit, wumbus, gold
pos2 = [0, 0, 0, 0, 0, 2]
pos3 = [0, 0, 0, 0, 0, 3]
pos4 = [0, 0, 0, 0, 0, 4]
pos5 = [0, 0, 0, 0, 0, 5]
pos6 = [0, 0, 0, 0, 0, 6]
pos7 = [0, 0, 0, 0, 0, 7]
pos8 = [0, 0, 0, 0, 0, 8]
pos9 = [0, 0, 0, 0, 0, 9]

ROW = 3
COL = 3

visited = []  # Array with visited tiles

KB = [
    [pos1, pos2, pos3],
    [pos4, pos5, pos6],
    [pos7, pos8, pos9],
]

def move(x: int, y: int, mov: str):
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

    next_pos = [] # Initialize empty array
    if ((y - 1 >= 0) and mov == "up"): next_pos = (x, y-1)
    if (x - 1 >= 0) and mov == "left": next_pos = (x-1, y)
    if (y + 1 < COL) and mov == "down": next_pos = (x, y+1)
    if (x + 1 < ROW) and mov == "right": next_pos = (x+1, y)

    print(next_pos)
    KB[next_pos[1]][next_pos[0]][0] = 1  # Move the robot to that cell
    KB[x][y][0] = 0 # Clear the current robot cell
    visited.append((x, y))

    # print(KB)

def neighbors_coords(x: int, y: int):
    """
    Get the neighboring cells from the knowledge base (KB) for a given coordinate.

    Parameters
    ----------
    x : int
        Row index of the cell (0-based). Valid range is 0 .. ROW-1.
    y : int
        Column index of the cell (0-based). Valid range is 0 .. COL-1.

    Returns
    -------
    list
        A list containing the neighboring cell entries from `KB`. Each entry is
        one of the position lists (e.g. `pos1`, `pos2`, ...). The neighbors are
        appended in the following order if present: Left, Up, Right, Down.
    """

    neighbors = []

    if y - 1 >= 0: neighbors.append((x, y-1)) # Left
    if x - 1 >= 0: neighbors.append((x-1, y)) # Up
    if y + 1 < COL: neighbors.append((x, y+1)) # Right
    if x + 1 < ROW: neighbors.append((x+1, y)) # Down
    return neighbors

# print(neighbors_coords(1, 1))
move(0, 0, 'right')
