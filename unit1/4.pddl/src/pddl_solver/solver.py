from pathlib import Path
from unified_planning.shortcuts import *
from unified_planning.io import PDDLReader
from unified_planning.engines import PlanGenerationResultStatus

get_environment().credits_stream = None

def solve_pddl(domain_file: Path, problem_file: Path) -> tuple[bool, list]:
    """
    Solve a PDDL problem using unified-planning
    
    Args:
        domain_file: Path to PDDL domain file
        problem_file: Path to PDDL problem file
        
    Returns:
        Tuple of (success: bool, plan: list of actions)
    """
    try:
        reader = PDDLReader()
        problem = reader.parse_problem(domain_file, problem_file)
        
        with OneshotPlanner(problem_kind=problem.kind) as planner:
            result = planner.solve(problem)
            
            if result.status == PlanGenerationResultStatus.SOLVED_SATISFICING:
                plan_actions = []
                for action in result.plan.actions:
                    plan_actions.append(str(action))
                return True, plan_actions
            else:
                return False, []
                
    except Exception as e:
        print(f"Error solving problem: {e}")
        return False, []

def print_solution(success: bool, plan: list):
    """Pretty print the solution"""
    if success:
        print("✅ Solution found!")
        print("\nPlan:")
        for i, action in enumerate(plan, 1):
            print(f"{i}. {action}")
    else:
        print("❌ No solution found")