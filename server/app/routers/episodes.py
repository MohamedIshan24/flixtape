from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(tags=["episodes"])


@router.post("/seasons/{season_id}/episodes", response_model=schemas.EpisodeOut, status_code=status.HTTP_201_CREATED)
def create_episode(
    season_id: str,
    episode_in: schemas.EpisodeCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    season = db.query(models.Season).filter(models.Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    new_episode = models.Episode(season_id=season_id, **episode_in.model_dump())
    db.add(new_episode)
    db.flush()  # get new_episode.id without committing yet

    movie = season.movie
    my_list_entries = db.query(models.MyList).filter(models.MyList.movie_id == movie.id).all()
    for entry in my_list_entries:
        notification = models.Notification(
            profile_id=entry.profile_id,
            movie_id=movie.id,
            episode_id=new_episode.id,
            message=f"New episode added to {movie.title}: {new_episode.title}",
        )
        db.add(notification)

    db.commit()
    db.refresh(new_episode)
    return new_episode


@router.get("/seasons/{season_id}/episodes", response_model=list[schemas.EpisodeOut])
def list_episodes(season_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Episode)
        .filter(models.Episode.season_id == season_id)
        .order_by(models.Episode.episode_number)
        .all()
    )


@router.patch("/episodes/{episode_id}", response_model=schemas.EpisodeOut)
def update_episode(
    episode_id: str,
    episode_in: schemas.EpisodeUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    episode = db.query(models.Episode).filter(models.Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")

    update_data = episode_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(episode, field, value)

    db.commit()
    db.refresh(episode)
    return episode


@router.delete("/episodes/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(
    episode_id: str,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    episode = db.query(models.Episode).filter(models.Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
    db.delete(episode)
    db.commit()
    return None