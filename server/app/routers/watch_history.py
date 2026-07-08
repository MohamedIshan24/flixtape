from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles/{profile_id}/watch-history", tags=["watch-history"])


def _get_owned_profile_or_404(profile_id: str, db: Session, current_user: models.User):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


@router.post("/", response_model=schemas.WatchHistoryOut, status_code=status.HTTP_201_CREATED)
def upsert_watch_history(
    profile_id: str,
    entry_in: schemas.WatchHistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    movie = db.query(models.Movie).filter(models.Movie.id == entry_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    existing = (
        db.query(models.WatchHistory)
        .filter(
            models.WatchHistory.profile_id == profile_id,
            models.WatchHistory.movie_id == entry_in.movie_id,
        )
        .first()
    )

    if existing:
        existing.progress_seconds = entry_in.progress_seconds
        db.commit()
        db.refresh(existing)
        return existing

    new_entry = models.WatchHistory(
        profile_id=profile_id,
        movie_id=entry_in.movie_id,
        progress_seconds=entry_in.progress_seconds,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.get("/", response_model=list[schemas.WatchHistoryOut])
def list_watch_history(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    return (
        db.query(models.WatchHistory)
        .filter(models.WatchHistory.profile_id == profile_id)
        .order_by(models.WatchHistory.watched_at.desc())
        .all()
    )


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watch_history_entry(
    profile_id: str,
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    entry = (
        db.query(models.WatchHistory)
        .filter(
            models.WatchHistory.profile_id == profile_id,
            models.WatchHistory.movie_id == movie_id,
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch history entry not found")

    db.delete(entry)
    db.commit()
    return None

@router.post("/", response_model=schemas.WatchHistoryOut, status_code=status.HTTP_201_CREATED)
def upsert_watch_history(
    profile_id: str,
    entry_in: schemas.WatchHistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    movie = db.query(models.Movie).filter(models.Movie.id == entry_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    query = db.query(models.WatchHistory).filter(
        models.WatchHistory.profile_id == profile_id,
        models.WatchHistory.movie_id == entry_in.movie_id,
    )

    if entry_in.episode_id is not None:
        episode = db.query(models.Episode).filter(models.Episode.id == entry_in.episode_id).first()
        if not episode:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
        query = query.filter(models.WatchHistory.episode_id == entry_in.episode_id)
    else:
        query = query.filter(models.WatchHistory.episode_id.is_(None))

    existing = query.first()

    if existing:
        existing.progress_seconds = entry_in.progress_seconds
        db.commit()
        db.refresh(existing)
        return existing

    new_entry = models.WatchHistory(
        profile_id=profile_id,
        movie_id=entry_in.movie_id,
        episode_id=entry_in.episode_id,
        progress_seconds=entry_in.progress_seconds,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry