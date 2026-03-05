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
}

# Connectivity checks (used by /connections endpoint)
VPN_PORTAL_HOSTS = [
    "athome-sg.mlp.com",
    "athome-new-kvh.mlp.com",
    "athome-new-sid.mlp.com",
    "athome-sid3.mlp.com",
    "athome-sid4.mlp.com",
    "remote.mlp.com",
]

VPN_PORTAL_DEFAULT_PORT = 443
VPN_PORTAL_DEFAULT_TIMEOUT_S = 5.0
