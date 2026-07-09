from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.routers import auth, profiles
from app.routers import auth, profiles, genres, cast_members
from app.routers import auth, profiles, genres, cast_members, movies
from app.routers import auth, profiles, genres, cast_members, movies, watch_history, my_list, ratings
from app.routers import seasons, episodes

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

# Allow the Vite dev server to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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