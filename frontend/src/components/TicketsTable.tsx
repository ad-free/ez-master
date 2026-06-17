import React, { useMemo, useState } from 'react';
import type { Ticket } from '../types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Typography,
  TableSortLabel,
  Box,
} from '@mui/material';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  onReject: (ticketId: number | string) => void;
}

const statusStyle = (status: string) => {
  switch (status) {
    case 'Pending':
      return {
        bg: 'rgba(245, 158, 11, 0.08)',
        color: '#d97706',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      };
    case 'Approved':
      return {
        bg: 'rgba(16, 185, 129, 0.08)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      };
    case 'Rejected':
      return {
        bg: 'rgba(239, 68, 68, 0.08)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      };
    default:
      return {
        bg: 'rgba(100, 116, 139, 0.08)',
        color: '#475569',
        border: '1px solid rgba(100, 116, 139, 0.2)',
      };
  }
};

const TicketsTable: React.FC<Props> = ({ tickets, loading, onReject }) => {
  const [orderBy, setOrderBy] = useState<keyof Ticket | 'created_at'>('ticket_id');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleRequestSort = (property: keyof Ticket | 'created_at') => {
    if (orderBy === property) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  const sortedTickets = useMemo(() => {
    if (!orderBy) return tickets;
    const copy = [...tickets];
    copy.sort((a, b) => {
      const aVal = (a as any)[orderBy] ?? '';
      const bVal = (b as any)[orderBy] ?? '';
      if (orderBy === 'created_at') {
        const aTime = aVal ? Date.parse(aVal) : 0;
        const bTime = bVal ? Date.parse(bVal) : 0;
        return order === 'asc' ? aTime - bTime : bTime - aTime;
      }
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }
      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return copy;
  }, [tickets, orderBy, order]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading tickets queue...
        </Typography>
      </Box>
    );
  }

  if (tickets.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed rgba(226, 232, 240, 1)', borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          No pending tickets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Your inbox is completely clear!
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: 3 }}>
      <Table size="medium">
        <TableHead sx={{ bgcolor: 'rgba(248, 250, 252, 0.7)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }} sortDirection={orderBy === 'ticket_id' ? order : false}>
              <TableSortLabel active={orderBy === 'ticket_id'} direction={orderBy === 'ticket_id' ? order : 'asc'} onClick={() => handleRequestSort('ticket_id')}>
                Ticket ID
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }} sortDirection={orderBy === 'owner' ? order : false}>
              <TableSortLabel active={orderBy === 'owner'} direction={orderBy === 'owner' ? order : 'asc'} onClick={() => handleRequestSort('owner')}>
                Owner
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }} sortDirection={orderBy === 'status' ? order : false}>
              <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }}>Reason</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }}>Applied Date</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary' }} sortDirection={orderBy === 'approver' ? order : false}>
              <TableSortLabel active={orderBy === 'approver'} direction={orderBy === 'approver' ? order : 'asc'} onClick={() => handleRequestSort('approver')}>
                Approver
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.825rem', color: 'text.secondary', pr: 3 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTickets.map((t) => {
            const style = statusStyle(t.status);
            return (
              <TableRow key={t.ticket_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.secondary' }}>#{t.ticket_id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t.owner}</TableCell>
                <TableCell>
                  <Chip
                    label={t.status}
                    size="small"
                    sx={{
                      backgroundColor: style.bg,
                      color: style.color,
                      border: style.border,
                      fontWeight: 700,
                      borderRadius: '8px',
                      px: 0.5,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }} title={t.reason}>
                  {t.reason}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{t.created_at}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{t.approver || 'Unassigned'}</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => onReject(t.ticket_id)}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      },
                    }}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TicketsTable;
