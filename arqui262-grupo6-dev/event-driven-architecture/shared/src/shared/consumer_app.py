"""FastAPI wrapper for a consumer: /health, /timeline and DEMO_MODE-only /debug endpoints.

The AMQP consumer runs as a background task of the same process; the HTTP side exists
so demo scripts can read state and arm failures without needing a DB driver on the host.
"""

import asyncio
import os
from collections.abc import Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from sqlalchemy import Engine, text

from shared.consumer import Consumer, Handler
from shared.db import make_engine, wait_for_db
from shared.logging import Logger, read_timeline
from shared.rabbit import Subscription
from shared.settings import Settings


def create_consumer_app(
    *,
    service: str,
    sub: Subscription,
    make_handler: Callable[[Engine], Handler],
    reset_tables: list[str],
) -> tuple[FastAPI, Engine]:
    settings = Settings.from_env(service)
    engine = make_engine(settings.database_url)
    timeline_table = f"{sub.key}_timeline"
    log = Logger(service, engine, timeline_table)
    consumer = Consumer(sub, make_handler(engine), settings, log)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await asyncio.to_thread(wait_for_db, engine)
        task = asyncio.create_task(consumer.run())
        # If the consumer task dies, exit so Docker restarts the container.
        task.add_done_callback(lambda t: None if t.cancelled() else os._exit(1))
        yield
        task.cancel()

    app = FastAPI(title=service, lifespan=lifespan)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok" if consumer.consuming else "starting", "consuming": consumer.consuming}

    @app.get("/timeline")
    def timeline(q: str) -> list[dict]:
        return read_timeline(engine, timeline_table, q)

    @app.get("/processed")
    def processed() -> dict:
        with engine.connect() as conn:
            n = conn.execute(text(f"SELECT count(*) FROM {sub.key}_processed_events")).scalar_one()
        return {"processed_events": n}

    if settings.demo_mode:

        @app.post("/debug/crash-next-after-commit")
        def crash_next() -> dict:
            consumer.controls.crash_next_after_commit = True
            return {"armed": "crash-next-after-commit"}

        @app.post("/debug/fail-next/{n}")
        def fail_next(n: int) -> dict:
            if n < 0:
                raise HTTPException(400, "n must be >= 0")
            consumer.controls.fail_next = n
            return {"armed": f"fail-next/{n}"}

        @app.post("/debug/reset")
        def reset() -> dict:
            tables = ", ".join([*reset_tables, f"{sub.key}_processed_events", timeline_table])
            with engine.begin() as conn:
                conn.execute(text(f"TRUNCATE {tables}"))
            return {"reset": True}

    return app, engine
