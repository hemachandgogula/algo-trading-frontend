import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LiveTicker } from '@components/LiveTicker';
import { ActivityDashboard } from '@components/ActivityDashboard';
import { StrategyControls } from '@components/StrategyControls';
import { ConnectionStatus } from '@components/ConnectionStatus';
import type { StrategyStatusEvent } from '@services/websocketService';
import { websocketService } from '@services/websocketService';
import { useToastStore } from '@store/toastStore';

export const LiveMonitoringPage = () => {
  const [symbols, setSymbols] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT']);
  const [newSymbol, setNewSymbol] = useState('');
  const [strategyId, setStrategyId] = useState('strategy-001');
  const [newStrategyId, setNewStrategyId] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [strategyStatus, setStrategyStatus] = useState<StrategyStatusEvent | undefined>();
  const { addToast } = useToastStore();

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        setLoading(true);
        await websocketService.connect();
        setWsConnected(true);
        websocketService.enableFallbackPolling();

        const unsubConnection = websocketService.on('connection-status', (data: unknown) => {
          const status = data as { connected: boolean; timestamp: number };
          setWsConnected(status.connected);
        });

        const unsubStrategyStatus = websocketService.on('strategy-status', (data: unknown) => {
          const status = data as StrategyStatusEvent;
          setStrategyStatus(status);

          if (status.status === 'ERROR') {
            addToast({
              type: 'error',
              message: `Strategy error: ${status.errorMessage}`,
              duration: 0,
            });
          }
        });

        const unsubWsError = websocketService.on('ws-error', (data: unknown) => {
          const error = data as { error: string; timestamp: number };
          addToast({
            type: 'error',
            message: `WebSocket error: ${error.error}`,
          });
        });

        return () => {
          unsubConnection();
          unsubStrategyStatus();
          unsubWsError();
        };
      } catch (error) {
        addToast({
          type: 'error',
          message: `Failed to connect to WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        setWsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initializeWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [addToast]);

  const handleAddSymbol = () => {
    if (newSymbol.trim() && !symbols.includes(newSymbol.toUpperCase())) {
      const upperSymbol = newSymbol.toUpperCase();
      setSymbols([...symbols, upperSymbol]);
      setNewSymbol('');
      addToast({
        type: 'success',
        message: `Added symbol: ${upperSymbol}`,
      });
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter((s) => s !== symbol));
    addToast({
      type: 'info',
      message: `Removed symbol: ${symbol}`,
    });
  };

  const handleChangeStrategy = () => {
    if (newStrategyId.trim()) {
      setStrategyId(newStrategyId);
      setNewStrategyId('');
      setStrategyStatus(undefined);
      addToast({
        type: 'success',
        message: `Switched to strategy: ${newStrategyId}`,
      });
    }
  };

  const handleReconnect = async () => {
    try {
      setLoading(true);
      websocketService.disconnect();
      await websocketService.connect();
      setWsConnected(true);
      addToast({
        type: 'success',
        message: 'Reconnected to WebSocket',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to reconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Live Monitoring Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ConnectionStatus />
            {!wsConnected && (
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleReconnect}
                disabled={loading}
              >
                Reconnect
              </Button>
            )}
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CircularProgress size={20} />
            <Typography color="textSecondary">Loading...</Typography>
          </Box>
        )}

        {!wsConnected && !loading && (
          <Alert severity="warning">
            WebSocket disconnected. Using fallback polling mode. Some features may have reduced responsiveness.
          </Alert>
        )}
      </Box>

      {/* Symbol Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Symbol Selection
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {symbols.map((symbol) => (
              <Chip
                key={symbol}
                label={symbol}
                onDelete={() => handleRemoveSymbol(symbol)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddSymbol();
              }}
              placeholder="Add symbol (e.g., AAPL)"
              size="small"
              sx={{ flexGrow: 1, maxWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSymbol}
              disabled={!newSymbol.trim() || wsConnected === false}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Live Ticker */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Live Quotes
        </Typography>
        <LiveTicker symbols={symbols} />
      </Box>

      {/* Strategy Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Strategy Selection
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={strategyId}
              disabled
              size="small"
              placeholder="Current Strategy"
              sx={{ flexGrow: 1, maxWidth: 300 }}
            />
            <TextField
              value={newStrategyId}
              onChange={(e) => setNewStrategyId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleChangeStrategy();
              }}
              placeholder="Enter new strategy ID"
              size="small"
              sx={{ flexGrow: 1, maxWidth: 300 }}
            />
            <Button
              variant="contained"
              onClick={handleChangeStrategy}
              disabled={!newStrategyId.trim()}
            >
              Switch
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Strategy Controls and Activity Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StrategyControls strategyId={strategyId} status={strategyStatus} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ActivityDashboard strategyId={strategyId} />
        </Grid>
      </Grid>

      {/* Info Section */}
      <Card sx={{ bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            💡 Tips
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2">
              Add symbols to monitor their live ticker data
            </Typography>
            <Typography component="li" variant="body2">
              Use Strategy Controls to manage strategy lifecycle
            </Typography>
            <Typography component="li" variant="body2">
              Activity Feed updates in real-time with trades, signals, and logs
            </Typography>
            <Typography component="li" variant="body2">
              Connection Status shows WebSocket connectivity and latency
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};
