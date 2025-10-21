
import React from 'react';
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
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Ticket ID</TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Owner</TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Reason</TableCell>
            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Approver</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map((t) => (
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
