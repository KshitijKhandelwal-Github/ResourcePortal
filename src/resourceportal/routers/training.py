from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.training import TrainingOut, TrainingCreate, TrainingUpdate
from resourceportal.models.training import Training
from resourceportal.models.resource import Resource
from resourceportal.utils.dependencies import get_current_user
from resourceportal.models.user import User
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1", tags=["training"])

@router.get("/resources/{employee_id}/training", response_model=List[TrainingOut])
def get_training(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    return db.query(Training).filter(Training.resource_id == resource.id).all()

@router.post("/resources/{employee_id}/training", response_model=TrainingOut, status_code=status.HTTP_201_CREATED)
def create_training(employee_id: str, training: TrainingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    
    if current_user.role == "user" and resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    db_training = Training(**training.model_dump(), resource_id=resource.id)
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@router.put("/training/{training_id}", response_model=TrainingOut)
def update_training(training_id: int, training: TrainingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_training = db.query(Training).filter(Training.id == training_id).first()
    if not db_training:
        raise NotFoundException("Training not found")
        
    resource = db.query(Resource).filter(Resource.id == db_training.resource_id).first()
    if current_user.role == "user" and (not resource or resource.user_id != current_user.id):
         raise HTTPException(status_code=403, detail="Not permitted")
         
    update_data = training.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_training, k, v)
    db.commit()
    db.refresh(db_training)
    return db_training

