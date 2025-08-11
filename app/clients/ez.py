from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, Tuple

import httpx

from app.core.constants import EZ_APIS
from app.core.types import OTBenefitType
from app.core.exceptions import EzException


class EzClient:
    """Client wrapper for EZ APIs."""

    def login(self, username: str, password: str) -> str:
        payload = {"UserName": username, "Password": password}
        response = httpx.post(url=EZ_APIS["signin"], json=payload, timeout=10)
        if response.status_code != 200:
            raise EzException("Couldn't login into EZ.")
        return response.json()["Token"]

    def get_user_profile(self, token: str) -> dict:
        response = httpx.get(
            url=EZ_APIS["profile"], headers={"Authorization": f"bearer {token}"}, timeout=10
        )
        if response.status_code != 200:
            raise EzException("Failed to get the user profile.")
        return response.json()["Data"]

    def register_wfh(self, *, token: str, user_id: str, dates: Iterable[str], reason: str) -> None:
        base_payload = {
            "Type": "day",
            "NhomPhuCap": None,
            "IsTomorrowFromTime": False,
            "IsTomorrowToTime": False,
            "FromTime": "08:00:00",
            "ToTime": "08:00:00",
            "CTPhi": "",
            "Distance": 0,
            "PhuongTienDiChuyen": "",
            "LoaiCongTac": 6,
            "GhiChu": "",
            "LyDo": reason,
            "TenCty": "",
            "DiaChiCT": "",
            "NguoiLienHe": "",
            "ThongTinLienLac": "",
            "NotifyEmail": [],
            "UserRequest": [user_id],
        }

        for date in dates:
            payload = {**base_payload, "From": f"{date}.000Z", "To": f"{date}.000Z"}
            response = httpx.post(
                url=EZ_APIS["wfh"],
                json=payload,
                headers={"Authorization": f"bearer {token}"},
                timeout=15,
            )
            if response.status_code != 200:
                raise EzException(
                    f"Couldn't register WFH on EZ Tool. Status: {response.status_code}. Body: {response.text}"
                )

    def register_ot(
        self,
        *,
        token: str,
        user_id: str,
        dates: Iterable[str],
        from_time: str,
        to_time: str,
        ot_type: int,
        ot_benefit_type: OTBenefitType = OTBenefitType.DILIGENCE,
        reason: str = "",
    ) -> None:
        base_payload = {
            "Type": "Period",
            "GhiChu": "",
            "CaDau": 0,
            "CaGiua": 0,
            "CaCuoi": 0,
            "ReasonOT": reason,
            "Khoang1": {
                "FromTime": f"{from_time}:00",
                "ToTime": f"{to_time}:00",
                "IsTomorrowFromTime": False,
                "IsTomorrowToTime": False,
            },
            "Khoang2": None,
            "Khoang3": None,
            "OTIndex1": 0,
            "OTIndex2": 0,
            "OTIndex3": 0,
            "OTExamineFor1": ot_benefit_type.value,
            "OTExamineFor2": ot_benefit_type.value,
            "OTExamineFor3": ot_benefit_type.value,
            "ScaleForSalary1": 0,
            "ScaleForSalary2": 0,
            "ScaleForSalary3": 0,
            "WorkingPlace": "1",
            "NotifyEmail": [],
            "UserRequest": [user_id],
            "OTType": ot_type,
            "Reason1": {"GroupReason": None, "DetailReason": None, "NoteOT": ""},
            "Reason2": {"GroupReason": None, "DetailReason": None, "NoteOT": ""},
            "Reason3": {"GroupReason": None, "DetailReason": None, "NoteOT": ""},
        }

        for date in dates:
            payload = {**base_payload, "From": f"{date}.000Z", "To": f"{date}.000Z"}
            response = httpx.post(
                url=EZ_APIS["ot"],
                json=payload,
                headers={"Authorization": f"bearer {token}"},
                timeout=15,
            )
            if response.status_code != 200:
                raise EzException(
                    f"Couldn't register OT on EZ Tool. Status: {response.status_code}. Body: {response.text}"
                )

    def download_salary_pdf(self, token: str, date: str | None = None) -> Tuple[str, bytes]:
        if not date:
            date = datetime.now(timezone.utc).strftime("%Y-%m")
        payload = {"monthYear": date}
        get_salary_info = httpx.get(
            url=EZ_APIS["salary_info"],
            params=payload,
            headers={"Authorization": f"bearer {token}"},
            timeout=20,
        )
        get_salary_info.raise_for_status()
        salary_info = get_salary_info.json().get("Data")
        if not salary_info or not salary_info.get("Path"):
            raise EzException("Salary info not available for the specified date.")
        response = httpx.get(
            url=salary_info["Path"], headers={"Authorization": f"bearer {token}"}, timeout=30
        )
        response.raise_for_status()
        filename = f"salary_{date}.pdf"
        return filename, response.content


