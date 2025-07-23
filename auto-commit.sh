#!/bin/bash

# Optional: Add only changed files
git add .

# Auto commit with timestamp
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch (adjust if you're using another branch)
git push origin main
