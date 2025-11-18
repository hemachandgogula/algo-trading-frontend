import { useEffect, useState } from 'react';
import { Paper, Box, Typography, Chip, Grid, Card, CardContent, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { TickData } from '@services/websocketService';
import { websocketService } from '@services/websocketService';

interface LiveTickerProps {
  symbols: string[];
}

export const LiveTicker = ({ symbols }: LiveTickerProps) => {
  const [ticks, setTicks] = useState<Map<string, TickData>>(new Map());
  const [loading, setLoading] = useState(symbols.length > 0);

  useEffect(() => {
    symbols.forEach((symbol) => websocketService.subscribeTick(symbol));

    const unsubscribeFunctions = symbols.map((symbol) =>
      websocketService.on('tick', (data: unknown) => {
        const tickData = data as TickData;
        if (tickData.symbol === symbol) {
          setTicks((prev) => new Map(prev).set(symbol, tickData));
          setLoading(false);
        }
      })
    );

    return () => {
      symbols.forEach((symbol) => websocketService.unsubscribeTick(symbol));
      unsubscribeFunctions.forEach((unsub) => unsub());
    };
  }, [symbols]);

  if (symbols.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="textSecondary">No symbols selected</Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {symbols.map((symbol) => {
        const tick = ticks.get(symbol);
        const priceChange = tick ? tick.price - tick.bid : 0;
        const isUp = priceChange >= 0;

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={symbol}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: isUp ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)',
                borderLeft: `4px solid ${isUp ? '#4caf50' : '#f44336'}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {symbol}
                  </Typography>
                  {isUp ? (
                    <TrendingUpIcon sx={{ color: '#4caf50' }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#f44336' }} />
                  )}
                </Box>

                {loading && !tick ? (
                  <>
                    <Skeleton variant="text" width="100%" height={40} />
                    <Skeleton variant="text" width="60%" />
                  </>
                ) : tick ? (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${tick.price.toFixed(2)}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Bid: $${tick.bid.toFixed(2)}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Ask: $${tick.ask.toFixed(2)}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="textSecondary">
                      Vol: {(tick.volume / 1000).toFixed(1)}K
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(tick.timestamp).toLocaleTimeString()}
                    </Typography>
                  </>
                ) : (
                  <Typography color="textSecondary" variant="body2">
                    Waiting for data...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
