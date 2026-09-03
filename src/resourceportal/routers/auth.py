from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from resourceportal.database import get_db
from resourceportal.services.auth_service import verify_password, create_access_token, get_password_hash
from resourceportal.models import User
from resourceportal.schemas.user import LoginRequest, LoginResponse, Token, UserCreate, UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

def _authenticate(username: str, password: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    return user

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = _authenticate(login_data.username, login_data.password, db)
    access_token = create_access_token(data={"sub": user.username})
    return LoginResponse(
        access_token=access_token,
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            cluster_id=None,
            is_active=user.is_active,
        ),
    )

@router.post("/token", response_model=Token, include_in_schema=False)
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = _authenticate(form_data.username, form_data.password, db)
    return {"access_token": create_access_token(data={"sub": user.username}), "token_type": "bearer"}

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
        password_hash=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
