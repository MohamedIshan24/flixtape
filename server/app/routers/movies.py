from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/movies", tags=["movies"])


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


@router.post("/", response_model=schemas.MovieOut, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie_in: schemas.MovieCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    data = movie_in.model_dump(exclude={"genre_ids", "cast_member_ids"})
    new_movie = models.Movie(**data)
    db.add(new_movie)
    db.flush()  # get new_movie.id without committing yet

    _attach_genres_and_cast(new_movie, db, movie_in.genre_ids, movie_in.cast_member_ids)

    db.commit()
    db.refresh(new_movie)
    return new_movie


@router.get("/", response_model=list[schemas.MovieOut])
def list_movies(
    db: Session = Depends(get_db),
    trending: bool | None = None,
    featured: bool | None = None,
):
    query = db.query(models.Movie)
    if trending is not None:
        query = query.filter(models.Movie.is_trending == trending)
    if featured is not None:
        query = query.filter(models.Movie.is_featured == featured)
    return query.all()


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