import pygame as pg
import random

TITLE = "Police Chase Grid"
TILES_HORIZONTAL = 20
TILES_VERTICAL = 20
TILE_SIZE = 40
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 800
NUM_MONEY_BAGS = 5


class Cop:
    def __init__(self, surface, playground):
        self.surface = surface
        self.playground = playground
        self.pos = self._generate_random_position()

    def _generate_random_position(self):
        while True:
            row = random.randint(0, TILES_VERTICAL - 1)
            col = random.randint(0, TILES_HORIZONTAL - 1)
            if (
                self.playground.grid[row][col] == 0
                and (row, col) not in self.playground.money_bags
            ):
                return (col * TILE_SIZE + TILE_SIZE // 2, row * TILE_SIZE + TILE_SIZE // 2)

    def draw(self):
        pg.draw.rect(
            self.surface, (0, 0, 255), (self.pos[0] - 20, self.pos[1] - 20, 40, 40)
        )

    def move(self, direction):
        x, y = self.pos
        if direction == "UP":
            y -= TILE_SIZE
        elif direction == "DOWN":
            y += TILE_SIZE
        elif direction == "LEFT":
            x -= TILE_SIZE
        elif direction == "RIGHT":
            x += TILE_SIZE

        grid_x, grid_y = x // TILE_SIZE, y // TILE_SIZE

        # Check for collision with walls
        if 0 <= grid_y < TILES_VERTICAL and 0 <= grid_x < TILES_HORIZONTAL:
            if self.playground.grid[grid_y][grid_x] == 0:  # Not a wall
                self.pos = (x, y)


class Playground:
    def __init__(self, surface):
        self.surface = surface
        self.grid = [[0 for _ in range(TILES_HORIZONTAL)] for _ in range(TILES_VERTICAL)]
        self.walls = []
        self.money_bags = []
        self.generate_walls()
        self.place_money_bags()

    def generate_walls(self):
        for row in range(TILES_VERTICAL):
            for col in range(TILES_HORIZONTAL):
                if random.random() < 0.2:  # 20% chance to place a wall
                    self.grid[row][col] = 1
                    self.walls.append((row, col))

    def place_money_bags(self):
        placed = 0
        while placed < NUM_MONEY_BAGS:
            row = random.randint(0, TILES_VERTICAL - 1)
            col = random.randint(0, TILES_HORIZONTAL - 1)
            if self.grid[row][col] == 0 and (row, col) not in self.money_bags:
                self.money_bags.append((row, col))
                placed += 1

    def draw(self):
        for row in range(TILES_VERTICAL):
            for col in range(TILES_HORIZONTAL):
                color = (40, 40, 40) if self.grid[row][col] == 1 else (0, 0, 0)
                pg.draw.rect(
                    self.surface,
                    color,
                    (col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE),
                )

        # Draw money bags
        for (row, col) in self.money_bags:
            pg.draw.circle(
                self.surface,
                (255, 215, 0),
                (col * TILE_SIZE + TILE_SIZE // 2, row * TILE_SIZE + TILE_SIZE // 2),
                10,
            )


class Thief:
    def __init__(self, surface, playground):
        self.surface = surface
        self.playground = playground
        self.pos = self._generate_random_position()
        self.collected = 0

    def _generate_random_position(self):
        while True:
            row = random.randint(0, TILES_VERTICAL - 1)
            col = random.randint(0, TILES_HORIZONTAL - 1)
            if (
                self.playground.grid[row][col] == 0
                and (row, col) not in self.playground.money_bags
            ):
                return (col * TILE_SIZE + TILE_SIZE // 2, row * TILE_SIZE + TILE_SIZE // 2)

    def draw(self):
        pg.draw.rect(
            self.surface,
            (255, 0, 0),
            (self.pos[0] - 20, self.pos[1] - 20, 40, 40),
        )

    def move_to_bag(self):
        if not self.playground.money_bags:
            return

        # Find the closest money bag
        thief_x, thief_y = self.pos[0] // TILE_SIZE, self.pos[1] // TILE_SIZE
        closest_bag = min(
            self.playground.money_bags,
            key=lambda bag: abs(bag[0] - thief_y) + abs(bag[1] - thief_x),
        )

        # Move one step towards the closest bag
        bag_x, bag_y = closest_bag[1], closest_bag[0]
        if thief_x < bag_x:
            self.move("RIGHT")
        elif thief_x > bag_x:
            self.move("LEFT")
        elif thief_y < bag_y:
            self.move("DOWN")
        elif thief_y > bag_y:
            self.move("UP")

    def move(self, direction):
        x, y = self.pos
        if direction == "UP":
            y -= TILE_SIZE
        elif direction == "DOWN":
            y += TILE_SIZE
        elif direction == "LEFT":
            x -= TILE_SIZE
        elif direction == "RIGHT":
            x += TILE_SIZE

        grid_x, grid_y = x // TILE_SIZE, y // TILE_SIZE

        # Check for collision with walls
        if 0 <= grid_y < TILES_VERTICAL and 0 <= grid_x < TILES_HORIZONTAL:
            if self.playground.grid[grid_y][grid_x] == 0:  # Not a wall
                self.pos = (x, y)

                # Check for collecting a money bag
                if (grid_y, grid_x) in self.playground.money_bags:
                    self.playground.money_bags.remove((grid_y, grid_x))
                    self.collected += 1


class Game:
    def __init__(self):
        pg.init()
        self.clock = pg.time.Clock()
        pg.display.set_caption(TITLE)
        self.surface = pg.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        self.loop = True
        self.playground = Playground(self.surface)

        # Ensure cop and thief do not overlap
        while True:
            self.cop = Cop(self.surface, self.playground)
            self.thief = Thief(self.surface, self.playground)
            if self.cop.pos != self.thief.pos:
                break

    def main(self):
        while self.loop:
            self.grid_loop()
        pg.quit()

    def grid_loop(self):
        self.surface.fill((0, 0, 0))
        self.playground.draw()
        self.thief.draw()
        self.cop.draw()

        for event in pg.event.get():
            if event.type == pg.QUIT:
                self.loop = False
            elif event.type == pg.KEYDOWN:
                if event.key == pg.K_ESCAPE:
                    self.loop = False
                elif event.key in (pg.K_w, pg.K_UP):
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
            print("You lose! The thief collected all the money.")
            self.loop = False
        elif self._cop_catches_thief():
            print("You win! The cop caught the thief.")
            self.loop = False

        pg.display.update()
        self.clock.tick(10)

    def _cop_catches_thief(self):
        cx, cy = self.cop.pos
        tx, ty = self.thief.pos
        return abs(cx - tx) < TILE_SIZE // 2 and abs(cy - ty) < TILE_SIZE // 2


if __name__ == "__main__":
    mygame = Game()
    mygame.main()
