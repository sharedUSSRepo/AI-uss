# PDDL Solver

A simple PDDL planning problem solver using unified-planning.

## Install

```bash
uv sync
```

## Run

### Run the robot-gripper example:
```bash
uv run pddl-solver run-example robot-gripper
```

### Solve custom PDDL files:
```bash
uv run pddl-solver solve path/to/domain.pddl path/to/problem.pddl
```

## Examples

The `examples/` directory contains sample PDDL problems:
- `robot-gripper/`: Simple robot with gripper picking up an object and placing it in a box
- `impossible-gripper/`: Robot scenario that demonstrates when no solution exists