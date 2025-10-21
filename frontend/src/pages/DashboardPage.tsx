import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import type { RegisterWFHRequest, RegisterOTRequest, Ticket } from '../types/api'
import TicketsTable from '../components/TicketsTable';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'wfh' | 'ot' | 'salary' | 'tickets'>('wfh');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const data = await apiClient.getTickets('Pending', 200);
      setTickets(data as Ticket[]);
    } catch (err: any) {
      console.error('Failed loading tickets', err);
      setTicketsError(err?.response?.data?.detail || err?.message || 'Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  // WFH Form state
  const [wfhForm, setWfhForm] = useState<RegisterWFHRequest>({
    from_date: '',
    to_date: '',
    reason: 'WFH as planned',
  });

  // OT Form state
  const [otForm, setOtForm] = useState<RegisterOTRequest>({
    from_date: '',
    to_date: '',
    from_time: '',
    to_time: '',
    ot_type: 'PLAN',
    ot_benefit_type: 'DILIGENCE',
    reason: '',
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleWFHSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.registerWFH(wfhForm);
      showMessage('success', 'WFH registration submitted successfully!');
      setWfhForm({ from_date: '', to_date: '', reason: 'WFH as planned' });
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to register WFH');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.registerOT(otForm);
      showMessage('success', 'OT registration submitted successfully!');
      setOtForm({
        from_date: '',
        to_date: '',
        from_time: '',
        to_time: '',
        ot_type: 'PLAN',
        ot_benefit_type: 'DILIGENCE',
        reason: '',
      });
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to register OT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryDownload = async () => {
    setIsLoading(true);
    try {
      const blob = await apiClient.downloadSalary();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary_${new Date().toISOString().slice(0, 7)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('success', 'Salary PDF downloaded successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to download salary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EZ Master Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {user?.FirstName} {user?.LastName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <a href="#/tickets" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium">Tickets</a>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.Email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.ChucVu}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.PhongBan}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.ChucDanh}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'wfh', name: 'Work From Home', icon: '🏠' },
                { id: 'ot', name: 'Overtime', icon: '⏰' },
                { id: 'salary', name: 'Salary', icon: '💰' },
                { id: 'tickets', name: 'Tickets', icon: '🎫' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* WFH Tab */}
            {activeTab === 'wfh' && (
              <form onSubmit={handleWFHSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Register Work From Home</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wfh-from-date" className="block text-sm font-medium text-gray-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      id="wfh-from-date"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={wfhForm.from_date}
                      onChange={(e) => setWfhForm({ ...wfhForm, from_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="wfh-to-date" className="block text-sm font-medium text-gray-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      id="wfh-to-date"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={wfhForm.to_date}
                      onChange={(e) => setWfhForm({ ...wfhForm, to_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="wfh-reason" className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <input
                    type="text"
                    id="wfh-reason"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={wfhForm.reason}
                    onChange={(e) => setWfhForm({ ...wfhForm, reason: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Register WFH'}
                </button>
              </form>
            )}

            {/* OT Tab */}
            {activeTab === 'ot' && (
              <form onSubmit={handleOTSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Register Overtime</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ot-from-date" className="block text-sm font-medium text-gray-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      id="ot-from-date"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.from_date}
                      onChange={(e) => setOtForm({ ...otForm, from_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="ot-to-date" className="block text-sm font-medium text-gray-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      id="ot-to-date"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.to_date}
                      onChange={(e) => setOtForm({ ...otForm, to_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ot-from-time" className="block text-sm font-medium text-gray-700">
                      From Time
                    </label>
                    <input
                      type="time"
                      id="ot-from-time"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.from_time}
                      onChange={(e) => setOtForm({ ...otForm, from_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="ot-to-time" className="block text-sm font-medium text-gray-700">
                      To Time
                    </label>
                    <input
                      type="time"
                      id="ot-to-time"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.to_time}
                      onChange={(e) => setOtForm({ ...otForm, to_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ot-type" className="block text-sm font-medium text-gray-700">
                      OT Type
                    </label>
                    <select
                      id="ot-type"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.ot_type}
                      onChange={(e) => setOtForm({ ...otForm, ot_type: e.target.value as 'PLAN' | 'ADDITIONAL' })}
                    >
                      <option value="PLAN">Plan</option>
                      <option value="ADDITIONAL">Additional</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ot-benefit-type" className="block text-sm font-medium text-gray-700">
                      Benefit Type
                    </label>
                    <select
                      id="ot-benefit-type"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otForm.ot_benefit_type}
                      onChange={(e) => setOtForm({ ...otForm, ot_benefit_type: e.target.value as 'DILIGENCE' | 'COMPENSATION' | 'SALARY' })}
                    >
                      <option value="DILIGENCE">Diligence</option>
                      <option value="COMPENSATION">Compensation</option>
                      <option value="SALARY">Salary</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="ot-reason" className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <input
                    type="text"
                    id="ot-reason"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={otForm.reason}
                    onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Register OT'}
                </button>
              </form>
            )}

            {/* Salary Tab */}
            {activeTab === 'salary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Salary Management</h3>
                <p className="text-gray-600">
                  Download your salary PDF for the current month or specify a different month.
                </p>
                <button
                  onClick={handleSalaryDownload}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Downloading...' : 'Download Current Month Salary'}
                </button>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets</h3>
                {ticketsError && <div className="mb-4 text-red-600">{ticketsError}</div>}
                <div className="bg-white shadow rounded-lg p-4">
                  <TicketsTable tickets={tickets} loading={loadingTickets} onReject={async (id) => {
                    try {
                      await apiClient.rejectTicket(Number(id));
                      setTickets(prev => prev.filter(t => t.ticket_id !== String(id)));
                      showMessage('success', `Rejected ticket ${id}`);
                    } catch (err: any) {
                      console.error('Reject ticket failed', err);
                      showMessage('error', err?.response?.data?.detail || err?.message || 'Failed to reject ticket');
                    }
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
