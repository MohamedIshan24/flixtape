from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles/{profile_id}/ratings", tags=["ratings"])


def _check_profile_ownership(profile_id: str, current_user: models.User, db: Session):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


def _recalculate_movie_rating(movie_id: str, db: Session):
    result = db.query(
        func.avg(models.Rating.rating),
        func.count(models.Rating.id)
    ).filter(models.Rating.movie_id == movie_id).first()

    avg_rating, count = result
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if movie:
        movie.rating = round(avg_rating) if avg_rating is not None else 0
        movie.rating_count = count
        db.commit()


@router.post("/", response_model=schemas.RatingOut, status_code=status.HTTP_201_CREATED)
def upsert_rating(
    profile_id: str,
    rating_in: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)

    movie = db.query(models.Movie).filter(models.Movie.id == rating_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    if movie.type == models.MovieType.series:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This title is a series — rate individual episodes instead.",
        )
    
    existing = db.query(models.Rating).filter(
        models.Rating.profile_id == profile_id,
        models.Rating.movie_id == rating_in.movie_id
    ).first()

    if existing:
        existing.rating = rating_in.rating
        db.commit()
        db.refresh(existing)
        _recalculate_movie_rating(rating_in.movie_id, db)
        return existing

    new_rating = models.Rating(
        profile_id=profile_id,
        movie_id=rating_in.movie_id,
        rating=rating_in.rating,
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    _recalculate_movie_rating(rating_in.movie_id, db)
    return new_rating


@router.get("/", response_model=list[schemas.RatingOut])
def list_ratings(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    return db.query(models.Rating).filter(models.Rating.profile_id == profile_id).all()


@router.get("/{movie_id}", response_model=schemas.RatingOut)
def get_rating(
    profile_id: str,
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    rating = db.query(models.Rating).filter(
        models.Rating.profile_id == profile_id,
        models.Rating.movie_id == movie_id
    ).first()
    if not rating:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found")
    return rating


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rating(
    profile_id: str,
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    rating = db.query(models.Rating).filter(
        models.Rating.profile_id == profile_id,
        models.Rating.movie_id == movie_id
    ).first()
    if not rating:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found")

    db.delete(rating)
    db.commit()
    _recalculate_movie_rating(movie_id, db)
    return None