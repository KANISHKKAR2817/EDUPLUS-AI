from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, get_current_user
from app.models.models import User, StudentProfile, TeacherProfile
from app.schemas.schemas import Token, LoginRequest, UserResponse
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "username": user.username},
        expires_delta=access_token_expires,
    )

    log_audit_event(
        db=db,
        action="USER_LOGIN",
        actor=user,
        target_type="User",
        target_id=user.id,
        details=f"User {user.username} logged in with role {user.role}"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "username": user.username,
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }
    if current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        profile_data["student_id"] = sp.id
        profile_data["roll_number"] = sp.roll_number
        profile_data["department"] = sp.department
        profile_data["semester"] = sp.semester
        profile_data["cgpa"] = sp.cgpa
    elif current_user.role == "teacher" and current_user.teacher_profile:
        tp = current_user.teacher_profile
        profile_data["teacher_id"] = tp.id
        profile_data["employee_id"] = tp.employee_id
        profile_data["department"] = tp.department
        profile_data["designation"] = tp.designation
    return profile_data

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns documented demo accounts for rapid testing during hackathon review."""
    return [
        {
            "role": "teacher",
            "username": "dr.kavitha",
            "password": "Password123!",
            "label": "Dr. Kavitha (Head of Dept / Faculty)",
            "description": "Full access to cohort risk analytics, student interventions, grading, and reports."
        },
        {
            "role": "student",
            "username": "arun.kumar",
            "password": "Password123!",
            "label": "Arun Kumar (Flagged Student - High Concern)",
            "description": "Student flagged due to declining test scores in Java Arrays & 2 missed assignments."
        },
        {
            "role": "student",
            "username": "deepa.s",
            "password": "Password123!",
            "label": "Deepa Sundaram (Balanced Student - Low Concern)",
            "description": "Consistent high attendance (92%) and top marks across data structures."
        },
        {
            "role": "admin",
            "username": "admin",
            "password": "Password123!",
            "label": "System Administrator",
            "description": "Academic system configuration, data reset, and audit trail inspection."
        }
    ]
