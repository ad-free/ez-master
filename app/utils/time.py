import time as _time

from app.core.constants import EZ_TIME_FORMAT


def validate_time_format(value: str) -> str:
    parsed = _time.strptime(value, EZ_TIME_FORMAT)
    return _time.strftime(EZ_TIME_FORMAT, parsed)


