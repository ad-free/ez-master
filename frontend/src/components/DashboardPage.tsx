import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Avatar,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Home,
  Schedule,
  AttachMoney,
  Logout,
  ConfirmationNumber,
  Menu as MenuIcon,
  NotificationsOutlined,
} from '@mui/icons-material';

import WFHRegistrationForm from './WFHRegistrationForm';
import OTRegistrationForm from './OTRegistrationForm';
import SalaryDownload from './SalaryDownload';
import TimecardCalendar from './TimecardCalendar';

import { apiClient } from '../services/apiClient';
import type { RegisterWFHRequest, RegisterOTRequest } from '../types/api'

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

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: 'Tickets Queue', icon: <ConfirmationNumber /> },
  { label: 'Register WFH', icon: <Home /> },
  { label: 'Register Overtime', icon: <Schedule /> },
  { label: 'Salary History', icon: <AttachMoney /> },
];

const DashboardPage: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary_${date || new Date().toISOString().slice(0, 7)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar(`Salary PDF downloaded successfully!`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail || 'Failed to download salary PDF', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          bgcolor: 'primary.main', color: 'common.white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.875rem',
          boxShadow: '0 3px 8px rgba(99, 102, 241, 0.35)',
        }}>
          EZ
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          EZ Master
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {menuItems.map((item, idx) => {
          const isSelected = activeTab === idx;
          return (
            <ListItem key={item.label} disablePadding sx={{ position: 'relative' }}>
              {isSelected && (
                <Box sx={{
                  position: 'absolute', left: 0, top: '50%', translate: '0 -50%',
                  width: 3, height: 24, borderRadius: '0 4px 4px 0',
                  bgcolor: 'primary.main',
                  boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
                }} />
              )}
              <ListItemButton
                onClick={() => { setActiveTab(idx); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2, py: 1.25, px: 2, ml: 0.5,
                  bgcolor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'action.hover',
                    color: isSelected ? 'primary.main' : 'text.primary',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 38,
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Profile */}
      <Box sx={{
        p: 2, m: 1.5, borderRadius: 2,
        bgcolor: 'action.hover',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, fontSize: '0.8rem', fontWeight: 600 }}>
          {user.FirstName.charAt(0)}{user.LastName.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {user.FirstName} {user.LastName}
          </Typography>
          <Typography variant="caption" noWrap color="text.secondary">
            {user.ChucVu}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={onLogout} size="small" color="error" sx={{ borderRadius: 1.5 }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMdUp ? (
          <Drawer
            variant="permanent"
            open
            PaperProps={{
              sx: {
                width: DRAWER_WIDTH,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: DRAWER_WIDTH } }}
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>

      {/* Main */}
      <Box component="main" sx={{
        flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Top Navbar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMdUp && (
                <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 0.5 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {menuItems[activeTab].label}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {activeTab === 0 ? 'View your tickets and calendar' :
                   activeTab === 1 ? 'Register work-from-home days' :
                   activeTab === 2 ? 'Register overtime hours' :
                   'Download salary PDFs'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton size="small" sx={{ borderRadius: 1.5 }}>
                <Badge variant="dot" color="error">
                  <NotificationsOutlined fontSize="small" />
                </Badge>
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {user.FirstName}
              </Typography>
              <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'primary.main' }}>
                {user.FirstName.charAt(0)}{user.LastName.charAt(0)}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 3, mb: 4, flexGrow: 1 }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            {activeTab === 0 && <TimecardCalendar />}
            {activeTab === 1 && (
              <WFHRegistrationForm onSubmit={handleWFHSubmit} isLoading={isLoading} />
            )}
            {activeTab === 2 && (
              <OTRegistrationForm onSubmit={handleOTSubmit} isLoading={isLoading} />
            )}
            {activeTab === 3 && (
              <SalaryDownload onDownload={handleSalaryDownload} isLoading={isLoading} />
            )}
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
