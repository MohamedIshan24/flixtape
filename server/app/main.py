from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routers import (auth, profiles, genres, cast_members, movies, watch_history, my_list, seasons, episodes, ratings, billing, analytics, notifications, episode_ratings)

from app.database import engine, Base
import app.models  # ensures models are registered with Base before create_all

app = FastAPI(title="Flixtape API")
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(genres.router)
app.include_router(cast_members.router)
app.include_router(movies.router)
app.include_router(watch_history.router)
app.include_router(my_list.router)
app.include_router(seasons.router)
app.include_router(episodes.router)
app.include_router(ratings.router)
app.include_router(billing.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(episode_ratings.router)

# Allow the configured frontend (Vite dev server locally, or the deployed
# client URL in production) to talk to this API.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Flixtape API is running"}