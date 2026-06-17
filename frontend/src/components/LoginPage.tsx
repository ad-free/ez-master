import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
} from '@mui/material';
import { LockOutlined, EmailOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, rgba(20, 184, 166, 0.05) 90%)',
        backgroundColor: '#f8fafc',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 4, sm: 6 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 480,
          borderRadius: 4,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Branding Icon Container */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
            color: 'common.white',
          }}
        >
          <LockOutlined fontSize="medium" />
        </Box>

        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            letterSpacing: '-0.02em',
          }}
        >
          EZ Master
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Sign in to access your dashboard, WFH, OT, and salary tools.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Email Address"
            name="username"
            autoComplete="email"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" fontSize="small" />
                  </InputAdornment>
                ),
                style: { borderRadius: 12 },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff color="action" fontSize="small" /> : <Visibility color="action" fontSize="small" />}
                  </InputAdornment>
                ),
                style: { borderRadius: 12 },
              },
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            size="large"
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 3,
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              borderStyle: 'dashed',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Demo Mode Enabled</strong>: Enter any email and password combination to log in.
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
