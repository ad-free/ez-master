import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { CalendarDayData, CalendarEvent } from '../types/api';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Popover,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Work,
  Weekend,
  FlightTakeoff,
  Timer,
} from '@mui/icons-material';
import { apiClient } from '../services/apiClient';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const today = new Date();
const TODAY_KEY = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const monthDataCache = new Map<string, CalendarDayData[]>();

const typeTimeCardLabel = (value: number | null | undefined): string => {
  switch (value) {
    case 0: return 'Office';
    case 1: return 'Hybrid';
    case 2: return 'On-site';
    case 4: return 'Day Off';
    case 5: return 'Remote';
    default: return value != null ? `Type ${value}` : '—';
  }
};

const eventIcon = (type: number) => {
  switch (type) {
    case 2: return <Timer sx={{ fontSize: 14 }} />;
    case 3: return <FlightTakeoff sx={{ fontSize: 14 }} />;
    default: return null;
  }
};

interface DayCellProps {
  day: number;
  dateKey: string;
  dayEvents: CalendarEvent[];
  isToday: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>, day: number) => void;
}

const DayCell = React.memo<DayCellProps>(({ day, dayEvents, isToday, onClick }) => {
  const mainEvent = dayEvents.find((e) => e.Type === 0);

  const bgColor = mainEvent?.Style?.Background || 'transparent';
  const typeTimeCard = mainEvent?.Style?.TypeTimeCard ?? -1;

  const isDayOff = typeTimeCard === 4;
  const accentColor = bgColor !== 'transparent' ? bgColor : null;
  const hasEvents = dayEvents.length > 0;

  return (
    <Box
      onClick={(e) => onClick(e, day)}
      sx={{
        minHeight: 120,
        p: 0.75,
        borderRight: '1px solid rgba(226, 232, 240, 0.8)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        '&:nth-of-type(7n)': { borderRight: 'none' },
        cursor: hasEvents ? 'pointer' : 'default',
        backgroundColor: isToday ? 'rgba(99, 102, 241, 0.04)' : '#fff',
        transition: 'background-color 0.15s',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.06)',
        },
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {accentColor && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: accentColor,
          }}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mr: 0.25 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isToday ? 'primary.main' : 'transparent',
            color: isToday ? '#fff' : 'text.primary',
            fontWeight: isToday ? 800 : 500,
            fontSize: '0.8rem',
          }}
        >
          {day}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
        {dayEvents.map((ev, i) => {
          const isMain = ev.Type === 0;
          const chipBg = isMain ? (ev.Style?.Background || 'transparent') : 'rgba(0,0,0,0.03)';
          const chipBorder = isMain ? (ev.Style?.Border || 'transparent') : 'none';
          const chipText = isMain ? (ev.Style?.Text || 'inherit') : 'text.secondary';
          return (
            <Box
              key={i}
              sx={{
                px: 0.5,
                py: 0.2,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                bgcolor: chipBg,
                border: isMain && chipBorder !== 'none' ? `1px solid ${chipBorder}` : 'none',
              }}
            >
              {isMain ? (
                isDayOff ? <Weekend sx={{ fontSize: 11, color: chipText }} />
                  : <Work sx={{ fontSize: 11, color: chipText }} />
              ) : eventIcon(ev.Type)}
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: chipText,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}
              >
                {ev.Title}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

const PaddedCell = React.memo(() => (
  <Box
    sx={{
      minHeight: 110,
      backgroundColor: 'rgba(248, 250, 252, 0.5)',
      borderRight: '1px solid rgba(226, 232, 240, 0.8)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      '&:nth-of-type(7n)': { borderRight: 'none' },
    }}
  />
));

const TimecardCalendar: React.FC = () => {
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [data, setData] = useState<CalendarDayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateLabel, setSelectedDateLabel] = useState('');

  const fetchData = useCallback(async () => {
    setError(null);
    const monthKey = `${viewYear}-${viewMonth}`;

    const cached = monthDataCache.get(monthKey);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    try {
      const month = String(viewMonth + 1).padStart(2, '0');
      const lastDayNum = new Date(viewYear, viewMonth + 1, 0).getDate();
      const fromDate = `${viewYear}-${month}-01T00:00:00.000Z`;
      const toDate = `${viewYear}-${month}-${String(lastDayNum).padStart(2, '0')}T00:00:00.000Z`;
      const result: any = await apiClient.getCalendarData(fromDate, toDate);
      const normalized = Array.isArray(result) ? result : result?.Data || result?.data || [];
      monthDataCache.set(monthKey, normalized);
      setData(normalized);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    if (Array.isArray(data)) {
      data.forEach((day) => {
        if (day?.Date) {
          map.set(day.Date, Array.isArray(day.Data) ? day.Data : []);
        }
      });
    }
    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewYear, viewMonth]);

  const handleDayCellClick = useCallback((event: React.MouseEvent<HTMLElement>, day: number) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = dataByDate.get(dateKey);
    if (dayEvents && dayEvents.length > 0) {
      setSelectedEvents(dayEvents);
      setSelectedDateLabel(`${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`);
      setAnchorEl(event.currentTarget);
    }
  }, [viewYear, viewMonth, dataByDate]);

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedEvents([]);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  if (error && data.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
        <Typography variant="body2" color="error" fontWeight={500}>
          {error}
        </Typography>
      </Box>
    );
  }

  const popoverOpen = Boolean(anchorEl);

  return (
    <Box>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Typography>
          <Chip
            label={`${data.length} day${data.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.08)',
              color: 'primary.main',
              fontWeight: 700,
              borderRadius: 2,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={goToday}
            size="small"
            startIcon={<Today fontSize="small" />}
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'rgba(226, 232, 240, 1)',
              color: 'text.secondary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            Today
          </Button>
          <IconButton
            onClick={prevMonth}
            size="small"
            sx={{ borderRadius: 2, border: '1px solid rgba(226, 232, 240, 1)', '&:hover': { borderColor: 'primary.main' } }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={nextMonth}
            size="small"
            sx={{ borderRadius: 2, border: '1px solid rgba(226, 232, 240, 1)', '&:hover': { borderColor: 'primary.main' } }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Error banner when we have stale data to show */}
      {error && data.length > 0 && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
          {error}
        </Typography>
      )}

      {/* Weekday Headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
        {WEEKDAYS.map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              py: 1,
              typography: 'caption',
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <PaddedCell key={`pad-${idx}`} />;
          }

          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = dataByDate.get(dateKey) || [];
          const isToday = dateKey === TODAY_KEY;

          return (
            <DayCell
              key={dateKey}
              day={day}
              dateKey={dateKey}
              dayEvents={dayEvents}
              isToday={isToday}
              onClick={handleDayCellClick}
            />
          );
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#fbbc04' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>HC (Special)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#ea4335' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>HC (Office)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#9aa0a6' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Day Off</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', border: '1.5px solid #9aa0a6', backgroundColor: 'transparent' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Remote / Other</Typography>
        </Box>
      </Box>

      {/* Event Detail Popover */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: 3,
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.1)',
            minWidth: 300,
            maxWidth: 380,
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(20,184,166,0.04) 100%)',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {selectedDateLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {selectedEvents.map((ev, index) => (
            <Box key={index}>
              {index > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: ev.Style?.Background || 'rgba(99, 102, 241, 0.08)',
                    color: ev.Style?.Text || 'primary.main',
                    flexShrink: 0,
                  }}
                >
                  {ev.Type === 0 ? (ev.Style?.TypeTimeCard === 4 ? <Weekend /> : <Work />) : eventIcon(ev.Type)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ev.Title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ev.Type === 0
                      ? typeTimeCardLabel(ev.Style?.TypeTimeCard)
                      : ev.Type === 2
                      ? 'Overtime'
                      : ev.Type === 3
                      ? 'Business Trip'
                      : `Type ${ev.Type}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default React.memo(TimecardCalendar);
