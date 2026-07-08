from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(tags=["seasons"])


@router.post("/movies/{movie_id}/seasons", response_model=schemas.SeasonOut, status_code=status.HTTP_201_CREATED)
def create_season(
    movie_id: str,
    season_in: schemas.SeasonCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    new_season = models.Season(
        movie_id=movie_id,
        season_number=season_in.season_number,
        title=season_in.title,
    )
    db.add(new_season)
    db.commit()
    db.refresh(new_season)
    return new_season


@router.get("/movies/{movie_id}/seasons", response_model=list[schemas.SeasonOut])
def list_seasons(movie_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Season)
        .filter(models.Season.movie_id == movie_id)
        .order_by(models.Season.season_number)
        .all()
    )


@router.patch("/seasons/{season_id}", response_model=schemas.SeasonOut)
def update_season(
    season_id: str,
    season_in: schemas.SeasonUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    season = db.query(models.Season).filter(models.Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    update_data = season_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(season, field, value)

    db.commit()
    db.refresh(season)
    return season


@router.delete("/seasons/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_season(
    season_id: str,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    season = db.query(models.Season).filter(models.Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")
    db.delete(season)
    db.commit()
    return None