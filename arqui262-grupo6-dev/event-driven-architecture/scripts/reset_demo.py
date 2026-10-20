"""Clears demo state: purges RabbitMQ queues and truncates service tables (needs DEMO_MODE=true)."""

from _common import ANALYTICS, BOOKING, CRM, NOTIFICATION, QUEUES, RELAY, http, rabbit


def main() -> None:
    for queue in QUEUES:  # purge first so nothing is redelivered into a clean DB
        rabbit("DELETE", f"/queues/%2F/{queue}/contents")
    for name, url in [
        ("booking", BOOKING),
        ("relay", RELAY),
        ("crm", CRM),
        ("notification", NOTIFICATION),
        ("analytics", ANALYTICS),
    ]:
        http("POST", f"{url}/debug/reset")
        print(f"reset {name}")
    print("Demo state cleared.")


if __name__ == "__main__":
    main()
