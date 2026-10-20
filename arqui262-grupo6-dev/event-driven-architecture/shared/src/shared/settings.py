"""Environment-based settings. Plain dataclass on purpose: no extra dependency."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    service: str
    database_url: str
    rabbitmq_url: str
    demo_mode: bool
    max_retries: int  # maximum delivery ATTEMPTS per message (first try included)
    retry_delay_ms: int  # TTL of the retry queues (fixed backoff)

    @classmethod
    def from_env(cls, service: str) -> "Settings":
        return cls(
            service=service,
            database_url=os.environ.get("DATABASE_URL", "postgresql+psycopg://eda:eda@localhost:5432/eda"),
            rabbitmq_url=os.environ.get("RABBITMQ_URL", "amqp://eda:eda@localhost:5672/"),
            demo_mode=os.environ.get("DEMO_MODE", "false").lower() == "true",
            max_retries=int(os.environ.get("MAX_RETRIES", "3")),
            retry_delay_ms=int(os.environ.get("RETRY_DELAY_MS", "2000")),
        )
