EZ_DATE_FORMAT = "%Y-%m-%d"
EZ_TIME_FORMAT = "%H:%M"
EZ_HOST = "https://hrtool.larion.com:3106"
EZ_DEFAULT_HEADERS = {"content-type": "application/json"}

EZ_APIS = {
    "signin": f"{EZ_HOST}/api/Login/LoginFromWeb",
    "profile": f"{EZ_HOST}/api/HR_Employee/GetProfile",
    "wfh": f"{EZ_HOST}/api/HR_Mission/RegisterMission",
    "ot": f"{EZ_HOST}/api/TA_EmployeeOT/RegisterOT",
    "salary_info": f"{EZ_HOST}/api/PR_SalaryInfo/GetPayslipDetail",
    "tickets": f"{EZ_HOST}/api/PT_Event/GetEventDetail",
    "reject_ticket": f"{EZ_HOST}/api/PT_Event/UpdateTicketWithNote",
    "calendar": f"{EZ_HOST}/api/TA_CalendarTimecardDate/GetDataOnCalendar",
}

