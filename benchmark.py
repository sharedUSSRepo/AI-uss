#!/usr/bin/env python3
"""
Benchmark script for testing pathfinding algorithms in the Police Chase Grid Game.

This script runs the game in benchmark mode with predefined parameters to test
the A* algorithm performance on a 20x20 grid without cop interference.
"""

import subprocess
import sys

def run_benchmark():
    """Run the benchmark test with A* algorithm on a 20x20 grid."""
    try:
        print("Starting benchmark test...")
        print("Running: python main.py --algorithm a_star --grid 20 --benchmark")
        print("-" * 60)
        
        # Execute the main.py with benchmark parameters
        result = subprocess.run([
            sys.executable, 
            "main.py", 
            "--algorithm", "a_star", 
            "--grid", "20", 
            "--benchmark"
        ], check=True)
        
        print("-" * 60)
        print("Benchmark completed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"Error running benchmark: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nBenchmark interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_benchmark()
