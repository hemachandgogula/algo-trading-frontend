import { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, Typography, Tooltip } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SignalCellularOffIcon from '@mui/icons-material/SignalCellularOff';
import { websocketService } from '@services/websocketService';

interface ConnectionStatus {
  connected: boolean;
  reconnecting?: boolean;
  latency?: number;
  timestamp: number;
}

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    timestamp: 0,
  });
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = websocketService.on('connection-status', (data: unknown) => {
      const statusData = data as ConnectionStatus;
      setStatus(statusData);
    });

    const measureLatency = setInterval(() => {
      if (websocketService.isConnected()) {
        const startTime = Date.now();
        websocketService.on('pong', () => {
          const latencyMs = Date.now() - startTime;
          setLatency(latencyMs);
        });
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(measureLatency);
    };
  }, []);

  const getStatusIcon = () => {
    if (status.connected) {
      return <SignalCellularAltIcon sx={{ color: 'success.main' }} />;
    }
    if (status.reconnecting) {
      return <CircularProgress size={20} />;
    }
    return <SignalCellularOffIcon sx={{ color: 'error.main' }} />;
  };

  const getStatusLabel = () => {
    if (status.connected) {
      return 'Connected';
    }
    if (status.reconnecting) {
      return 'Reconnecting...';
    }
    return 'Disconnected';
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    if (status.connected) return 'success';
    if (status.reconnecting) return 'warning';
    return 'error';
  };

  const tooltipText = latency !== null ? `${getStatusLabel()} • Latency: ${latency}ms` : getStatusLabel();

  return (
    <Tooltip title={tooltipText}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon()}
        <Chip
          label={getStatusLabel()}
          color={getStatusColor()}
          size="small"
          variant="outlined"
          sx={{ minWidth: 120 }}
        />
        {latency !== null && (
          <Typography variant="caption" color="textSecondary">
            {latency}ms
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};
