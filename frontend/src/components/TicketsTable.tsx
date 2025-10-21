
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
} from '@mui/material';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  onReject: (ticketId: number | string) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
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
      // Try date compare for created_at
      if (orderBy === 'created_at') {
        const aTime = aVal ? Date.parse(aVal) : 0;
        const bTime = bVal ? Date.parse(bVal) : 0;
        return order === 'asc' ? aTime - bTime : bTime - aTime;
      }
      // Numeric compare if possible
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }
      // String compare
      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return copy;
  }, [tickets, orderBy, order]);

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading tickets...</Typography>
      </Paper>
    );
  }

  if (tickets.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">No tickets found.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }} sortDirection={orderBy === 'ticket_id' ? order : false}>
              <TableSortLabel active={orderBy === 'ticket_id'} direction={orderBy === 'ticket_id' ? order : 'asc'} onClick={() => handleRequestSort('ticket_id')}>
                Ticket ID
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }} sortDirection={orderBy === 'owner' ? order : false}>
              <TableSortLabel active={orderBy === 'owner'} direction={orderBy === 'owner' ? order : 'asc'} onClick={() => handleRequestSort('owner')}>
                Owner
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }} sortDirection={orderBy === 'status' ? order : false}>
              <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Reason</TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }} sortDirection={orderBy === 'approver' ? order : false}>
              <TableSortLabel active={orderBy === 'approver'} direction={orderBy === 'approver' ? order : 'asc'} onClick={() => handleRequestSort('approver')}>
                Approver
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTickets.map((t) => (
            <TableRow key={t.ticket_id} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{t.ticket_id}</TableCell>
              <TableCell>{t.owner}</TableCell>
              <TableCell>
                <Chip label={t.status} color={statusColor(t.status)} size="small" />
              </TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.reason}>
                {t.reason}
              </TableCell>
              <TableCell>{t.approver}</TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onReject(t.ticket_id)}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TicketsTable;
