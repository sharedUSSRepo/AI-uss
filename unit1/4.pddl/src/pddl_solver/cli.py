from pathlib import Path
import typer
from .solver import solve_pddl, print_solution

app = typer.Typer(help="PDDL Solver CLI - Solve planning problems using unified-planning")

@app.command()
def solve(
    domain: Path = typer.Argument(..., help="Path to PDDL domain file"),
    problem: Path = typer.Argument(..., help="Path to PDDL problem file")
):
    """Solve a PDDL planning problem"""
    
    if not domain.exists():
        typer.echo(f"❌ Domain file not found: {domain}")
        raise typer.Exit(1)
    
    if not problem.exists():
        typer.echo(f"❌ Problem file not found: {problem}")
        raise typer.Exit(1)
    
    typer.echo(f"🤖 Solving problem with domain: {domain.name}")
    typer.echo(f"📋 Problem file: {problem.name}")
    typer.echo()
    
    success, plan = solve_pddl(domain, problem)
    print_solution(success, plan)

@app.command()
def run_example(
    example: str = typer.Argument("robot-gripper", help="Example name to run")
):
    """Run a predefined example"""
    
    examples_dir = Path("examples") / example
    domain_file = examples_dir / "domain.pddl"
    problem_file = examples_dir / "problem.pddl"
    
    if not examples_dir.exists():
        typer.echo(f"❌ Example '{example}' not found in examples directory")
        available = [p.name for p in Path("examples").iterdir() if p.is_dir()]
        if available:
            typer.echo(f"Available examples: {', '.join(available)}")
        raise typer.Exit(1)
    
    if not domain_file.exists() or not problem_file.exists():
        typer.echo(f"❌ Missing domain.pddl or problem.pddl in {examples_dir}")
        raise typer.Exit(1)
    
    typer.echo(f"🚀 Running example: {example}")
    typer.echo()
    
    success, plan = solve_pddl(domain_file, problem_file)
    print_solution(success, plan)

def main():
    app()

if __name__ == "__main__":
    main()
