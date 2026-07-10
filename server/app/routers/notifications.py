from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/profiles/{profile_id}/notifications", tags=["notifications"])


def _check_profile_ownership(profile_id: str, current_user: models.User, db: Session):
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your profile")
    return profile


@router.get("/", response_model=list[schemas.NotificationOut])
def list_notifications(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    return (
        db.query(models.Notification)
        .filter(models.Notification.profile_id == profile_id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    profile_id: str,
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.profile_id == profile_id,
    ).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    profile_id: str,
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _check_profile_ownership(profile_id, current_user, db)
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.profile_id == profile_id,
    ).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return None