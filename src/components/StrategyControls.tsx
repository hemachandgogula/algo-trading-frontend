import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import TuneIcon from '@mui/icons-material/Tune';
import type { StrategyStatusEvent } from '@services/websocketService';
import { websocketService } from '@services/websocketService';
import { useToastStore } from '@store/toastStore';

interface StrategyControlsProps {
  strategyId: string;
  status?: StrategyStatusEvent;
}

interface StrategyParams {
  [key: string]: string | number;
}

export const StrategyControls = ({ strategyId, status }: StrategyControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [params, setParams] = useState<StrategyParams>({
    riskPerTrade: 0.02,
    maxPositionSize: 10,
    stopLossPercent: 0.05,
    takeProfitPercent: 0.1,
  });
  const { addToast } = useToastStore();

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await websocketService.startStrategy(strategyId);
      addToast({
        type: 'success',
        message: `Strategy ${strategyId} started successfully`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to start strategy: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await websocketService.stopStrategy(strategyId);
      addToast({
        type: 'warning',
        message: `Strategy ${strategyId} stopped`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to stop strategy: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await websocketService.pauseStrategy(strategyId);
      addToast({
        type: 'warning',
        message: `Strategy ${strategyId} paused`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to pause strategy: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParams = async () => {
    setIsLoading(true);
    try {
      await websocketService.updateStrategyParameters(strategyId, params);
      addToast({
        type: 'success',
        message: 'Strategy parameters updated successfully',
      });
      setShowParamsDialog(false);
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to update parameters: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamChange = (key: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStatusColor = ():
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'default'
    | 'primary'
    | 'secondary' => {
    switch (status?.status) {
      case 'RUNNING':
        return 'success';
      case 'STOPPED':
        return 'error';
      case 'PAUSED':
        return 'warning';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader
        title="Strategy Controls"
        subheader={`Strategy ID: ${strategyId}`}
        action={
          <Box>
            {status && (
              <Chip
                label={status.status}
                color={getStatusColor()}
                size="small"
                variant="filled"
              />
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {status?.errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.errorMessage}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={isLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            onClick={handleStart}
            disabled={isLoading || status?.status === 'RUNNING'}
          >
            Start
          </Button>

          <Button
            variant="contained"
            color="warning"
            startIcon={<PauseIcon />}
            onClick={handlePause}
            disabled={isLoading || status?.status !== 'RUNNING'}
          >
            Pause
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStop}
            disabled={isLoading || status?.status === 'STOPPED'}
          >
            Stop
          </Button>

          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => setShowParamsDialog(true)}
            disabled={isLoading}
          >
            Parameters
          </Button>
        </Stack>
      </CardContent>

      <Dialog open={showParamsDialog} onClose={() => setShowParamsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Strategy Parameters</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(params).map(([key, value]) => (
            <TextField
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              value={value}
              onChange={(e) => handleParamChange(key, e.target.value)}
              type="number"
              inputProps={{ step: 'any' }}
              fullWidth
              disabled={isLoading}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowParamsDialog(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateParams}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
