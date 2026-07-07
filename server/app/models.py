import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, Enum, Table, DateTime, Text
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

    profile = relationship("Profile", back_populates="watch_history")
    movie = relationship("Movie", back_populates="watch_history")


class MyList(Base):
    __tablename__ = "my_list"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="my_list")
    movie = relationship("Movie", back_populates="my_list")