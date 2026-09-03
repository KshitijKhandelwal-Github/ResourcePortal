from fastapi import FastAPI

from database import engine, Base
import models
from population import router, populate_database


Base.metadata.create_all(bind=engine)

populate_database()


app = FastAPI(
    title="Resource Management API",
    version="1.0.0"
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "Resource Management API is running"
    }