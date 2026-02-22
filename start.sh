#!/bin/bash

# --- Configuration (override with env vars) ---
ACTION_NAME="${1:-}"
FROM_DATE="${2:-}"
TO_DATE="${3:-}"
WFH_REASON="${4:-WFH as planned}"
OT_REASON="${4:-Weekly meeting}"
FROM_TIME="${FROM_TIME:-21:00}"
TO_TIME="${TO_TIME:-23:00}"
PY_CMD=(python scripts/ez_master.py -u duyta@larion.com)

# Detect OS for venv activation
if [[ -f .venv/Scripts/activate ]]; then
  VENV_ACTIVATE=".venv/Scripts/activate"
elif [[ -f .venv/bin/activate ]]; then
  VENV_ACTIVATE=".venv/bin/activate"
else
  echo "[!] No virtualenv found at .venv/Scripts/activate or .venv/bin/activate"
  exit 1
fi

show_help() {
  cat << 'EOF'
Usage: ./start.sh <ACTION> [FROM_DATE] [TO_DATE] [REASON]
       ./start.sh salary [SALARY_DATE]
       ./start.sh help

Actions:
  WFH     Register work-from-home for a date range.
  OT      Register overtime for a date range (optional time/reason).
  salary  Download salary PDF for a month (default: current month).

Arguments (WFH / OT):
  FROM_DATE   Start date (optional). Format: YYYY-MM-DD  Default: today
  TO_DATE     End date (optional).   Format: YYYY-MM-DD  Default: today
  REASON      Reason (optional, 4th arg). WFH default: "WFH as planned". OT default: "Weekly meeting"

Arguments (salary):
  SALARY_DATE Optional. Format: YYYY-MM  e.g. 2025-02  (default: current month)

Environment (optional):
  FROM_TIME   OT start time (default: 21:00)
  TO_TIME    OT end time (default: 23:00)

Examples:
  ./start.sh WFH                                    # WFH for today only
  ./start.sh WFH 2025-02-01 2025-02-07 "Family errands"
  ./start.sh OT 2025-02-01 2025-02-07 "Sprint planning"
  ./start.sh salary
  ./start.sh salary 2025-01
  ./start.sh help
EOF
}

run_script() {
  echo "[!] Activating Python environment..."
  # shellcheck source=/dev/null
  source "$VENV_ACTIVATE"
  echo "[!] Running the script..."
  "${PY_CMD[@]}" "$@"
}

# Ensure FROM_DATE <= TO_DATE (YYYY-MM-DD string comparison is valid). Auto-fix to single day if reversed.
normalize_date_range() {
  if [[ "$FROM_DATE" > "$TO_DATE" ]]; then
    echo "[!] Start date ($FROM_DATE) is after end date ($TO_DATE). Using single day: $FROM_DATE"
    TO_DATE="$FROM_DATE"
  fi
}

# --- Main ---
ACTION_UPPER="$(echo "$ACTION_NAME" | tr '[:lower:]' '[:upper:]')"
case "$ACTION_UPPER" in
  HELP|-H|--HELP)
    show_help
    exit 0
    ;;
  WFH)
    TODAY="$(date +%Y-%m-%d)"
    FROM_DATE="${FROM_DATE:-$TODAY}"
    TO_DATE="${TO_DATE:-$TODAY}"
    normalize_date_range
    run_script -t WORK_FROM_HOME -fd "$FROM_DATE" -td "$TO_DATE" --reason "$WFH_REASON"
    ;;
  OT)
    TODAY="$(date +%Y-%m-%d)"
    FROM_DATE="${FROM_DATE:-$TODAY}"
    TO_DATE="${TO_DATE:-$TODAY}"
    normalize_date_range
    run_script -t OVER_TIME -fd "$FROM_DATE" -td "$TO_DATE" -ft "$FROM_TIME" -tt "$TO_TIME" --reason "$OT_REASON"
    ;;
  SALARY)
    SALARY_DATE="${FROM_DATE:-}"  # reuse 2nd arg as YYYY-MM or leave empty for default
    if [[ -n "$SALARY_DATE" ]]; then
      run_script -t SALARY --is-download-salary --salary-date "$SALARY_DATE"
    else
      run_script -t SALARY --is-download-salary
    fi
    ;;
  "")
    echo "[!] No action given."
    show_help
    exit 1
    ;;
  *)
    echo "[!] Unknown action: $ACTION_NAME"
    echo "    Supported: WFH, OT, salary, help"
    exit 1
    ;;
esac
