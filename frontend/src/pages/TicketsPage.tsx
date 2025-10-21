import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import type { Ticket } from '../types/api';
import TicketsTable from '../components/TicketsTable';

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTickets('Pending', 200);
      // backend returns list of objects matching GetTicketsResponse
      setTickets(data as Ticket[]);
    } catch (err: any) {
      console.error('Failed to load tickets', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReject = async (ticketId: number | string) => {
    try {
      await apiClient.rejectTicket(Number(ticketId));
      // remove from list optimistically
      setTickets((prev) => prev.filter((t) => t.ticket_id !== String(ticketId)));
    } catch (err: any) {
      console.error('Failed to reject ticket', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to reject ticket');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white shadow rounded-lg p-4">
        <TicketsTable tickets={tickets} loading={loading} onReject={handleReject} />
      </div>
    </div>
  );
};

export default TicketsPage;
