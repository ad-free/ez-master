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
  const [timeout, setTimeout] = React.useState('5');
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
      const timeoutNum = parseFloat(timeout) || 5;
      const resp = await apiClient.checkConnections({
        hosts,
        include_default: includeDefault,
        timeout_s: timeoutNum,
      } as any);
      setData(resp);
    } catch (err: any) {
      console.error('Failed checking connections', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to check connections');
    } finally {
      setLoading(false);
    }
  };

  const rankedHosts = React.useMemo(() => {
    if (!data?.results) return { top3: [], rankMap: new Map(), onlineCount: 0, offlineCount: 0 };
    
    const online = data.results
      .filter((r) => r.status === 'ONLINE' && r.latency_ms != null)
      .sort((a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity));
    
    const rankMap = new Map<string, number>();
    online.slice(0, 3).forEach((r, idx) => rankMap.set(r.host, idx + 1));
    
    const onlineCount = data.results.filter((r) => r.status === 'ONLINE').length;
    const offlineCount = data.results.length - onlineCount;
    
    return { top3: online.slice(0, 3), rankMap, onlineCount, offlineCount };
  }, [data]);

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
            <TextField
              label="Timeout (seconds)"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              type="number"
              size="small"
              disabled={loading}
              inputProps={{ min: 1, max: 30, step: 0.5 }}
              sx={{ mt: 1, width: '100%' }}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Results {data ? `(port ${data.port}, timeout ${data.timeout_s}s)` : ''}
              </Typography>
              {data && (
                <>
                  <Chip size="small" label={`${rankedHosts.onlineCount} Online`} color="success" variant="outlined" />
                  <Chip size="small" label={`${rankedHosts.offlineCount} Offline`} color="default" variant="outlined" />
                </>
              )}
            </Box>

            <Stack spacing={1} sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
              {data?.results?.map((r) => {
                const rank = rankedHosts.rankMap.get(r.host);
                const rankConfig = rank === 1 
                  ? { label: '🥇 Best', color: 'success' as const, bgColor: 'rgba(46, 125, 50, 0.08)' }
                  : rank === 2
                  ? { label: '🥈 2nd', color: 'info' as const, bgColor: 'rgba(2, 136, 209, 0.08)' }
                  : rank === 3
                  ? { label: '🥉 3rd', color: 'warning' as const, bgColor: 'rgba(237, 108, 2, 0.08)' }
                  : null;
                
                return (
                  <Tooltip
                    key={r.host}
                    title={rankConfig ? `${rankConfig.label} latency` : ''}
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
                        borderColor: rankConfig ? `${rankConfig.color}.main` : 'divider',
                        borderRadius: 1,
                        bgcolor: rankConfig ? rankConfig.bgColor : 'transparent',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: rank ? 700 : 600 }}
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
                        {rankConfig && (
                          <Chip size="small" label={rankConfig.label} color={rankConfig.color} variant="filled" />
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
                            fontWeight: rank ? 700 : 400,
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
