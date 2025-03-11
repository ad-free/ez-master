#!/bin/bash

export ACTION_NAME=$1
export FROM_DATE=$2
export TO_DATE=$3
export PY_SCRIPT="python scripts/ez_master.py -u duyta@larion.com"

test $FROM_TIME || export FROM_TIME="21:00"
test $TO_TIME || export TO_TIME="23:00"

echo "[!] Activating python environment..."
source venv/Scripts/activate

echo "[!] Running the script..."

if [[ $ACTION_NAME == "WFH" ]]; then
	$PY_SCRIPT -t WORK_FROM_HOME -fd $FROM_DATE -td $TO_DATE --reason "WFH as planned"
elif [[ $ACTION_NAME == "OT" ]]; then
	$PY_SCRIPT -t OVER_TIME -fd $FROM_DATE -td $TO_DATE -ft $FROM_TIME -tt $TO_TIME
fi
