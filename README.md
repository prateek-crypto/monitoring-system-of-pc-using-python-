# SYSMON — PC Monitor Dashboard

A professional system monitoring dashboard built with Python + Flask.

## Live Demo
Currently live at: **[https://mackintoshed-lorna-overguilty.ngrok-free.dev](https://mackintoshed-lorna-overguilty.ngrok-free.dev)**
*(Note: This link only works while the host PC is running the Ngrok tunnel).*

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Then open: http://localhost:5000

## Features
- Live CPU & RAM gauges with animated arc display
- Real-time sparkline history graphs (60-second window)
- GPU monitoring (load, temperature, VRAM)
- Disk usage for all mounted volumes
- System info panel (OS, hostname, architecture)
- Auto-refresh every 2 seconds

## Project Structure
```
pc-monitor/
├── app.py           # Flask web server
├── monitor.py       # PCMonitor class
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/main.js
```

## Requirements
- Python 3.8+
- pip packages: flask, psutil, py-cpuinfo, gputil
