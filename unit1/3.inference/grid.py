class Grid:
    ROWS = 3
    COLS = 3

    # posN = [1. robot, 2. breeze, 3. stinky, 4. pit, 5. wumbus, 6. gold]
    pos1 = [1, 0, 0, 0, 0, 1]
    pos2 = [0, 0, 0, 0, 0, 2]
    pos3 = [0, 0, 0, 0, 0, 3]
    pos4 = [0, 0, 0, 0, 0, 4]
    pos5 = [0, 0, 0, 0, 0, 5]
    pos6 = [0, 0, 0, 0, 0, 6]
    pos7 = [0, 0, 0, 0, 0, 7]
    pos8 = [0, 0, 0, 0, 0, 8]
    pos9 = [0, 0, 0, 0, 0, 9]

    visited = []  # Array with visited tiles

    KB = [
        [pos1, pos2, pos3],
        [pos4, pos5, pos6],
        [pos7, pos8, pos9],
    ]

    def __str__(self):
        """
        Returns a string representation of the grid.
        """
        s = '[\n'
        for i, row in enumerate(self.KB):
            row_strs = []
            for cell in row:
                row_strs.append(str(cell))
            s += '  [' + ', '.join(row_strs) + ']'
            if i != len(self.KB) - 1:
                s += ',\n'
            else:
                s += '\n'
        s += ']'
        return s

    def get_KB(self):
        return self.KB

    def set_KB(self, KB):
        self.KB = KB

    def get_COL(self):
        return self.COLS

    def get_ROW(self):
        return self.ROWS
