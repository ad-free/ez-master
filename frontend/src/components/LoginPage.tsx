import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Avatar,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h4" gutterBottom>
            EZ Master
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
            Sign in to access your EZ account and manage WFH, OT, and salary
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              size="large"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Demo Mode: Use any credentials to login
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
