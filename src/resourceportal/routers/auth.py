from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from resourceportal.database.database import get_db
from resourceportal.services.auth_service import verify_password, create_access_token, get_password_hash
from resourceportal.models.user import User
from resourceportal.schemas.user import LoginRequest, LoginResponse, UserCreate, UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    access_token = create_access_token(data={"sub": user.username})
    return LoginResponse(
        access_token=access_token,
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            cluster_id=user.cluster_id,
            is_active=user.is_active,
        ),
    )

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        role=user.role,
        cluster_id=user.cluster_id,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
