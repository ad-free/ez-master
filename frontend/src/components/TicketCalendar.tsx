import React, { useMemo, useState, useCallback } from 'react';
import type { Ticket } from '../types/api';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Popover,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Cancel,
  Person,
  Description,
  HowToReg,
  ConfirmationNumber,
} from '@mui/icons-material';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  onReject: (ticketId: number | string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const today = new Date();
const TODAY_KEY = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' },
  Approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' },
  Rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)' },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.3)' };
}

function parseTicketDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // ignore
  }
  return null;
}

interface DayCellProps {
  day: number;
  dateKey: string;
  dayTickets: Ticket[];
  isToday: boolean;
  onDayClick: (event: React.MouseEvent<HTMLElement>, day: number) => void;
  onChipClick: (event: React.MouseEvent<HTMLElement>, ticket: Ticket) => void;
}

const DayCell = React.memo<DayCellProps>(({ day, dayTickets, isToday, onDayClick, onChipClick }) => {
  const hasTickets = dayTickets.length > 0;

  return (
    <Box
      onClick={(e) => onDayClick(e, day)}
      sx={{
        minHeight: 100,
        p: 1,
        borderRight: '1px solid rgba(226, 232, 240, 0.8)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        '&:nth-of-type(7n)': { borderRight: 'none' },
        cursor: hasTickets ? 'pointer' : 'default',
        backgroundColor: isToday
          ? 'rgba(99, 102, 241, 0.04)'
          : 'rgba(255,255,255,1)',
        transition: 'background-color 0.15s',
        '&:hover': hasTickets ? {
          backgroundColor: 'rgba(99, 102, 241, 0.06)',
        } : {},
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isToday ? 'primary.main' : 'transparent',
            color: isToday ? 'common.white' : 'text.primary',
            fontWeight: isToday ? 800 : 500,
            fontSize: '0.875rem',
          }}
        >
          {day}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: 0.5 }}>
        {dayTickets.slice(0, 2).map((t) => {
          const style = getStatusStyle(t.status);
          return (
            <Box
              key={t.ticket_id}
              onClick={(e) => onChipClick(e, t)}
              sx={{
                px: 0.75,
                py: 0.35,
                borderRadius: 1.5,
                backgroundColor: style.bg,
                border: style.border,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { filter: 'brightness(0.95)' },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: style.color,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                #{t.ticket_id} {t.owner}
              </Typography>
            </Box>
          );
        })}
        {dayTickets.length > 2 && (
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'primary.main',
              px: 0.5,
            }}
          >
            +{dayTickets.length - 2} more
          </Typography>
        )}
      </Box>
    </Box>
  );
});

const PaddedCell = React.memo(() => (
  <Box
    sx={{
      minHeight: 100,
      backgroundColor: 'rgba(248, 250, 252, 0.5)',
      borderRight: '1px solid rgba(226, 232, 240, 0.8)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      '&:nth-of-type(7n)': { borderRight: 'none' },
    }}
  />
));

const TicketCalendar: React.FC<Props> = ({ tickets, loading, onReject }) => {
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [selectedDateLabel, setSelectedDateLabel] = useState('');

  const { ticketsByDate, unscheduledTickets } = useMemo(() => {
    const byDate = new Map<string, Ticket[]>();
    const unscheduled: Ticket[] = [];
    tickets.forEach((t) => {
      const key = parseTicketDate(t.created_at);
      if (key) {
        const existing = byDate.get(key);
        if (existing) {
          existing.push(t);
        } else {
          byDate.set(key, [t]);
        }
      } else {
        unscheduled.push(t);
      }
    });
    return { ticketsByDate: byDate, unscheduledTickets: unscheduled };
  }, [tickets]);

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
    const dayTickets = ticketsByDate.get(dateKey);
    if (dayTickets && dayTickets.length > 0) {
      setSelectedTickets(dayTickets);
      setSelectedDateLabel(`${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`);
      setAnchorEl(event.currentTarget);
    }
  }, [viewYear, viewMonth, ticketsByDate]);

  const handleChipClick = useCallback((event: React.MouseEvent<HTMLElement>, ticket: Ticket) => {
    event.stopPropagation();
    setSelectedTickets([ticket]);
    setSelectedDateLabel(parseTicketDate(ticket.created_at) || '');
    setAnchorEl(event.currentTarget);
  }, []);

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedTickets([]);
  };

  const handleRejectFromPopover = (ticketId: string | number) => {
    onReject(ticketId);
    setSelectedTickets((prev) => prev.filter((t) => t.ticket_id !== String(ticketId)));
    if (selectedTickets.length <= 1) handlePopoverClose();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
        <CircularProgress size={44} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Loading tickets...
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
            label={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
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
          const dayTickets = ticketsByDate.get(dateKey) || [];
          const isToday = dateKey === TODAY_KEY;

          return (
            <DayCell
              key={dateKey}
              day={day}
              dateKey={dateKey}
              dayTickets={dayTickets}
              isToday={isToday}
              onDayClick={handleDayCellClick}
              onChipClick={handleChipClick}
            />
          );
        })}
      </Box>

      {/* Unscheduled Tickets */}
      {unscheduledTickets.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Unscheduled Tickets ({unscheduledTickets.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {unscheduledTickets.map((t) => {
              const style = getStatusStyle(t.status);
              return (
                <Chip
                  key={t.ticket_id}
                  label={`#${t.ticket_id} · ${t.owner}`}
                  size="small"
                  onClick={(e) => handleChipClick(e, t)}
                  sx={{
                    backgroundColor: style.bg,
                    color: style.color,
                    border: style.border,
                    fontWeight: 700,
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Ticket Detail Popover */}
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
            minWidth: 320,
            maxWidth: 400,
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
            {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {selectedTickets.map((t, index) => {
            const style = getStatusStyle(t.status);
            return (
              <Box key={t.ticket_id}>
                {index > 0 && <Divider />}
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ConfirmationNumber sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        #{t.ticket_id}
                      </Typography>
                    </Box>
                    <Chip
                      label={t.status}
                      size="small"
                      sx={{
                        backgroundColor: style.bg,
                        color: style.color,
                        border: style.border,
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Person sx={{ fontSize: 15, color: 'text.secondary', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                          Owner
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {t.owner || '—'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <HowToReg sx={{ fontSize: 15, color: 'text.secondary', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                          Approver
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {t.approver || 'Unassigned'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Description sx={{ fontSize: 15, color: 'text.secondary', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                          Reason
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                          {t.reason || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<Cancel fontSize="small" />}
                      onClick={() => handleRejectFromPopover(t.ticket_id)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.06)',
                        },
                      }}
                    >
                      Reject Ticket
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};

export default React.memo(TicketCalendar);
