import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

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
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#14b8a6', // Teal
      light: '#2dd4bf',
      dark: '#0d9488',
      contrastText: '#fff',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#475569', // Slate 600
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontWeight: 450,
      letterSpacing: '-0.01em',
    },
    body2: {
      fontWeight: 450,
      letterSpacing: '-0.005em',
    },
    caption: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 8px -1px rgba(15, 23, 42, 0.03)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: 'none',
        },
      },
    },
  },
});

// Auth Context
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  isInitializing: boolean;
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<ProfileResponse | null>(null);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasToken = apiClient.loadTokenFromStorage();
        if (!hasToken) {
          return;
        }

        const cachedProfile = apiClient.loadProfileFromStorage();
        if (cachedProfile) {
          setUser(cachedProfile);
          setIsAuthenticated(true);
        }

        setIsInitializing(false);

        try {
          const freshProfile = await apiClient.getProfile();
          setUser(freshProfile);
          apiClient.saveProfileToStorage(freshProfile);
        } catch {
          apiClient.clearToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiClient.clearToken();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await apiClient.login({ username, password });
      const profile = await apiClient.getProfile();
      apiClient.saveProfileToStorage(profile);
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
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (!isInitializing && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isInitializing, isLoading, user, login, logout } = useAuth();
  const [loginError, setLoginError] = useState('');

  const hasToken = apiClient.loadTokenFromStorage();

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');
    try {
      await login(username, password);
    } catch (error: any) {
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

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated || (isInitializing && hasToken) ? (
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
            <DashboardPage user={user} onLogout={logout} />
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