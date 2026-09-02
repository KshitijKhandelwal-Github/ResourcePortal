from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from resourceportal.database.database import engine, Base, get_db
from resourceportal.database.seed import seed_db
from resourceportal.routers import auth, resources, dashboard, users, skills, clusters, locations, certifications, training
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    seed_db(db)
    yield

app = FastAPI(title="Resource Management Portal", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(clusters.router)
app.include_router(locations.router)
app.include_router(skills.router)
app.include_router(resources.router)
app.include_router(certifications.router)
app.include_router(training.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Welcome to Resource Portal API"}

