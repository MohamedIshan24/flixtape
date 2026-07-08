import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app import models
from app.models import SubscriptionPlan, UserRole

# ---------- User ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    subscription_plan: SubscriptionPlan
    role: UserRole
    created_at: datetime


# ---------- Auth tokens ----------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: uuid.UUID | None = None

# ---------- Profile ----------

class ProfileCreate(BaseModel):
    name: str
    avatar_url: str | None = None
    is_kids: bool = False


class ProfileUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    is_kids: bool | None = None


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    avatar_url: str | None
    is_kids: bool

# ---------- Genre ----------

class GenreCreate(BaseModel):
    name: str


class GenreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str


# ---------- Cast Member ----------

class CastMemberCreate(BaseModel):
    name: str
    photo_url: str | None = None


class CastMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    photo_url: str | None

# ---------- Movie ----------

class MovieCreate(BaseModel):
    title: str
    description: str | None = None
    release_year: int | None = None
    duration: int | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    banner_url: str | None = None
    director: str | None = None
    type: models.MovieType = models.MovieType.movie
    genre_ids: list[uuid.UUID] = []
    cast_member_ids: list[uuid.UUID] = []


class MovieUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    release_year: int | None = None
    duration: int | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    banner_url: str | None = None
    director: str | None = None
    type: models.MovieType | None = None
    is_trending: bool | None = None
    is_featured: bool | None = None
    genre_ids: list[uuid.UUID] | None = None
    cast_member_ids: list[uuid.UUID] | None = None


class MovieOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    release_year: int | None
    duration: int | None
    video_url: str | None
    thumbnail_url: str | None
    banner_url: str | None
    director: str | None
    rating: int
    rating_count: int
    is_trending: bool
    is_featured: bool
    type: models.MovieType
    genres: list[GenreOut]
    cast_members: list[CastMemberOut]
    seasons: list[SeasonOut] = []

# ---------- Watch History ----------

class WatchHistoryCreate(BaseModel):
    movie_id: uuid.UUID
    episode_id: uuid.UUID | None = None
    progress_seconds: int = 0


class WatchHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    profile_id: uuid.UUID
    movie_id: uuid.UUID
    episode_id: uuid.UUID | None
    progress_seconds: int
    watched_at: datetime
    movie: MovieOut
    episode: EpisodeOut | None = None


# ---------- My List ----------

class MyListCreate(BaseModel):
    movie_id: uuid.UUID


class MyListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    profile_id: uuid.UUID
    movie_id: uuid.UUID
    added_at: datetime
    movie: MovieOut


# ---------- Episode ----------

class EpisodeCreate(BaseModel):
    episode_number: int
    title: str
    description: str | None = None
    duration: int | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None


class EpisodeUpdate(BaseModel):
    episode_number: int | None = None
    title: str | None = None
    description: str | None = None
    duration: int | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None


class EpisodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    season_id: uuid.UUID
    episode_number: int
    title: str
    description: str | None
    duration: int | None
    video_url: str | None
    thumbnail_url: str | None


# ---------- Season ----------

class SeasonCreate(BaseModel):
    season_number: int
    title: str | None = None


class SeasonUpdate(BaseModel):
    season_number: int | None = None
    title: str | None = None


class SeasonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    movie_id: uuid.UUID
    season_number: int
    title: str | None
    episodes: list[EpisodeOut] = []