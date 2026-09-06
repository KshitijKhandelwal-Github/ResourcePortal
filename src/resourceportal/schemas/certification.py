from typing import Optional

from pydantic import BaseModel


class CertificationBase(BaseModel):
    certification_name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(BaseModel):
    certification_name: Optional[str] = None
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None


class CertificationOut(BaseModel):
    id: int
    resource_id: int
    certification_name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None

    class Config:
        from_attributes = True
