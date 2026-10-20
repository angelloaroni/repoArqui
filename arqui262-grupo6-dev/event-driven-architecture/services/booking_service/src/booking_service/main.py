import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from booking_service import db
from booking_service.api import router
from shared.db import wait_for_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(wait_for_db, db.engine)
    yield


app = FastAPI(title="Booking API (EDA demo)", lifespan=lifespan)
app.include_router(router)
