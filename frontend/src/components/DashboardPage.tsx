import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AccountCircle,
  Home,
  Schedule,
  AttachMoney,
  Logout,
  Person,
  ConfirmationNumber,
} from '@mui/icons-material';

// Import our new components
import WFHRegistrationForm from './WFHRegistrationForm';
import OTRegistrationForm from './OTRegistrationForm';
import SalaryDownload from './SalaryDownload';
import TicketsTable from './TicketsTable';
import TablePagination from '@mui/material/TablePagination';

// Import API client
import { apiClient } from '../services/apiClient';
import type { RegisterWFHRequest, RegisterOTRequest, Ticket } from '../types/api'

interface ProfileResponse {
  ID: string;
  Email: string;
  LastName: string;
  FirstName: string;
  ChucVu: string;
  ChucDanh: string;
  PhongBan: string;
}

interface DashboardProps {
  user: ProfileResponse;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  // Tickets state (tab index 3)
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const data = await apiClient.getTickets('Pending', 1000);
      setTickets(data as Ticket[]);
      setPage(0); // Reset to first page on reload
    } catch (err: any) {
      console.error('Failed to load tickets', err);
      setTicketsError(err?.response?.data?.detail || err?.message || 'Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 0) {
      loadTickets();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const handleRejectTicket = async (ticketId: number | string) => {
    try {
      await apiClient.rejectTicket(Number(ticketId));
      setTickets(prev => prev.filter(t => t.ticket_id !== String(ticketId)));
      showSnackbar(`Rejected ticket ${ticketId}`, 'success');
    } catch (err: any) {
      console.error('Reject ticket failed', err);
      showSnackbar(err?.response?.data?.detail || err?.message || 'Failed to reject ticket', 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Real API calls to your backend
  const handleWFHSubmit = async (data: RegisterWFHRequest) => {
    setIsLoading(true);
    try {
      const response = await apiClient.registerWFH(data);
      showSnackbar(`WFH registered successfully for ${response.dates?.length || 0} day(s)!`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail || 'Failed to submit WFH registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTSubmit = async (data: RegisterOTRequest) => {
    setIsLoading(true);
    try {
      const response = await apiClient.registerOT(data);
      showSnackbar(`OT registered successfully for ${response.dates?.length || 0} day(s)!`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail || 'Failed to submit OT registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryDownload = async (date?: string) => {
    setIsLoading(true);
    try {
      const blob = await apiClient.downloadSalary(date);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary_${date || new Date().toISOString().slice(0, 7)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar(`Salary PDF for ${date || 'current month'} downloaded successfully!`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail || 'Failed to download salary PDF', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index,
  }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EZ Master Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user.FirstName} {user.LastName}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={onLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Profile Card */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user.FirstName.charAt(0)}{user.LastName.charAt(0)}
              </Avatar>
            }
            title={`${user.FirstName} ${user.LastName}`}
            subheader={user.Email}
            action={
              <Chip label={user.ChucVu} color="primary" variant="outlined" />
            }
          />
          <CardContent>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Position
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.ChucVu}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.ChucDanh}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.PhongBan}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.ID}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<ConfirmationNumber />}
              label="Tickets"
              iconPosition="start"
            />
            <Tab
              icon={<Home />}
              label="Work From Home"
              iconPosition="start"
            />
            <Tab
              icon={<Schedule />}
              label="Overtime"
              iconPosition="start"
            />
            <Tab
              icon={<AttachMoney />}
              label="Salary"
              iconPosition="start"
            />
          </Tabs>

          {/* Tickets Tab (now first) */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Tickets
            </Typography>
            {ticketsError && <Alert severity="error" sx={{ mb: 2 }}>{ticketsError}</Alert>}
            <TicketsTable
              tickets={tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
              loading={loadingTickets}
              onReject={handleRejectTicket}
            />
            <TablePagination
              component="div"
              count={tickets.length}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
              sx={{ mt: 2 }}
            />
          </TabPanel>

          {/* WFH Tab (now second) */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Work From Home Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Register your work from home requests for specific date ranges. All dates will be processed automatically.
            </Typography>
            <WFHRegistrationForm
              onSubmit={handleWFHSubmit}
              isLoading={isLoading}
            />
          </TabPanel>

          {/* OT Tab (now third) */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Overtime Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Register overtime requests with specific time windows and benefit types. All dates will be processed automatically.
            </Typography>
            <OTRegistrationForm
              onSubmit={handleOTSubmit}
              isLoading={isLoading}
            />
          </TabPanel>

          {/* Salary Tab (now fourth) */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Salary Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Download your salary PDFs for any month. Select a specific month or download the current month's salary.
            </Typography>
            <SalaryDownload
              onDownload={handleSalaryDownload}
              isLoading={isLoading}
            />
          </TabPanel>
        </Paper>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;