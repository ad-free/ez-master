""" EZ Tool"""
import argparse
import enum
import getpass
import time
from ast import Pass
from datetime import datetime, timedelta

import httpx
from pyfiglet import Figlet

EZ_DATE_FORMAT = "%Y-%m-%d"
EZ_TIME_FORMAT = "%H:%M"
EZ_HOST = "https://hrtool.larion.com:3106"
EZ_DEFAULT_HEADERS = {"content-type:": "application/json"}

EZ_APIS = {
    "signin": f"{EZ_HOST}/api/Login/LoginFromWeb",
    "profile": f"{EZ_HOST}/api/HR_Employee/GetProfile",
    "wfh": f"{EZ_HOST}/api/HR_Mission/RegisterMission",
    "ot": f"{EZ_HOST}/api/TA_EmployeeOT/RegisterOT",
}


class EzException(Exception):
    """Ez Exception"""


class EzType(enum.Enum):
    """EZ TYPE"""
    OT = "OVER_TIME"
    OOO = "OUT_OF_OFFICE"
    WFH = "WORK_FROM_HOME"


class OTType(enum.Enum):
    """OverTime Type"""
    PLAN = 1
    ADDITIONAL = 0


class Password:
    """Ask for the password"""

    DEFAULT = "Prompt if not specified"

    def __init__(self, value):
        if value == self.DEFAULT:
            value = getpass.getpass("Your password: ")
        self.value = value

    def __str__(self):
        return self.value


def login(username: str, password: Password):
    """Login

    Args:
        username (str): The username
        password (str): The password

    Raises:
        EzException: Couldn't login into Ez server

    Returns:
        Token 
    """
    payload = {
        "UserName": username,
        "Password": password.value,
    }

    response = httpx.post(
        url=EZ_APIS["signin"],
        json=payload,
    )

    if response.status_code != 200:
        raise EzException("[!] Couldn't login into EZ.")
    return response.json()["Token"]


def get_user_id(token: str) -> str:
    """Get the user id

    Args:
        token (str): The token

    Returns:
        The user id
    """
    response = httpx.get(
        url=EZ_APIS["profile"],
        headers={"Authorization": f"bearer {token}"},
        timeout=3,
    )

    if response.status_code != 200:
        raise ValueError("Failed get the user profile.")
    return response.json()["Data"]["ID"]


def register_ot(
    token: str,
    user_id: str,
    dates: list,
    from_time: str,
    to_time: str,
    ot_type: int = OTType.PLAN.value,
    reason: str = "",
):
    """Register Overtime"""
    payload = {
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
            "IsTomorrowToTime": False
        },
        "Khoang2": None,
        "Khoang3": None,
        "OTIndex1": 0,
        "OTIndex2": 0,
        "OTIndex3": 0,
        "OTExamineFor1": 0,
        "OTExamineFor2": 0,
        "OTExamineFor3": 0,
        "ScaleForSalary1": 0,
        "ScaleForSalary2": 0,
        "ScaleForSalary3": 0,
        "WorkingPlace": "1",
        "NotifyEmail": [],
        "UserRequest": [user_id],
        "OTType": ot_type, 	# 1: Plan, 0: Additional
        "Reason1": {
            "GroupReason": None,
            "DetailReason": None,
            "NoteOT": ""
        },
        "Reason2": {
            "GroupReason": None,
            "DetailReason": None,
            "NoteOT": ""
        },
        "Reason3": {
            "GroupReason": None,
            "DetailReason": None,
            "NoteOT": ""
        }
    }

    print(f"[!] Registering OT for {user_id}")
    for date in dates:
        payload = {**payload, "From": f"{date}.000Z", "To": f"{date}.000Z"}
        response = httpx.post(url=EZ_APIS["ot"], json=payload, headers={"Authorization": f"bearer {token}"}, timeout=10)
        if response.status_code != 200:
            print(response.content)
            raise EzException("Couldn't register OT on Ez Tool")

    print(f"[!] WFH registration successful for {user_id}")


def register_wfh(token: str, user_id: str, dates: list, reason: str):
    """Register WFH

    Args:
        token (str): The token during calling the API
        user_id (str): The UserID
        dates (list): The date list
        reason (str): The WFH reason

    Raises:
        EzException: Couldn't register WFH
    """
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
        "GhiChu": "",
        "LyDo": reason,
        "TenCty": "",
        "DiaChiCT": "",
        "NguoiLienHe": "",
        "ThongTinLienLac": "",
        "NotifyEmail": [],
        "UserRequest": [user_id]
    }

    print(f"[!] Registing WFH for {user_id}")

    for date in dates:
        payload = {**payload, "From": f"{date}.000Z", "To": f"{date}.000Z"}
        response = httpx.post(
            url=EZ_APIS["wfh"], json=payload, headers={"Authorization": f"bearer {token}"}, timeout=10
        )

        if response.status_code != 200:
            print(response.content)
            raise EzException("Coudn't register WFH on EZ Tool.")

    print(f"[!] WFH registration successful for {user_id}")


def ez_master(script_args: argparse.Namespace):
    """Ez Master Script

    Args:
        script_args: ArgumentParser
    """
    token = login(username=script_args.username, password=script_args.password)
    user_id = get_user_id(token=token)

    from_date = datetime.strptime(script_args.from_date, EZ_DATE_FORMAT)
    to_date = datetime.strptime(script_args.to_date, EZ_DATE_FORMAT)

    if from_date > to_date:
        raise EzException("[!] You must pick to_date greater than from_date.")

    dates = [(from_date + timedelta(days=day)).isoformat() for day in range((to_date - from_date).days + 1)]

    match(script_args.type):
        case EzType.OT.value:
            if not script_args.from_time:
                raise EzException("You must enter from_time in OT.")
            if not script_args.to_time:
                raise EzException("You must enter to_time in OT.")
            from_time = time.strptime(script_args.from_time, EZ_TIME_FORMAT)
            to_time = time.strptime(script_args.to_time, EZ_TIME_FORMAT)
            register_ot(
                token=token,
                user_id=user_id,
                dates=dates,
                from_time=time.strftime(EZ_TIME_FORMAT, from_time),
                to_time=time.strftime(EZ_TIME_FORMAT, to_time),
                ot_type= OTType.PLAN.value if script_args.ot_type == OTType.PLAN.name else OTType.ADDITIONAL.value,
                reason=script_args.reason,
            )
        case EzType.WFH.value:
            register_wfh(
                token=token, user_id=user_id, dates=dates, reason=script_args.reason
            )
        case _:
            pass


parser = argparse.ArgumentParser(
    description=Figlet(font="small_slant").renderText("EZ Master Script"),
    formatter_class=argparse.RawDescriptionHelpFormatter,
    usage=argparse.SUPPRESS,
)
parser.add_argument(
    "-t", "--type", choices=[EzType.OOO.value, EzType.OT.value, EzType.WFH.value], required=True
)
parser.add_argument("-u", "--username", dest="username", help="Your username", required=True)
parser.add_argument(
    "-p", "--password", dest="password", type=Password, help="Your password", default=Password.DEFAULT
)
parser.add_argument(
    "-fd",
    "--from-date",
    dest="from_date",
    required=True,
    help="The date for the start of an important activity. E.g: 2024-09-20"
)
parser.add_argument(
    "-td",
    "--to-date",
    dest="to_date",
    required=True,
    help="The date for the end of an important activity. E.g: 2024-09-25"
)
parser.add_argument(
    "-ft",
    "--from-time",
    dest="from_time",
    help="The time for the start of an important activity. E.g: 10:30 or 20:00"
)
parser.add_argument(
    "-tt", "--to-time", dest="to_time", help="The time for the end of an important activity. E.g: 11:00 or 22:00"
)
parser.add_argument(
    "--ot-type", dest="ot_type", choices=[OTType.ADDITIONAL.name, OTType.PLAN.name], help="The OT type. Default is PLAN"
)
parser.add_argument(
    "--reason", dest="reason", default="", help="The reason when the user register OT or WFH. E.g: Weekly meeting"
)
args = parser.parse_args()

if __name__ == "__main__":
    ez_master(script_args=args)
