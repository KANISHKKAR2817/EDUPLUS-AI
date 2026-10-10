from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import AuditLog, User

def log_audit_event(
    db: Session,
    action: str,
    actor: Optional[User] = None,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    details: Optional[str] = None
):
    """Secure audit logger for critical actions in EduPulse AI."""
    audit_entry = AuditLog(
        actor_id=actor.id if actor else None,
        actor_role=actor.role if actor else "system",
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
    return audit_entry
