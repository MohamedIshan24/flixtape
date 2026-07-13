from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(tags=["episode-ratings"])


def _check_profile_ownership(profile_id: str, current_user: models.User, db: Session):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


def _episode_stats(db: Session, episode_id: str):
    avg, count = (
        db.query(func.avg(models.EpisodeRating.rating), func.count(models.EpisodeRating.id))
        .filter(models.EpisodeRating.episode_id == episode_id)
        .first()
    )
    return (round(float(avg), 1) if avg is not None else 0.0), (count or 0)


def _season_stats(db: Session, season_id: str):
    avg, count = (
        db.query(func.avg(models.EpisodeRating.rating), func.count(models.EpisodeRating.id))
        .join(models.Episode, models.Episode.id == models.EpisodeRating.episode_id)
        .filter(models.Episode.season_id == season_id)
        .first()
    )
    return (round(float(avg), 1) if avg is not None else 0.0), (count or 0)


def _series_stats(db: Session, movie_id: str):
    avg, count = (
        db.query(func.avg(models.EpisodeRating.rating), func.count(models.EpisodeRating.id))
        .join(models.Episode, models.Episode.id == models.EpisodeRating.episode_id)
        .join(models.Season, models.Season.id == models.Episode.season_id)
        .filter(models.Season.movie_id == movie_id)
        .first()
    )
    return (round(float(avg), 1) if avg is not None else 0.0), (count or 0)


# ---------- Profile-scoped rating CRUD ----------

@router.post("/profiles/{profile_id}/episode-ratings/", response_model=schemas.EpisodeRatingOut, status_code=status.HTTP_201_CREATED)
def upsert_episode_rating(
    profile_id: str,
    rating_in: schemas.EpisodeRatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)

    episode = db.query(models.Episode).filter(models.Episode.id == rating_in.episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")

    existing = db.query(models.EpisodeRating).filter(
        models.EpisodeRating.profile_id == profile_id,
        models.EpisodeRating.episode_id == rating_in.episode_id,
    ).first()

    if existing:
        existing.rating = rating_in.rating
        db.commit()
        db.refresh(existing)
        return existing

    new_rating = models.EpisodeRating(
        profile_id=profile_id,
        episode_id=rating_in.episode_id,
        rating=rating_in.rating,
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating


@router.get("/profiles/{profile_id}/episode-ratings/{episode_id}", response_model=schemas.EpisodeRatingOut)
def get_episode_rating(
    profile_id: str,
    episode_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    rating = db.query(models.EpisodeRating).filter(
        models.EpisodeRating.profile_id == profile_id,
        models.EpisodeRating.episode_id == episode_id,
    ).first()
    if not rating:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found")
    return rating


@router.delete("/profiles/{profile_id}/episode-ratings/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode_rating(
    profile_id: str,
    episode_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    rating = db.query(models.EpisodeRating).filter(
        models.EpisodeRating.profile_id == profile_id,
        models.EpisodeRating.episode_id == episode_id,
    ).first()
    if not rating:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found")
    db.delete(rating)
    db.commit()
    return None


# ---------- Public aggregate summaries ----------

@router.get("/episode-ratings/summary/episode/{episode_id}", response_model=schemas.RatingSummaryOut)
def episode_rating_summary(episode_id: str, db: Session = Depends(get_db)):
    avg, count = _episode_stats(db, episode_id)
    return schemas.RatingSummaryOut(average_rating=avg, rating_count=count)


@router.get("/episode-ratings/summary/season/{season_id}", response_model=schemas.RatingSummaryOut)
def season_rating_summary(season_id: str, db: Session = Depends(get_db)):
    avg, count = _season_stats(db, season_id)
    return schemas.RatingSummaryOut(average_rating=avg, rating_count=count)


@router.get("/episode-ratings/summary/series/{movie_id}", response_model=schemas.RatingSummaryOut)
def series_rating_summary(movie_id: str, db: Session = Depends(get_db)):
    avg, count = _series_stats(db, movie_id)
    return schemas.RatingSummaryOut(average_rating=avg, rating_count=count)