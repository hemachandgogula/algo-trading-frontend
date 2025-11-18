import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  Divider,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import type { TradeEvent, SignalEvent, LogEvent } from '@services/websocketService';
import { websocketService } from '@services/websocketService';

interface ActivityDashboardProps {
  strategyId: string;
}

type ActivityType = 'trade' | 'signal' | 'log';
type ActivityData = TradeEvent | SignalEvent | LogEvent;

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: number;
  data: ActivityData;
}

export const ActivityDashboard = ({ strategyId }: ActivityDashboardProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    websocketService.subscribeStrategy(strategyId);

    const unsubTrade = websocketService.on('trade', (data: unknown) => {
      const tradeData = data as TradeEvent;
      if (tradeData.strategyId === strategyId) {
        const newItem: ActivityItem = { id: tradeData.id, type: 'trade', timestamp: tradeData.timestamp, data: tradeData };
        setActivities((prev) => [newItem, ...prev].slice(0, 100));
      }
    });

    const unsubSignal = websocketService.on('signal', (data: unknown) => {
      const signalData = data as SignalEvent;
      if (signalData.strategyId === strategyId) {
        const newItem: ActivityItem = { id: signalData.id, type: 'signal', timestamp: signalData.timestamp, data: signalData };
        setActivities((prev) => [newItem, ...prev].slice(0, 100));
      }
    });

    const unsubLog = websocketService.on('log', (data: unknown) => {
      const logData = data as LogEvent;
      if (logData.strategyId === strategyId) {
        const newItem: ActivityItem = { id: logData.id, type: 'log', timestamp: logData.timestamp, data: logData };
        setActivities((prev) => [newItem, ...prev].slice(0, 100));
      }
    });

    return () => {
      websocketService.unsubscribeStrategy(strategyId);
      unsubTrade();
      unsubSignal();
      unsubLog();
    };
  }, [strategyId]);

  const renderActivityRow = (activity: ActivityItem) => {
    if (activity.type === 'trade') {
      const trade = activity.data as TradeEvent;
      return (
        <TableRow key={activity.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
          <TableCell>{new Date(trade.timestamp).toLocaleTimeString()}</TableCell>
          <TableCell>
            <Chip
              label={trade.side}
              color={trade.side === 'BUY' ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </TableCell>
          <TableCell>{trade.symbol}</TableCell>
          <TableCell>${trade.price.toFixed(2)}</TableCell>
          <TableCell>{trade.quantity}</TableCell>
          <TableCell>
            <Chip
              label={trade.status}
              size="small"
              color={
                trade.status === 'FILLED'
                  ? 'success'
                  : trade.status === 'CANCELLED'
                    ? 'error'
                    : 'warning'
              }
              variant="outlined"
            />
          </TableCell>
        </TableRow>
      );
    } else if (activity.type === 'signal') {
      const signal = activity.data as SignalEvent;
      return (
        <TableRow key={activity.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
          <TableCell>{new Date(signal.timestamp).toLocaleTimeString()}</TableCell>
          <TableCell>
            <Chip label="SIGNAL" size="small" variant="filled" color="info" />
          </TableCell>
          <TableCell>{signal.symbol}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={signal.signal}
                color={
                  signal.signal === 'BUY'
                    ? 'success'
                    : signal.signal === 'SELL'
                      ? 'error'
                      : 'default'
                }
                size="small"
                variant="outlined"
              />
            </Box>
          </TableCell>
          <TableCell>{(signal.confidence * 100).toFixed(1)}%</TableCell>
          <TableCell />
        </TableRow>
      );
    } else {
      const log = activity.data as LogEvent;
      return (
        <TableRow key={activity.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
          <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
          <TableCell>
            <Chip
              label={log.level}
              color={
                log.level === 'ERROR'
                  ? 'error'
                  : log.level === 'WARNING'
                    ? 'warning'
                    : 'info'
              }
              size="small"
              variant="outlined"
            />
          </TableCell>
          <TableCell colSpan={4}>{log.message}</TableCell>
        </TableRow>
      );
    }
  };

  return (
    <Card>
      <CardHeader
        title="Activity Feed"
        subheader={`${activities.length} recent events`}
        sx={{ pb: 0 }}
      />
      <Divider sx={{ my: 0 }} />
      <CardContent sx={{ p: 0 }}>
        {activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No activities yet</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Symbol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Volume/Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => renderActivityRow(activity))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
