import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

// Components
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import TicketsPage from './pages/TicketsPage';

// API Client
import { apiClient } from './services/apiClient';
import type { ProfileResponse } from './types/api';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

// Auth Context
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ProfileResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
} | undefined>(undefined);

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ProfileResponse | null>(null);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasToken = apiClient.loadTokenFromStorage();
        if (hasToken) {
          const profile = await apiClient.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await apiClient.login({ username, password });
      const profile = await apiClient.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Loading Spinner
const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');
    try {
      await login(username, password);
    } catch (error: any) {
      // Log full error for easier debugging (network, CORS, server message, etc.)
      console.error('Login error (full):', error);
      const serverMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message;
      setLoginError(
        typeof serverMessage === 'string'
          ? serverMessage
          : 'Login failed. Please check your credentials and network connection.'
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              isLoading={isLoading}
              error={loginError}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user && <DashboardPage user={user} onLogout={logout} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <AppRoutes />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;