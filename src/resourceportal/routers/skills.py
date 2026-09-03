from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database import get_db
from resourceportal.schemas.skill import SkillOut, SkillCreate, SkillUpdate
from resourceportal.models import Skill
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/skills", tags=["skills"])

@router.get("", response_model=List[SkillOut])
def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.post("", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/{skill_id}", response_model=SkillOut)
def update_skill(skill_id: int, skill: SkillUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise NotFoundException("Skill not found")
    update_data = skill.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_skill, k, v)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise NotFoundException("Skill not found")
    db.delete(db_skill)
    db.commit()

