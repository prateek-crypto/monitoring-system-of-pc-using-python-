# PC Monitor

A simple Python application to monitor PC specifications and real-time resource usage.

## Features
- OS Information (System, Release, Hostname)
- CPU Details (Model, Architecture, Usage)
- RAM Stats (Total capacity, Current Usage)
- Disk Usage (Partition details, Space used)
- GPU Monitoring (Load, Temperature, Memory usage)

## Setup

1. **Create and activate a virtual environment**:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the monitor**:
   ```bash
   python monitor.py
   ```
