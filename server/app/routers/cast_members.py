from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/cast-members", tags=["cast-members"])


@router.post("/", response_model=schemas.CastMemberOut, status_code=status.HTTP_201_CREATED)
def create_cast_member(
    cast_in: schemas.CastMemberCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    new_cast = models.CastMember(name=cast_in.name, photo_url=cast_in.photo_url)
    db.add(new_cast)
    db.commit()
    db.refresh(new_cast)
    return new_cast


@router.get("/", response_model=list[schemas.CastMemberOut])
def list_cast_members(db: Session = Depends(get_db)):
    return db.query(models.CastMember).all()


@router.delete("/{cast_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cast_member(
    cast_id: str,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    cast = db.query(models.CastMember).filter(models.CastMember.id == cast_id).first()
    if not cast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cast member not found")
    db.delete(cast)
    db.commit()
    return None