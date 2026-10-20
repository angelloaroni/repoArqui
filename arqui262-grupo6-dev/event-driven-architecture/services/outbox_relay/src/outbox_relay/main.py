import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from outbox_relay.relay import Relay
from shared.db import make_engine, wait_for_db
from shared.logging import Logger, read_timeline
from shared.settings import Settings

settings = Settings.from_env("outbox-relay")
engine = make_engine(settings.database_url)
log = Logger("outbox-relay", engine, "relay_timeline")
relay = Relay(settings, engine, log)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(wait_for_db, engine)
    task = asyncio.create_task(relay.run())
    task.add_done_callback(lambda t: None if t.cancelled() else os._exit(1))
    yield
    task.cancel()


app = FastAPI(title="Outbox Relay", lifespan=lifespan)


@app.get("/health")
def health() -> dict:
    return {"status": "ok" if relay.connected else "starting", "connected": relay.connected}


@app.get("/timeline")
def timeline(q: str) -> list[dict]:
    return read_timeline(engine, "relay_timeline", q)


if settings.demo_mode:

    @app.post("/debug/reset")
    def reset() -> dict:
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE relay_timeline"))
        return {"reset": True}
