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
    "remote.mlp.com",
    "athome-kvh.mlp.com",
    "athome-kvh3.mlp.com",
    "athome-new-kvh.mlp.com",
    "athome-new-rfp.mlp.com",
    "athome-new-sid.mlp.com",
    "athome-new-slg.mlp.com",
    "athome-new-smt.mlp.com",
    "athome-new-tlc.mlp.com",
    "athome-rfp3.mlp.com",
    "athome-sf2.mlp.com",
    "athome-sid3.mlp.com",
    "athome-sid4.mlp.com",
    "athome-slg.mlp.com",
    "athome-slg3.mlp.com",
    "athome-smt.mlp.com",
    "athome-smt3.mlp.com",
    "athome-smt4.mlp.com",
    "athome-tlc.mlp.com",
    "athome-tlc3.mlp.com",
]

VPN_PORTAL_DEFAULT_PORT = 443
VPN_PORTAL_DEFAULT_TIMEOUT_S = 5.0
