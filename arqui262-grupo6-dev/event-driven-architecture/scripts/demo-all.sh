#!/usr/bin/env sh
# Runs the whole demo sequence. Needs the stack up: docker compose up -d --build
set -e
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"
command -v "$PY" >/dev/null 2>&1 || PY=python

"$PY" scripts/healthcheck.py --wait 90
"$PY" scripts/reset_demo.py
"$PY" scripts/demo_01_happy_path.py
"$PY" scripts/demo_02_consumer_down.py
"$PY" scripts/demo_03_redelivery.py
"$PY" scripts/demo_04_poison_dlq.py
"$PY" scripts/demo_05_trace.py --new
"$PY" scripts/demo_06_outbox.py
