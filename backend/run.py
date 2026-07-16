#!/usr/bin/env python
"""
Entry point for running the Lumora AI backend with Uvicorn.

Usage:
    python run.py                  # development with auto-reload
    python run.py --env production # production (no reload)
"""

import argparse
import uvicorn

parser = argparse.ArgumentParser()
parser.add_argument("--env", default="development")
parser.add_argument("--host", default="0.0.0.0")
parser.add_argument("--port", type=int, default=8000)
args = parser.parse_args()

is_dev = args.env != "production"

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=is_dev,
        log_level="info",
    )
