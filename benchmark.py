#!/usr/bin/env python3
"""
Benchmark script for testing pathfinding algorithms in the Police Chase Grid Game.

This script runs the game in benchmark mode multiple times with predefined parameters
and saves all metrics to a CSV file for analysis.
"""

import subprocess
import sys
import csv
import re
import os
import json
import typer
from datetime import datetime

def load_benchmark_seeds():
    """Load the predefined seeds from the JSON file."""
    try:
        with open("benchmark_seeds.json", "r") as f:
            data = json.load(f)
            seeds = data["seeds"]
            print(f"Loaded {len(seeds)} benchmark seeds from benchmark_seeds.json")
            return seeds
    except FileNotFoundError:
        print("ERROR: benchmark_seeds.json file not found!")
        print("Please ensure benchmark_seeds.json is in the same directory as this script.")
        return None
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in benchmark_seeds.json: {e}")
        return None
    except KeyError:
        print("ERROR: benchmark_seeds.json must contain a 'seeds' array")
        return None

def parse_metrics_from_output(output):
    """Parse algorithm metrics from the game output."""
    metrics = []
    # Updated pattern to handle A* correctly (escape the asterisk)
    pattern = r'(A\*|BFS|DFS) Metrics - Expanded nodes: (\d+), Time: ([\d.]+)ms'
    
    print(f"    Parsing output: {repr(output)}")
    
    for line in output.split('\n'):
        line = line.strip()
        if 'Metrics' in line:
            print(f"    Found metrics line: {line}")
            match = re.search(pattern, line)
            if match:
                algorithm = match.group(1)
                expanded_nodes = int(match.group(2))
                time_ms = float(match.group(3))
                metrics.append({
                    'algorithm': algorithm,
                    'expanded_nodes': expanded_nodes,
                    'time_ms': time_ms
                })
                print(f"    Parsed: {algorithm}, nodes: {expanded_nodes}, time: {time_ms}ms")
            else:
                print(f"    Pattern didn't match for line: {line}")
    
    print(f"    Total metrics found: {len(metrics)}")
    return metrics

def run_single_benchmark(algorithm, grid_size, seed):
    """Run a single benchmark with the given seed and return the output."""
    try:
        result = subprocess.run([
            sys.executable, 
            "main.py", 
            "--algorithm", algorithm, 
            "--grid", str(grid_size),
            "--seed", str(seed),
            "--visual-benchmark"
        ], capture_output=True, text=True, check=True)
        
        # Combine stdout and stderr as metrics might be in either
        combined_output = result.stdout + result.stderr
        return combined_output
    except subprocess.CalledProcessError as e:
        print(f"    ERROR: Benchmark failed with return code {e.returncode}")
        if e.stdout:
            print(f"    STDOUT: {e.stdout}")
        if e.stderr:
            print(f"    STDERR: {e.stderr}")
        return None

def run_benchmark_suite(algorithm="a_star", grid_size=20, iterations=2):
    """Run the benchmark test multiple times and save results to CSV."""
    print(f"Starting benchmark suite...")
    print(f"Algorithm: {algorithm}, Grid Size: {grid_size}x{grid_size}, Iterations: {iterations}")
    
    # Load predefined seeds
    seeds = load_benchmark_seeds()
    if seeds is None:
        print("Failed to load seeds. Exiting.")
        return
    
    if iterations > len(seeds):
        print(f"WARNING: Requested {iterations} iterations but only {len(seeds)} seeds available.")
        print(f"Using all {len(seeds)} seeds.")
        iterations = len(seeds)
    
    print(f"Using seeds: {seeds[:iterations]}")
    print("-" * 80)
    
    all_metrics = []
    failed_runs = 0
    
    for i in range(iterations):
        current_seed = seeds[i]  # Use seeds sequentially starting from the first
        print(f"Running iteration {i+1}/{iterations} with seed {current_seed}...")
        
        output = run_single_benchmark(algorithm, grid_size, current_seed)
        if output is None:
            print(f"  Iteration {i+1} FAILED (error)")
            failed_runs += 1
            continue
            
        # Parse metrics from this run
        run_metrics = parse_metrics_from_output(output)
        
        # Add run information to each metric
        for metric in run_metrics:
            metric['run_number'] = i + 1
            metric['grid_size'] = grid_size
            metric['seed'] = current_seed
            all_metrics.append(metric)
        
        print(f"  Iteration {i+1} completed - Found {len(run_metrics)} metrics")
    
    # Report results
    if failed_runs > 0:
        print(f"\nWARNING: {failed_runs} out of {iterations} runs failed!")
    
    # Save to CSV
    if all_metrics:
        save_to_csv(all_metrics, algorithm, grid_size, iterations)
        print_summary(all_metrics)
    else:
        print("No metrics collected! All runs failed.")
        print("This might indicate:")
        print("- Grid generation creating unsolvable mazes")
        print("- Infinite loops in pathfinding")
        print("- Pygame display issues")
        print("Try with a smaller grid size or different algorithm.")

def save_to_csv(metrics, algorithm, grid_size, iterations):
    """Save metrics to a CSV file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create benchmarks directory if it doesn't exist
    benchmarks_dir = "./benchmarks"
    os.makedirs(benchmarks_dir, exist_ok=True)
    
    filename = f"{benchmarks_dir}/benchmark_{algorithm}_{grid_size}x{grid_size}_{iterations}runs_{timestamp}.csv"

    fieldnames = ['run_number', 'algorithm', 'grid_size', 'seed', 'expanded_nodes', 'time_ms']
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(metrics)
    
    print(f"\nResults saved to: {filename}")

def print_summary(metrics):
    """Print a summary of the benchmark results."""
    if not metrics:
        return
    
    print("\n" + "="*80)
    print("BENCHMARK SUMMARY")
    print("="*80)
    
    total_runs = len(set(m['run_number'] for m in metrics))
    total_pathfindings = len(metrics)
    
    print(f"Total Runs: {total_runs}")
    print(f"Total Pathfinding Operations: {total_pathfindings}")
    
    # Calculate averages
    avg_nodes = sum(m['expanded_nodes'] for m in metrics) / len(metrics)
    avg_time = sum(m['time_ms'] for m in metrics) / len(metrics)
    min_nodes = min(m['expanded_nodes'] for m in metrics)
    max_nodes = max(m['expanded_nodes'] for m in metrics)
    min_time = min(m['time_ms'] for m in metrics)
    max_time = max(m['time_ms'] for m in metrics)
    
    print(f"\nExpanded Nodes - Avg: {avg_nodes:.1f}, Min: {min_nodes}, Max: {max_nodes}")
    print(f"Execution Time - Avg: {avg_time:.2f}ms, Min: {min_time:.2f}ms, Max: {max_time:.2f}ms")

def main(
    algorithm: str = typer.Option("a_star", help="Pathfinding algorithm to use: 'bfs', 'dfs', or 'a_star'"),
    grid: int = typer.Option(20, help="Grid size (creates a square grid of grid x grid)"),
    iterations: int = typer.Option(2, help="Number of benchmark iterations to run")
):
    """Benchmark script for testing pathfinding algorithms performance."""
    
    # Validate algorithm
    if algorithm not in ["bfs", "dfs", "a_star"]:
        typer.echo(f"Error: Invalid algorithm '{algorithm}'. Choose 'bfs', 'dfs', or 'a_star'.")
        raise typer.Exit(1)
    
    # Validate grid size
    if grid < 5:
        typer.echo("Error: Grid size must be at least 5.")
        raise typer.Exit(1)
    
    if grid > 1000:
        typer.echo("Error: Grid size must be at most 1000.")
        raise typer.Exit(1)
    
    # Validate iterations
    if iterations < 1:
        typer.echo("Error: Number of iterations must be at least 1.")
        raise typer.Exit(1)
    
    # Load seeds to check availability
    seeds = load_benchmark_seeds()
    if seeds is None:
        raise typer.Exit(1)
    
    max_iterations = len(seeds)
    if iterations > max_iterations:
        typer.echo(f"Warning: Requested {iterations} iterations but only {max_iterations} seeds available.")
        typer.echo(f"Will run {max_iterations} iterations instead.")
        iterations = max_iterations
    
    # Remove the old arbitrary limit since we're now limited by available seeds
    # if iterations > 100:
    #     typer.echo("Error: Number of iterations must be at most 100.")
    #     raise typer.Exit(1)
    
    # Performance warning for large grids
    grid_size = grid * grid
    if grid_size >= 1000000:  # 1000x1000
        typer.echo(f"WARNING: Large grid size {grid}x{grid} = {grid_size:,} cells")
        typer.echo("This may take a very long time and use significant memory.")
        typer.echo("Consider starting with smaller grids (e.g., 100x100) to test performance first.")
    elif grid_size >= 100000:  # ~316x316
        typer.echo(f"WARNING: Grid size {grid}x{grid} = {grid_size:,} cells is quite large.")
        typer.echo("Benchmark may take several minutes per iteration.")
    
    try:
        run_benchmark_suite(algorithm, grid, iterations)
        
    except KeyboardInterrupt:
        print("\nBenchmark interrupted by user.")
        raise typer.Exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise typer.Exit(1)

if __name__ == "__main__":
    typer.run(main)
