from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles/{profile_id}/my-list", tags=["my-list"])


def _get_owned_profile_or_404(profile_id: str, db: Session, current_user: models.User):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


@router.post("/", response_model=schemas.MyListOut, status_code=status.HTTP_201_CREATED)
def add_to_my_list(
    profile_id: str,
    entry_in: schemas.MyListCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    movie = db.query(models.Movie).filter(models.Movie.id == entry_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    existing = (
        db.query(models.MyList)
        .filter(
            models.MyList.profile_id == profile_id,
            models.MyList.movie_id == entry_in.movie_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie already in list")

    new_entry = models.MyList(profile_id=profile_id, movie_id=entry_in.movie_id)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.get("/", response_model=list[schemas.MyListOut])
def list_my_list(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    return (
        db.query(models.MyList)
        .filter(models.MyList.profile_id == profile_id)
        .order_by(models.MyList.added_at.desc())
        .all()
    )


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_my_list(
    profile_id: str,
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_profile_or_404(profile_id, db, current_user)

    entry = (
        db.query(models.MyList)
        .filter(
            models.MyList.profile_id == profile_id,
            models.MyList.movie_id == movie_id,
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in list")

    db.delete(entry)
    db.commit()
    return None