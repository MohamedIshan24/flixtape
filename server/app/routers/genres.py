from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/genres", tags=["genres"])


@router.post("/", response_model=schemas.GenreOut, status_code=status.HTTP_201_CREATED)
def create_genre(
    genre_in: schemas.GenreCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    existing = db.query(models.Genre).filter(models.Genre.name == genre_in.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genre already exists")

    new_genre = models.Genre(name=genre_in.name)
    db.add(new_genre)
    db.commit()
    db.refresh(new_genre)
    return new_genre


@router.get("/", response_model=list[schemas.GenreOut])
def list_genres(db: Session = Depends(get_db)):
    return db.query(models.Genre).all()


@router.delete("/{genre_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_genre(
    genre_id: str,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    genre = db.query(models.Genre).filter(models.Genre.id == genre_id).first()
    if not genre:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genre not found")
    db.delete(genre)
    db.commit()
    return None