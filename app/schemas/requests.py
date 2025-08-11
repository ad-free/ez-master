from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

# from app.core.types import OTType
from app.utils.time import validate_time_format


class RegisterWFHRequest(BaseModel):
    from_date: str = Field(..., description="Start date YYYY-MM-DD")
    to_date: str = Field(..., description="End date YYYY-MM-DD")
    reason: str = Field("WFH as planned", description="Reason for WFH")


class RegisterOTRequest(RegisterWFHRequest):
    from_time: str = Field(..., description="Start time HH:MM")
    to_time: str = Field(..., description="End time HH:MM")
    ot_type: str = Field("PLAN", description="PLAN or ADDITIONAL")
    ot_benefit_type: str = Field("DILIGENCE", description="DILIGENCE or COMPENSATION or SALARY")

    @field_validator("from_time", "to_time")
    @classmethod
    def _validate_time(cls, value: str) -> str:
        return validate_time_format(value)

    @field_validator("ot_type")
    @classmethod
    def _validate_ot_type(cls, value: str) -> str:
        upper = value.upper()
        if upper not in ("PLAN", "ADDITIONAL"):
            raise ValueError("ot_type must be PLAN or ADDITIONAL")
        return upper

    @field_validator("ot_benefit_type")
    @classmethod
    def _validate_ot_benefit_type(cls, value: str) -> str:
        upper = value.upper()
        if upper not in ("DILIGENCE", "COMPENSATION", "SALARY"):
            raise ValueError("ot_benefit_type must be DILIGENCE, COMPENSATION or SALARY")
        return upper


