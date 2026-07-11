from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user, get_current_user

router = APIRouter(prefix="/movies", tags=["movies"])

KIDS_GENRE_NAME = "Kids & Family"


def _attach_genres_and_cast(movie: models.Movie, db: Session, genre_ids, cast_member_ids):
    if genre_ids is not None:
        genres = db.query(models.Genre).filter(models.Genre.id.in_(genre_ids)).all()
        if len(genres) != len(genre_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more genre_ids not found")
        movie.genres = genres

    if cast_member_ids is not None:
        cast_members = db.query(models.CastMember).filter(models.CastMember.id.in_(cast_member_ids)).all()
        if len(cast_members) != len(cast_member_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more cast_member_ids not found")
        movie.cast_members = cast_members


def _check_profile_ownership(profile_id: str, current_user: models.User, db: Session):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


@router.post("/", response_model=schemas.MovieOut, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie_in: schemas.MovieCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    data = movie_in.model_dump(exclude={"genre_ids", "cast_member_ids"})
    new_movie = models.Movie(**data)
    db.add(new_movie)
    db.flush()

    _attach_genres_and_cast(new_movie, db, movie_in.genre_ids, movie_in.cast_member_ids)

    db.commit()
    db.refresh(new_movie)
    return new_movie


@router.get("/", response_model=list[schemas.MovieOut])
def list_movies(
    db: Session = Depends(get_db),
    trending: bool | None = None,
    featured: bool | None = None,
    genre_id: str | None = None,
    search: str | None = None,
    kids_friendly: bool | None = None,
    type: str | None = None,
):
    query = db.query(models.Movie)
    if trending is not None:
        query = query.filter(models.Movie.is_trending == trending)
    if featured is not None:
        query = query.filter(models.Movie.is_featured == featured)
    if genre_id is not None:
        query = query.filter(models.Movie.genres.any(models.Genre.id == genre_id))
    if search is not None:
        query = query.filter(models.Movie.title.ilike(f"%{search}%"))
    if kids_friendly:
        query = query.filter(models.Movie.genres.any(models.Genre.name == KIDS_GENRE_NAME))
    if type is not None:
        query = query.filter(models.Movie.type == type)
    return query.all()


@router.get("/recommendations/{profile_id}", response_model=list[schemas.MovieOut])
def get_recommendations(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = _check_profile_ownership(profile_id, current_user, db)

    watched_movie_ids = (
        db.query(models.WatchHistory.movie_id)
        .filter(models.WatchHistory.profile_id == profile_id)
        .distinct()
        .all()
    )
    watched_ids = [row[0] for row in watched_movie_ids]

    base_query = db.query(models.Movie)
    if profile.is_kids:
        base_query = base_query.filter(models.Movie.genres.any(models.Genre.name == KIDS_GENRE_NAME))

    if not watched_ids:
        return base_query.filter(models.Movie.is_trending == True).limit(10).all()

    watched_genre_ids = (
        db.query(models.Genre.id)
        .join(models.movie_genres, models.movie_genres.c.genre_id == models.Genre.id)
        .filter(models.movie_genres.c.movie_id.in_(watched_ids))
        .distinct()
        .all()
    )
    genre_ids = [row[0] for row in watched_genre_ids]

    if not genre_ids:
        return base_query.filter(models.Movie.is_trending == True).limit(10).all()

    recommendations_query = (
        base_query
        .join(models.movie_genres, models.movie_genres.c.movie_id == models.Movie.id)
        .filter(models.movie_genres.c.genre_id.in_(genre_ids))
        .filter(~models.Movie.id.in_(watched_ids))
        .group_by(models.Movie.id)
        .order_by(func.count(models.movie_genres.c.genre_id).desc())
        .limit(10)
    )

    return recommendations_query.all()


@router.get("/{movie_id}", response_model=schemas.MovieOut)
def get_movie(movie_id: str, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    return movie


@router.patch("/{movie_id}", response_model=schemas.MovieOut)
def update_movie(
    movie_id: str,
    movie_in: schemas.MovieUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    update_data = movie_in.model_dump(exclude_unset=True, exclude={"genre_ids", "cast_member_ids"})
    for field, value in update_data.items():
        setattr(movie, field, value)

    _attach_genres_and_cast(movie, db, movie_in.genre_ids, movie_in.cast_member_ids)

    db.commit()
    db.refresh(movie)
    return movie


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(
    movie_id: str,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    db.delete(movie)
    db.commit()
    return None