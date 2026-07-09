import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, UniqueConstraint, Enum, Table, DateTime, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


# ---------- Enums ----------

class SubscriptionPlan(str, enum.Enum):
    free = "free"
    basic = "basic"
    standard = "standard"
    premium = "premium"


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class MovieType(str, enum.Enum):
    movie = "movie"
    series = "series"


# ---------- Junction tables (many-to-many) ----------

movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id"), primary_key=True),
    Column("genre_id", UUID(as_uuid=True), ForeignKey("genres.id"), primary_key=True),
)

movie_cast = Table(
    "movie_cast",
    Base.metadata,
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id"), primary_key=True),
    Column("cast_member_id", UUID(as_uuid=True), ForeignKey("cast_members.id"), primary_key=True),
)


# ---------- Core tables ----------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.free, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_kids = Column(Boolean, default=False)

    user = relationship("User", back_populates="profiles")
    watch_history = relationship("WatchHistory", back_populates="profile", cascade="all, delete-orphan")
    my_list = relationship("MyList", back_populates="profile", cascade="all, delete-orphan")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    release_year = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)  # in minutes
    video_url = Column(String, nullable=True)
    trailer_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    director = Column(String, nullable=True)
    rating = Column(Integer, default=0)  # e.g. average out of 100, or swap for Float
    rating_count = Column(Integer, default=0)
    is_trending = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    type = Column(Enum(MovieType), default=MovieType.movie, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    genres = relationship("Genre", secondary=movie_genres, back_populates="movies")
    cast_members = relationship("CastMember", secondary=movie_cast, back_populates="movies")
    watch_history = relationship("WatchHistory", back_populates="movie", cascade="all, delete-orphan")
    my_list = relationship("MyList", back_populates="movie", cascade="all, delete-orphan")
    seasons = relationship("Season", back_populates="movie", order_by="Season.season_number", cascade="all, delete-orphan")


class Genre(Base):
    __tablename__ = "genres"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    movies = relationship("Movie", secondary=movie_genres, back_populates="genres")


class CastMember(Base):
    __tablename__ = "cast_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)

    movies = relationship("Movie", secondary=movie_cast, back_populates="cast_members")


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=False)
    progress_seconds = Column(Integer, default=0)
    watched_at = Column(DateTime, default=datetime.utcnow)
    episode_id = Column(UUID(as_uuid=True), ForeignKey("episodes.id"), nullable=True)

    profile = relationship("Profile", back_populates="watch_history")
    movie = relationship("Movie", back_populates="watch_history")
    episode = relationship("Episode")


class MyList(Base):
    __tablename__ = "my_list"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="my_list")
    movie = relationship("Movie", back_populates="my_list")


class Season(Base):
    __tablename__ = "seasons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=False)
    season_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)

    movie = relationship("Movie", back_populates="seasons")
    episodes = relationship("Episode", back_populates="season", order_by="Episode.episode_number", cascade="all, delete-orphan")


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    season_id = Column(UUID(as_uuid=True), ForeignKey("seasons.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)
    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    season = relationship("Season", back_populates="episodes")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    profile = relationship("Profile", backref="ratings")
    movie = relationship("Movie", backref="ratings")

    __table_args__ = (
        UniqueConstraint("profile_id", "movie_id", name="uq_profile_movie_rating"),
    )