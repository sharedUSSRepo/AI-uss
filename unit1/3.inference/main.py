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

def move(x: int, y: int):
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

    KB[x][y][0] = 1  # Mark the cell as visited
    visited.append((x, y))

def explore_neighbors(x: int, y: int):
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

    if not (y-1 < 0): neighbors.append(KB[x][y-1]) # Left
    if not (x-1 < 0): neighbors.append(KB[x-1][y]) # Up
    if not (y+1 >= COL): neighbors.append(KB[x][y+1]) # Right
    if not (x+1 >= ROW): neighbors.append(KB[x+1][y]) # Down

    return neighbors

print(explore_neighbors(1, 1))
