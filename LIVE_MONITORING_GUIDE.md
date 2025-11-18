# Live Monitoring UI - Implementation Guide

## Overview

The Live Monitoring UI provides real-time visibility into active trading strategies and market data. It leverages WebSocket connections for low-latency updates of market quotes, trade executions, trading signals, and strategy logs.

## Architecture

### Components

#### 1. **WebSocket Service** (`src/services/websocketService.ts`)
Central service for managing WebSocket connections and real-time data feeds.

**Key Features:**
- Automatic reconnection with exponential backoff
- Fallback to HTTP polling if WebSocket unavailable
- Message queuing and history tracking
- Support for both WebSocket and polling transports

**Main Methods:**
```typescript
// Connection Management
connect(options?: { reconnection?: boolean }): Promise<void>
disconnect(): void
isConnected(): boolean
isReconnecting(): boolean

// Subscriptions
subscribeTick(symbol: string): void
unsubscribeTick(symbol: string): void
subscribeStrategy(strategyId: string): void
unsubscribeStrategy(strategyId: string): void

// Strategy Commands
startStrategy(strategyId: string): Promise<unknown>
stopStrategy(strategyId: string): Promise<unknown>
pauseStrategy(strategyId: string): Promise<unknown>
updateStrategyParameters(strategyId: string, parameters: Record<string, unknown>): Promise<unknown>

// Event Management
on(eventType: string, callback: WebSocketCallback): () => void
getMessageHistory(type?: string): WebSocketMessage[]
clearMessageHistory(): void

// Fallback Support
enableFallbackPolling(interval?: number): void
disableFallbackPolling(): void
```

#### 2. **Toast Notification System** (`src/store/toastStore.ts`, `src/components/ToastContainer.tsx`)
Global notification system integrated with all monitoring components.

**Usage:**
```typescript
import { useToastStore } from '@store/toastStore';

const { addToast } = useToastStore();

// Simple notification
addToast({
  message: 'Strategy started successfully',
  type: 'success',
  duration: 5000, // Auto-dismiss after 5s
});

// With action button
addToast({
  message: 'Strategy error detected',
  type: 'error',
  duration: 0, // Don't auto-dismiss
  action: {
    label: 'Retry',
    callback: () => { /* retry logic */ },
  },
});

// Notification types: 'success' | 'error' | 'warning' | 'info'
```

#### 3. **Live Ticker** (`src/components/LiveTicker.tsx`)
Displays real-time price quotes for selected market symbols.

**Features:**
- Dynamic symbol selection
- Live bid/ask spreads
- Volume information
- Price change indicators (trending up/down)
- Responsive grid layout

**Usage:**
```tsx
import { LiveTicker } from '@components/LiveTicker';

<LiveTicker symbols={['AAPL', 'GOOGL', 'MSFT']} />
```

**Data Structure:**
```typescript
interface TickData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
}
```

#### 4. **Activity Dashboard** (`src/components/ActivityDashboard.tsx`)
Real-time feed of strategy events including trades, signals, and logs.

**Features:**
- Tabular display of recent activity
- Event type filtering (trade, signal, log)
- Status indicators with color coding
- Automatic scrolling to new events
- Event history (up to 100 recent events)

**Usage:**
```tsx
import { ActivityDashboard } from '@components/ActivityDashboard';

<ActivityDashboard strategyId="strategy-001" />
```

**Event Types:**

**Trade Events:**
```typescript
interface TradeEvent {
  id: string;
  strategyId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}
```

**Signal Events:**
```typescript
interface SignalEvent {
  id: string;
  strategyId: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  timestamp: number;
}
```

**Log Events:**
```typescript
interface LogEvent {
  id: string;
  strategyId: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: number;
}
```

#### 5. **Strategy Controls** (`src/components/StrategyControls.tsx`)
Lifecycle management and parameter adjustment for trading strategies.

**Features:**
- Start/Stop/Pause strategy
- Real-time status display
- Parameter adjustment dialog
- Error state display
- Toast notifications for all operations

**Usage:**
```tsx
import { StrategyControls } from '@components/StrategyControls';

<StrategyControls 
  strategyId="strategy-001" 
  status={{
    strategyId: 'strategy-001',
    status: 'RUNNING',
    timestamp: Date.now(),
  }}
/>
```

**Status Values:**
```typescript
type StrategyStatus = 'RUNNING' | 'STOPPED' | 'PAUSED' | 'ERROR';
```

#### 6. **Connection Status Indicator** (`src/components/ConnectionStatus.tsx`)
Visual indicator of WebSocket connection health.

**Features:**
- Connected/Disconnected/Reconnecting states
- Latency measurement (updated every 30s)
- Tooltip with detailed status
- Color-coded status chips

**Usage:**
```tsx
import { ConnectionStatus } from '@components/ConnectionStatus';

<ConnectionStatus />
```

#### 7. **Live Monitoring Page** (`src/pages/LiveMonitoringPage.tsx`)
Main page integrating all monitoring components.

**Features:**
- Symbol management interface
- Strategy selection and switching
- Integrated ticker, controls, and activity dashboard
- Connection status and reconnection handling
- Responsive layout

## Message Schema

### WebSocket Events

All events follow a standard message format:

```typescript
interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}
```

### Event Types and Channels

| Event | Channel | Direction | Description |
|-------|---------|-----------|-------------|
| `tick` | `/ws/market` | Server → Client | Market tick data (price, bid/ask, volume) |
| `trade` | `/ws/strategy` | Server → Client | Trade execution events |
| `signal` | `/ws/strategy` | Server → Client | Trading signal generation |
| `log` | `/ws/strategy` | Server → Client | Strategy log messages |
| `strategy-status` | `/ws/strategy` | Server → Client | Strategy status changes |
| `connection-status` | Internal | Internal | Connection state changes |
| `ws-error` | Internal | Internal | WebSocket errors |

### Subscribe/Unsubscribe Messages

**Subscribe to Tick Data:**
```json
{
  "type": "subscribe-tick",
  "data": {
    "symbol": "AAPL"
  }
}
```

**Subscribe to Strategy:**
```json
{
  "type": "subscribe-strategy",
  "data": {
    "strategyId": "strategy-001"
  }
}
```

### Strategy Control Messages

**Start Strategy:**
```json
{
  "type": "strategy-start",
  "data": {
    "strategyId": "strategy-001"
  }
}
```

**Stop Strategy:**
```json
{
  "type": "strategy-stop",
  "data": {
    "strategyId": "strategy-001"
  }
}
```

**Pause Strategy:**
```json
{
  "type": "strategy-pause",
  "data": {
    "strategyId": "strategy-001"
  }
}
```

**Update Strategy Parameters:**
```json
{
  "type": "strategy-update-params",
  "data": {
    "strategyId": "strategy-001",
    "parameters": {
      "riskPerTrade": 0.02,
      "maxPositionSize": 10,
      "stopLossPercent": 0.05,
      "takeProfitPercent": 0.1
    }
  }
}
```

## Configuration

### Environment Variables

Add to `.env`:
```
VITE_WS_URL=ws://localhost:3001
```

### WebSocket Service Options

```typescript
websocketService.connect({
  reconnection: true  // Enable automatic reconnection
});

// Enable fallback polling (5-second interval)
websocketService.enableFallbackPolling(5000);

// Disable fallback polling when reconnected
websocketService.disableFallbackPolling();
```

## Usage Examples

### Example 1: Basic Live Monitoring Setup

```tsx
import { useEffect, useState } from 'react';
import { websocketService } from '@services/websocketService';
import { LiveTicker } from '@components/LiveTicker';
import { ActivityDashboard } from '@components/ActivityDashboard';
import { StrategyControls } from '@components/StrategyControls';

export const MyMonitoringPage = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initWS = async () => {
      try {
        await websocketService.connect();
        setConnected(true);
        websocketService.enableFallbackPolling();
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    initWS();
    return () => websocketService.disconnect();
  }, []);

  return (
    <div>
      {connected ? (
        <>
          <LiveTicker symbols={['AAPL', 'GOOGL']} />
          <ActivityDashboard strategyId="strategy-001" />
          <StrategyControls strategyId="strategy-001" />
        </>
      ) : (
        <div>Connecting...</div>
      )}
    </div>
  );
};
```

### Example 2: Listening to WebSocket Events

```typescript
import { websocketService, TickData } from '@services/websocketService';
import { useToastStore } from '@store/toastStore';

// Subscribe to tick data
const unsubscribeTick = websocketService.on('tick', (data: unknown) => {
  const tick = data as TickData;
  console.log(`${tick.symbol}: $${tick.price}`);
});

// Subscribe to trade events
const unsubscribeTrade = websocketService.on('trade', (data: unknown) => {
  const trade = data as TradeEvent;
  useToastStore.getState().addToast({
    type: 'success',
    message: `${trade.side} ${trade.quantity} ${trade.symbol} @ $${trade.price}`,
  });
});

// Cleanup
unsubscribeTick();
unsubscribeTrade();
```

### Example 3: Strategy Control with Error Handling

```typescript
import { websocketService } from '@services/websocketService';
import { useToastStore } from '@store/toastStore';

const { addToast } = useToastStore();

try {
  await websocketService.startStrategy('strategy-001');
  addToast({
    type: 'success',
    message: 'Strategy started successfully',
  });
} catch (error) {
  addToast({
    type: 'error',
    message: `Failed to start strategy: ${error instanceof Error ? error.message : 'Unknown error'}`,
  });
}
```

## Troubleshooting

### WebSocket Connection Issues

**Problem:** "WebSocket disconnected. Using fallback polling mode."

**Solutions:**
1. Check backend WebSocket server is running on `VITE_WS_URL`
2. Verify firewall allows WebSocket connections
3. Check browser console for specific error messages
4. Try manual reconnection with the reconnect button

**Backend Check:**
```bash
# Test WebSocket endpoint
wscat -c ws://localhost:3001
```

### Missing Market Data

**Problem:** Ticker shows "Waiting for data..." indefinitely

**Solutions:**
1. Verify symbol is correct (e.g., "AAPL" not "Apple")
2. Check backend is subscribed to symbol data feed
3. Verify `/ws/market` channel is active on backend
4. Check message history in browser console:
```typescript
websocketService.getMessageHistory('tick')
```

### Strategy Commands Not Working

**Problem:** Strategy control buttons don't respond

**Solutions:**
1. Verify strategy ID exists on backend
2. Check WebSocket connection status
3. Verify backend permissions for strategy control
4. Check browser console for errors
5. Try reconnecting with the reconnect button

### High Latency or Freezing

**Problem:** UI updates lag or freeze

**Solutions:**
1. Check latency indicator in Connection Status
2. Reduce number of subscribed symbols
3. Close unused browser tabs
4. Check system resource usage
5. Verify backend performance

### Toast Notifications Not Appearing

**Problem:** No notifications on events

**Solutions:**
1. Check `ToastContainer` is included in App component
2. Verify `useToastStore` is being called correctly
3. Check browser console for errors
4. Verify toast duration isn't 0 without action

## Testing

### Unit Tests

Run WebSocket service tests:
```bash
npm test -- websocketService.test.ts
```

Run toast store tests:
```bash
npm test -- toastStore.test.ts
```

### Integration Tests

Run live monitoring component tests:
```bash
npm test -- LiveMonitoring.integration.test.tsx
```

### Test Coverage

Key test scenarios:
- ✅ WebSocket connection and disconnection
- ✅ Message subscription and unsubscription
- ✅ Event callback handling
- ✅ Fallback polling behavior
- ✅ Strategy command execution
- ✅ Toast notification lifecycle
- ✅ Component rendering and updates
- ✅ Error handling and recovery

## Performance Considerations

### Message Queuing
- Maximum 100 messages retained in history
- Older messages automatically purged
- Can be cleared manually: `websocketService.clearMessageHistory()`

### Activity Dashboard
- Displays up to 100 recent events
- Automatically scrolls to newest events
- Older events purged as new ones arrive

### Subscription Management
- Always unsubscribe when component unmounts
- Use returned unsubscribe function from `on()`
- Check `isConnected()` before subscribing to new symbols

### Latency Measurement
- Measured every 30 seconds
- Only when WebSocket is connected
- Shown in Connection Status tooltip

## Security Considerations

### Authentication
- WebSocket inherits authentication from HTTP session
- JWT token automatically injected by axios interceptor
- Token refresh handled by auth store

### Data Validation
- All incoming events validated for expected fields
- Invalid events logged to console
- Callbacks wrapped in try-catch for error safety

### Rate Limiting
- Implement on backend for subscription requests
- Monitor message throughput
- Fallback polling respects configured intervals

## Future Enhancements

- [ ] Historical data playback
- [ ] Advanced filtering and search
- [ ] Custom alert thresholds
- [ ] Trade analytics dashboard
- [ ] P&L tracking
- [ ] Risk metrics display
- [ ] Strategy backtesting interface
- [ ] Multi-strategy comparison
- [ ] Export activity logs
- [ ] WebSocket compression

## API Reference

### WebSocketService

See `src/services/websocketService.ts` for complete type definitions.

### Toast Store

See `src/store/toastStore.ts` for complete type definitions.

### Components

See component files for prop type definitions and detailed documentation.

## Related Files

- `src/services/websocketService.ts` - WebSocket service implementation
- `src/store/toastStore.ts` - Toast store
- `src/components/ToastContainer.tsx` - Toast display component
- `src/components/LiveTicker.tsx` - Quote ticker component
- `src/components/ActivityDashboard.tsx` - Activity feed component
- `src/components/StrategyControls.tsx` - Strategy control component
- `src/components/ConnectionStatus.tsx` - Connection indicator component
- `src/pages/LiveMonitoringPage.tsx` - Main monitoring page
- `src/__tests__/websocketService.test.ts` - WebSocket tests
- `src/__tests__/toastStore.test.ts` - Toast store tests
- `src/__tests__/LiveMonitoring.integration.test.tsx` - Integration tests
