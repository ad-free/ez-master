from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, Tuple

import os
import httpx

from app.core.constants import EZ_APIS
from app.core.exceptions import EzException
from app.core.types import OTBenefitType, TicketStatus


def check_permission(username: str) -> bool:
    """Check if EZ Tool integration is permitted.

    Returns:
        bool: True if permitted, False otherwise.
    """
    user_whitelist = os.environ.get("USER_WHITELIST", None)
    if not user_whitelist:
        return True  # Enable full access if no whitelist is set
    return username in user_whitelist.split(",")


class EzClient:
    """Client wrapper for EZ APIs."""

    def login(self, username: str, password: str) -> str:
        if not check_permission(username):
            raise EzException(f"User ({username}) is not permitted to use EZ Tool integration.")

        payload = {"UserName": username, "Password": password}
        response = httpx.post(url=EZ_APIS["signin"], json=payload, timeout=10)
        if response.status_code != 200:
            raise EzException("Couldn't login into EZ.")
        return response.json()["Token"]

    def get_user_profile(self, token: str) -> dict:
        response = httpx.get(
            url=EZ_APIS["profile"],
            headers={"Authorization": f"bearer {token}"},
            timeout=10,
        )
        if response.status_code != 200:
            raise EzException("Failed to get the user profile.")
        return response.json()["Data"]

    def register_wfh(
        self, *, token: str, user_id: str, from_date: str, to_date: str, reason: str
    ) -> None:
        payload = {
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
            "GhiChu": reason,
            "LyDo": reason,
            "TenCty": "",
            "DiaChiCT": "",
            "NguoiLienHe": "",
            "ThongTinLienLac": "",
            "NotifyEmail": [],
            "UserRequest": [user_id],
            "From": f"{from_date}T00:00:00.000Z",
            "To": f"{to_date}T00:00:00.000Z",
        }

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
            "GhiChu": reason,
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

    def download_salary_pdf(
        self, token: str, date: str | None = None
    ) -> Tuple[str, bytes]:
        if not date:
            date = datetime.now(timezone.utc).strftime("%Y-%m")
        payload = {"monthYear": date}
        try:
            get_salary_info = httpx.get(
                url=EZ_APIS["salary_info"],
                params=payload,
                headers={"Authorization": f"bearer {token}"},
                timeout=20,
            )
            get_salary_info.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise EzException(
                f"Failed to get salary info: {exc.response.status_code} - {exc.response.text}"
            ) from exc
        salary_info = get_salary_info.json().get("Data")
        if not salary_info or not salary_info.get("Path"):
            raise EzException("Salary info not available for the specified date.")
        try:
            response = httpx.get(
                url=salary_info["Path"],
                headers={"Authorization": f"bearer {token}"},
                timeout=30,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise EzException(
                f"Failed to download salary PDF: {exc.response.status_code} - {exc.response.text}"
            ) from exc
        filename = f"salary_{date}.pdf"
        return filename, response.content

    def get_all_tickets(
        self,
        token: str,
        ticket_status: str = TicketStatus.Pending.name,
        page_size=100,
    ) -> list[dict]:
        """_summary_

        Args:
            token (str): _description_

        Raises:
            EzException: _description_

        Returns:
            list[dict]: _description_
        """

        response = httpx.get(
            url=EZ_APIS["tickets"],
            headers={"Authorization": f"bearer {token}"},
            timeout=15,
            params={
                "type": ticket_status,
                "pagingID": 0,
                "pageSize": page_size,
            },
        )

        if response.status_code != 200:
            raise EzException("Couldn't fetch tickets from EZ Tool.")

        return response.json().get("Data", [])

    def get_calendar_data(
        self,
        token: str,
        employee_atid: str,
        from_date: str,
        to_date: str,
        language: str = "vi",
    ) -> list[dict]:
        response = httpx.get(
            url=EZ_APIS["calendar"],
            headers={"Authorization": f"bearer {token}"},
            timeout=15,
            params={
                "employeeAtid": employee_atid,
                "fromDate": from_date,
                "toDate": to_date,
                "language": language,
            },
        )
        if response.status_code != 200:
            raise EzException("Couldn't fetch calendar data from EZ Tool.")
        return response.json()

    def reject_ticket_by_id(self, token: str, ticket_id: int) -> None:
        payload = {
            "TicketID": ticket_id,
            "Reason": "Cancel",
            "Status": "Cancel",
        }

        response = httpx.post(
            url=f"{EZ_APIS['reject_ticket']}",
            headers={
                "Authorization": f"bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=15,
            json=payload,
        )

        if response.status_code != 200:
            raise EzException(f"Couldn't reject ticket ID {ticket_id} on EZ Tool.")
