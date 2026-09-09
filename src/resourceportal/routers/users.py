from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database import get_db
from resourceportal.schemas.user import UserOut, UserUpdate
from resourceportal.models import User
from resourceportal.utils.dependencies import require_role, get_current_user
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/users", tags=["users"])

def user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        employee_id=(
            user.resource.employee_id
            if user.resource
            else None
        ),
    )

@router.get("", response_model=List[UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"]))
):
    return [
        user_to_out(user)
        for user in db.query(User).all()
    ]


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise NotFoundException(detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise NotFoundException(detail="User not found")

    db.delete(db_user)
    db.commit()