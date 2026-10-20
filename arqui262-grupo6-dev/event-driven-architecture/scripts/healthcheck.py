"""Checks that every piece of the stack answers. Usage: python scripts/healthcheck.py [--wait SECONDS]"""

import sys
import time

from _common import ANALYTICS, BOOKING, CRM, NOTIFICATION, RELAY, http, mark, rabbit


def _ok(call) -> bool:
    try:
        return bool(call())
    except Exception:
        return False


def checks() -> list[tuple[str, bool]]:
    return [
        ("PostgreSQL", _ok(lambda: http("GET", f"{BOOKING}/health")["db"])),  # booking-api runs SELECT 1
        ("RabbitMQ", _ok(lambda: rabbit("GET", "/overview"))),
        ("Booking API", _ok(lambda: http("GET", f"{BOOKING}/health")["status"] == "ok")),
        ("Outbox Relay", _ok(lambda: http("GET", f"{RELAY}/health")["status"] == "ok")),
        ("CRM Consumer", _ok(lambda: http("GET", f"{CRM}/health")["status"] == "ok")),
        ("Notification Consumer", _ok(lambda: http("GET", f"{NOTIFICATION}/health")["status"] == "ok")),
        ("Analytics Consumer", _ok(lambda: http("GET", f"{ANALYTICS}/health")["status"] == "ok")),
    ]


def main() -> int:
    wait = int(sys.argv[sys.argv.index("--wait") + 1]) if "--wait" in sys.argv else 0
    deadline = time.time() + wait
    while True:
        results = checks()
        if all(ok for _, ok in results) or time.time() >= deadline:
            break
        time.sleep(3)
    for name, ok in results:
        print(f"{name:<22} {mark(ok)}")
    return 0 if all(ok for _, ok in results) else 1


if __name__ == "__main__":
    sys.exit(main())
