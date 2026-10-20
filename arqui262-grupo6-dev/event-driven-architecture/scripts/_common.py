"""Tiny stdlib-only helpers for the demo scripts (no pip install needed on the host)."""

import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKING = "http://localhost:8000"
RELAY = "http://localhost:8004"
CRM = "http://localhost:8001"
NOTIFICATION = "http://localhost:8002"
ANALYTICS = "http://localhost:8003"
RABBIT = "http://localhost:15672"

if hasattr(sys.stdout, "reconfigure"):  # emojis on Windows consoles
    sys.stdout.reconfigure(encoding="utf-8")


def _env() -> dict[str, str]:
    values: dict[str, str] = {}
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                key, _, value = line.partition("=")
                values[key.strip()] = value.strip()
    return values


_ENV = _env()
RABBIT_USER = os.environ.get("RABBITMQ_DEFAULT_USER", _ENV.get("RABBITMQ_DEFAULT_USER", "eda"))
RABBIT_PASS = os.environ.get("RABBITMQ_DEFAULT_PASS", _ENV.get("RABBITMQ_DEFAULT_PASS", "eda"))

CRM_QUEUE = "crm.booking-confirmed.v1"
CRM_DLQ = "crm.booking-confirmed.dlq"
QUEUES = [
    f"{key}.booking-confirmed.{suffix}"
    for key in ("crm", "notification", "analytics")
    for suffix in ("v1", "retry", "dlq")
]


def http(method: str, url: str, body: dict | None = None, headers: dict | None = None, timeout: float = 5):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url, data=data, method=method, headers={"Content-Type": "application/json", **(headers or {})}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else None


def rabbit(method: str, path: str, body: dict | None = None):
    token = base64.b64encode(f"{RABBIT_USER}:{RABBIT_PASS}".encode()).decode()
    return http(method, f"{RABBIT}/api{path}", body, {"Authorization": f"Basic {token}"})


def queue_info(name: str) -> dict:
    """Ready / unacked / consumers of a queue, from the RabbitMQ management API.

    Ready/unacked come from the queue totals (live); the regular stats view can lag by
    several seconds, which made the demo show a stale "Ready = 1".
    """
    path = f"/queues/%2F/{urllib.parse.quote(name)}"
    totals = rabbit("GET", f"{path}?disable_stats=true&enable_queue_totals=true")
    stats = rabbit("GET", path)
    return {
        "ready": totals.get("messages_ready", 0),
        "unacked": totals.get("messages_unacknowledged", 0),
        "consumers": stats.get("consumers", 0),
    }


def wait_until(check, timeout: float = 30, interval: float = 0.5):
    """Poll `check()` until it returns something truthy; connection errors count as 'not yet'."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            result = check()
            if result:
                return result
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            pass
        time.sleep(interval)
    return None


def create_and_confirm(corr: str | None = None, amount: float = 450.0) -> tuple[str, str]:
    corr = corr or f"corr-{uuid.uuid4().hex[:6]}"
    booking = http("POST", f"{BOOKING}/bookings", {"customer_id": "C-100", "amount": amount, "currency": "USD"})
    http("POST", f"{BOOKING}/bookings/{booking['id']}/confirm", headers={"X-Correlation-Id": corr})
    return booking["id"], corr


def effect(url: str, booking_id: str):
    return http("GET", f"{url}?booking_id={booking_id}")


def timeline_has(url: str, key: str, action: str) -> bool:
    return any(r["action"] == action for r in http("GET", f"{url}/timeline?q={key}"))


def mark(ok: bool) -> str:
    return "✅" if ok else "❌"


def row(label: str, status: str, ok: bool | None = True) -> None:
    suffix = "" if ok is None else f" {mark(ok)}"
    print(f"{label:<14} {status}{suffix}")


def banner(text: str) -> None:
    print(f"\n=== {text} ===")


def header(title: str, what: str) -> None:
    """Demo title plus a one-line 'Qué demuestra'."""
    banner(title)
    print(f"Qué demuestra: {what}\n")


def step(number: int, text: str) -> None:
    print(f"{number}) {text}")


def note(text: str) -> None:
    print(f"   {text}")


def conclusion(*bullets: str) -> None:
    print("\nConclusión:")
    for bullet in bullets:
        print(f"  - {bullet}")


def compose(*args: str) -> bool:
    """Run `docker compose <args>` in the project folder. False if docker is unavailable."""
    try:
        return subprocess.run(["docker", "compose", *args], cwd=ROOT, check=False).returncode == 0
    except FileNotFoundError:
        return False


def ask_manual(command: str) -> None:
    print(f"   (no pude ejecutar docker automáticamente) ejecuta esto en otra terminal:\n   {command}")
    input("   presiona Enter cuando termine... ")


def parse_ts(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
