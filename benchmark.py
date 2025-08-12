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
from datetime import datetime

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

def run_single_benchmark(algorithm, grid_size):
    """Run a single benchmark and return the output."""
    try:
        result = subprocess.run([
            sys.executable, 
            "main.py", 
            "--algorithm", algorithm, 
            "--grid", str(grid_size), 
            "--benchmark"
        ], capture_output=True, text=True, check=True)
        
        # Debug: print what we captured
        print(f"    STDOUT: {repr(result.stdout)}")
        print(f"    STDERR: {repr(result.stderr)}")
        
        # Combine stdout and stderr as metrics might be in either
        combined_output = result.stdout + result.stderr
        return combined_output
    except subprocess.CalledProcessError as e:
        print(f"Error running benchmark: {e}")
        print(f"Return code: {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return None

def run_benchmark_suite(algorithm="a_star", grid_size=20, iterations=2):
    """Run the benchmark test multiple times and save results to CSV."""
    print(f"Starting benchmark suite...")
    print(f"Algorithm: {algorithm}, Grid Size: {grid_size}x{grid_size}, Iterations: {iterations}")
    print("-" * 80)
    
    all_metrics = []
    
    for i in range(iterations):
        print(f"Running iteration {i+1}/{iterations}...")
        
        output = run_single_benchmark(algorithm, grid_size)
        if output is None:
            continue
            
        # Parse metrics from this run
        run_metrics = parse_metrics_from_output(output)
        
        # Add run information to each metric
        for metric in run_metrics:
            metric['run_number'] = i + 1
            metric['grid_size'] = grid_size
            all_metrics.append(metric)
        
        print(f"  Iteration {i+1} completed - Found {len(run_metrics)} metrics")
    
    # Save to CSV
    if all_metrics:
        save_to_csv(all_metrics, algorithm, grid_size, iterations)
        print_summary(all_metrics)
    else:
        print("No metrics collected!")

def save_to_csv(metrics, algorithm, grid_size, iterations):
    """Save metrics to a CSV file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"./benchmarks/benchmark_{algorithm}_{grid_size}x{grid_size}_{iterations}runs_{timestamp}.csv"

    fieldnames = ['run_number', 'algorithm', 'grid_size', 'expanded_nodes', 'time_ms']
    
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

def main():
    """Main function to run the benchmark suite."""
    try:
        # Default parameters - can be modified here
        algorithm = "a_star"
        grid_size = 20
        iterations = 2
        
        run_benchmark_suite(algorithm, grid_size, iterations)
        
    except KeyboardInterrupt:
        print("\nBenchmark interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
