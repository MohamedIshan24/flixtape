from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])

MAX_PROFILES_PER_USER = 5


@router.post("/", response_model=schemas.ProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_in: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing_count = (
        db.query(models.Profile)
        .filter(models.Profile.user_id == current_user.id)
        .count()
    )
    if existing_count >= MAX_PROFILES_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum of {MAX_PROFILES_PER_USER} profiles allowed",
        )

    new_profile = models.Profile(
        user_id=current_user.id,
        name=profile_in.name,
        avatar_url=profile_in.avatar_url,
        is_kids=profile_in.is_kids,
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.get("/", response_model=list[schemas.ProfileOut])
def list_profiles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Profile)
        .filter(models.Profile.user_id == current_user.id)
        .all()
    )


def _get_owned_profile_or_404(profile_id, db: Session, current_user: models.User):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


@router.get("/{profile_id}", response_model=schemas.ProfileOut)
def get_profile(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_owned_profile_or_404(profile_id, db, current_user)


@router.patch("/{profile_id}", response_model=schemas.ProfileOut)
def update_profile(
    profile_id: str,
    profile_in: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = _get_owned_profile_or_404(profile_id, db, current_user)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = _get_owned_profile_or_404(profile_id, db, current_user)
    db.delete(profile)
    db.commit()
    return None