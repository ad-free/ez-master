from enum import Enum


class OTType(Enum):
    PLAN = 1
    ADDITIONAL = 0


class OTBenefitType(Enum):
    """OT Benefit type"""

    SALARY = 0
    COMPENSATION = 1
    DILIGENCE = 2
