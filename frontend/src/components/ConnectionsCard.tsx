import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import type { ConnectionsResponse } from '../types/api';
import { apiClient } from '../services/apiClient';

function parseHosts(text: string): string[] {
  return text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
}

const ConnectionsCard: React.FC = () => {
  const [hostsText, setHostsText] = React.useState('');
  const [includeDefault, setIncludeDefault] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ConnectionsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadDefault = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiClient.getConnections();
      setData(resp);
      setHostsText(resp.results.map((r) => r.host).join('\n'));
    } catch (err: any) {
      console.error('Failed loading connections', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const hosts = parseHosts(hostsText);
      const resp = await apiClient.checkConnections({
        hosts,
        include_default: includeDefault,
      } as any);
      setData(resp);
    } catch (err: any) {
      console.error('Failed checking connections', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to check connections');
    } finally {
      setLoading(false);
    }
  };

  const bestHost = data?.results?.find((r) => r.status === 'ONLINE' && r.latency_ms != null)
    ? data.results.reduce((best, curr) => {
        if (curr.status !== 'ONLINE' || curr.latency_ms == null) return best;
        if (!best || curr.latency_ms < (best.latency_ms ?? Infinity)) return curr;
        return best;
      }, data.results[0])
    : null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Connections
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Check VPN portal reachability from backend server
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 3fr' } }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Hosts (one per line)
            </Typography>
            <TextField
              value={hostsText}
              onChange={(e) => setHostsText(e.target.value)}
              multiline
              minRows={8}
              fullWidth
              placeholder="athome-sg.mlp.com&#10;remote.mlp.com"
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDefault}
                  onChange={(e) => setIncludeDefault(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Include default hosts"
              sx={{ mt: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" onClick={handleCheck} disabled={loading}>
                Check
              </Button>
              <Button variant="outlined" onClick={loadDefault} disabled={loading}>
                Reset to default
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Results {data ? `(port ${data.port}, timeout ${data.timeout_s}s)` : ''}
            </Typography>

            <Stack spacing={1}>
              {data?.results?.map((r) => {
                const isBest = bestHost && r.host === bestHost.host && r.status === 'ONLINE';
                return (
                  <Tooltip
                    key={r.host}
                    title={isBest ? 'Best latency' : ''}
                    placement="left"
                    arrow
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1,
                        border: '1px solid',
                        borderColor: isBest ? 'success.main' : 'divider',
                        borderRadius: 1,
                        bgcolor: isBest ? 'success.50' : 'transparent',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: isBest ? 700 : 600 }}
                          noWrap
                        >
                          {r.host}
                        </Typography>
                        {r.error ? (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {r.error}
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {isBest && (
                          <Chip size="small" label="Best" color="success" variant="filled" />
                        )}
                        <Chip
                          size="small"
                          label={r.status}
                          color={r.status === 'ONLINE' ? 'success' : 'default'}
                          variant={r.status === 'ONLINE' ? 'filled' : 'outlined'}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            minWidth: 72,
                            textAlign: 'right',
                            fontWeight: isBest ? 700 : 400,
                          }}
                        >
                          {r.status === 'ONLINE' && r.latency_ms != null ? `${r.latency_ms}ms` : '—'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Tooltip>
                );
              })}
              {!data?.results?.length && (
                <Typography variant="body2" color="text.secondary">
                  No results yet.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
    </Box>
  );
};

export default ConnectionsCard;
