# Live Monitoring UI - Quick Start Guide

## 5-Minute Setup

### 1. Start the Application
```bash
cd /home/engine/project
npm install           # If not already done
npm run dev          # Start dev server on http://localhost:5173
```

### 2. Login
- Navigate to http://localhost:5173
- Login with your credentials
- (Or register a new account)

### 3. Open Live Monitoring
- Click "Live Monitoring" in the sidebar
- Or go directly to http://localhost:5173/monitoring

### 4. Add Market Symbols
- In "Symbol Selection" section, enter a symbol (e.g., "AAPL")
- Click "Add" button
- Symbol appears as chip
- Wait for live price data

### 5. Start a Strategy
- Select a strategy ID (or use default)
- Click "Start" button in Strategy Controls
- Watch Activity Dashboard for trades/signals/logs

## Key Features Overview

### Live Ticker 📈
```
Shows real-time prices for your selected symbols
- Price with trending indicators
- Bid/Ask spreads
- Trading volume
- Updates every tick (sub-second)
```

### Activity Dashboard 📊
```
Real-time feed of all strategy events
- Trades: Execution status and details
- Signals: Buy/Sell recommendations with confidence
- Logs: Strategy information and warnings
- Maintains history of 100 recent events
```

### Strategy Controls 🎮
```
Manage your strategy
- Start/Stop/Pause buttons
- Parameter adjustment (click Parameters button)
- Real-time status display
- Error alerts
```

### Connection Status 🔗
```
Monitor WebSocket connection
- Green = Connected (low latency)
- Yellow = Reconnecting (retrying connection)
- Red = Disconnected (using fallback polling)
- Shows latency in milliseconds
```

## Common Tasks

### Monitor Multiple Symbols
```
1. Enter "AAPL" → Click Add
2. Enter "GOOGL" → Click Add
3. Enter "MSFT" → Click Add
Live Ticker shows all three with real-time updates
```

### Switch Between Strategies
```
1. Enter new strategy ID in "Strategy Selection"
2. Click "Switch" button
3. Controls and activity feed update to new strategy
4. Start/Stop as needed
```

### Adjust Strategy Parameters
```
1. Click "Parameters" button in Strategy Controls
2. Update values (Risk, Position Size, etc.)
3. Click "Update" button
4. Success notification appears
```

### Check Connection Health
```
Connection Status indicator shows:
- Connected: Ready to go
- Reconnecting: Automatic retry in progress
- Disconnected: Using fallback polling (still works)

Click "Reconnect" button to manually reconnect
```

## Understanding the UI

### Symbol Chips
```
[AAPL] ✕  [GOOGL] ✕  [MSFT] ✕
 ↓         ↓          ↓
Click ✕ to remove symbol
```

### Ticker Cards
```
┌─────────────────┐
│ AAPL        ⬆  │  Green = Price up
│ $150.25         │  Red = Price down
│ [Bid] [Ask]     │
│ Vol: 1000K      │
│ 2:45:30 PM      │
└─────────────────┘
```

### Activity Types
```
🟢 [FILLED] - Trade executed successfully
🟡 [PENDING] - Trade waiting execution
🔴 [CANCELLED] - Trade cancelled
💡 [SIGNAL] - Trading signal generated
📝 [INFO] - Informational log message
⚠️  [WARNING] - Warning log message
❌ [ERROR] - Error log message
```

### Status Indicators
```
🟢 RUNNING    - Strategy actively trading
⏸️  PAUSED    - Strategy paused, can resume
⛔ STOPPED    - Strategy stopped
❌ ERROR      - Strategy encountered error
```

## Troubleshooting Quick Fixes

### No Live Data Appearing?
```
✓ Check symbol is uppercase (AAPL, not aapl)
✓ Verify symbol exists (try AAPL, GOOGL, MSFT)
✓ Check connection status (green = connected)
✓ Wait a few seconds for data to arrive
✓ Try removing and re-adding symbol
```

### Strategy Controls Unresponsive?
```
✓ Verify WebSocket is connected (green indicator)
✓ Check strategy ID is correct
✓ Try clicking "Reconnect" button
✓ Check browser console for errors
✓ Reload page and try again
```

### No Notifications Appearing?
```
✓ Check bottom-right corner of screen
✓ Verify not dismissed too quickly
✓ Try triggering an action (Start/Stop)
✓ Look for error messages in browser console
```

### Slow Updates?
```
✓ Check latency in Connection Status
✓ Close other browser tabs
✓ Reduce number of symbols
✓ Check system resource usage
✓ Try fallback polling mode (automatic)
```

## Testing Mock Data Flow

### Manual WebSocket Testing
```bash
# In browser console (DevTools)
import { websocketService } from '@services/websocketService';

# Check connection
websocketService.isConnected()

# View recent messages
websocketService.getMessageHistory()

# Check specific event type
websocketService.getMessageHistory('tick')
```

### Simulating Events
```typescript
// In browser console, simulate a tick
const mockTick = {
  symbol: 'TEST',
  price: 100.50,
  bid: 100.45,
  ask: 100.55,
  volume: 50000,
  timestamp: Date.now()
};

// Trigger callback for testing
websocketService.on('tick', (data) => {
  console.log('Received tick:', data);
});
```

## Environment Setup

### For Development
```bash
# Default configuration (localhost)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### For Production
```bash
# Update .env for production
VITE_API_BASE_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com
```

## Running Tests

### Unit Tests
```bash
npm test                           # Run all tests
npm test -- websocketService      # WebSocket tests
npm test -- toastStore            # Toast store tests
npm test -- LiveMonitoring        # Integration tests
```

### With UI Dashboard
```bash
npm test:ui                        # Open test UI
# Then browse to http://localhost:51204/__vitest__/
```

## File Locations Reference

```
Implementation Files:
- src/services/websocketService.ts      WebSocket service
- src/store/toastStore.ts               Toast notifications
- src/components/LiveTicker.tsx         Market quotes
- src/components/ActivityDashboard.tsx  Event feed
- src/components/StrategyControls.tsx   Strategy controls
- src/components/ConnectionStatus.tsx   Connection indicator
- src/components/ToastContainer.tsx     Toast display
- src/pages/LiveMonitoringPage.tsx      Main page

Test Files:
- src/__tests__/websocketService.test.ts
- src/__tests__/toastStore.test.ts
- src/__tests__/LiveMonitoring.integration.test.tsx

Documentation:
- LIVE_MONITORING_GUIDE.md              Complete guide
- LIVE_MONITORING_TROUBLESHOOTING.md    Troubleshooting
- LIVE_MONITORING_INTEGRATION.md        Integration summary
- LIVE_MONITORING_QUICKSTART.md         This file
```

## Next Steps

1. **Customize for Your Backend**
   - Update WebSocket event types in service
   - Adjust component layouts
   - Configure polling interval

2. **Integrate Strategy Data**
   - Connect real strategy endpoints
   - Replace mock data with real feeds
   - Add authentication headers

3. **Extend with Features**
   - Add historical data charts
   - Implement trade analytics
   - Add risk metrics dashboard

4. **Deploy to Production**
   - Build: `npm run build`
   - Test: `npm run lint`
   - Deploy to your host

## Getting Help

1. **Check Documentation**
   - `LIVE_MONITORING_GUIDE.md` - Complete reference
   - `LIVE_MONITORING_TROUBLESHOOTING.md` - Common issues

2. **Inspect Console**
   - Browser DevTools → Console
   - Look for error messages
   - Check WebSocket messages

3. **Enable Debug Logging**
   - Check connection: `websocketService.isConnected()`
   - View messages: `websocketService.getMessageHistory()`
   - Check toasts: `useToastStore.getState().toasts`

## Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run lint         # Check code quality
npm run format       # Auto-format code
npm test             # Run tests
npm test:ui          # Open test dashboard

# Utilities
npm install          # Install dependencies
npm run prepare      # Setup git hooks
```

## Performance Tips

- ✅ Limit symbols to 5-10 for optimal performance
- ✅ Monitor Connection Status latency
- ✅ Use browser DevTools Performance tab
- ✅ Check message history size: shouldn't exceed ~100
- ✅ Clear history if experiencing slowness

## Security Best Practices

- ✅ Never share authentication tokens
- ✅ Use HTTPS/WSS in production
- ✅ Validate all user inputs
- ✅ Log out when finished
- ✅ Review browser console for security warnings

---

**Ready to start?** Click "Live Monitoring" in the sidebar now! 🚀

For detailed documentation, see `LIVE_MONITORING_GUIDE.md`.
