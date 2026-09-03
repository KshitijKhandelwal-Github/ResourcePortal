from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database import get_db
from resourceportal.schemas.certification import CertificationOut, CertificationCreate, CertificationUpdate
from resourceportal.models import Certification, Resource
from resourceportal.utils.dependencies import get_current_user
from resourceportal.models import User
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1", tags=["certifications"])

@router.get("/resources/{employee_id}/certifications", response_model=List[CertificationOut])
def get_certifications(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    return db.query(Certification).filter(Certification.resource_id == resource.id).all()

@router.post("/resources/{employee_id}/certifications", response_model=CertificationOut, status_code=status.HTTP_201_CREATED)
def create_certification(employee_id: str, cert: CertificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    
    if current_user.role == "user" and resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    db_cert = Certification(**cert.model_dump(), resource_id=resource.id)
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.put("/certifications/{certification_id}", response_model=CertificationOut)
def update_certification(certification_id: int, cert: CertificationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = db.query(Certification).filter(Certification.id == certification_id).first()
    if not db_cert:
        raise NotFoundException("Certification not found")
        
    resource = db.query(Resource).filter(Resource.id == db_cert.resource_id).first()
    if current_user.role == "user" and (not resource or resource.user_id != current_user.id):
         raise HTTPException(status_code=403, detail="Not permitted")
         
    update_data = cert.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_cert, k, v)
    db.commit()
    db.refresh(db_cert)
    return db_cert

