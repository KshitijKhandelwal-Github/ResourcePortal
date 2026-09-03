from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database import get_db
from resourceportal.schemas.location import LocationOut, LocationCreate, LocationUpdate
from resourceportal.models import Location
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])

@router.get("", response_model=List[LocationOut])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(location: LocationCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = Location(**location.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: int, location: LocationUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise NotFoundException("Location not found")
    update_data = location.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_location, k, v)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise NotFoundException("Location not found")
    db.delete(db_location)
    db.commit()

