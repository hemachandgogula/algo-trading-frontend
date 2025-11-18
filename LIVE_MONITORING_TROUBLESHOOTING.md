# Live Monitoring - Troubleshooting Guide

## Quick Diagnostics

### 1. Check WebSocket Connection

**Browser Console:**
```javascript
// Check if WebSocket is connected
import { websocketService } from '@services/websocketService';
console.log('Connected:', websocketService.isConnected());
console.log('Reconnecting:', websocketService.isReconnecting());

// View recent messages
console.log(websocketService.getMessageHistory());

// View tick data only
console.log(websocketService.getMessageHistory('tick'));
```

### 2. Verify Backend Connectivity

**Terminal:**
```bash
# Test WebSocket endpoint
wscat -c ws://localhost:3001

# Test HTTP endpoint
curl http://localhost:3001/api/health

# Check port is open
netstat -an | grep 3001
```

---

## Common Issues & Solutions

### Issue 1: "WebSocket disconnected" Message Shows Constantly

**Symptoms:**
- Connection status shows "Disconnected"
- Live data not updating
- Page shows fallback polling mode

**Diagnostic Steps:**

1. **Check WebSocket URL:**
   ```bash
   # Verify VITE_WS_URL environment variable
   echo $VITE_WS_URL
   
   # Default should be ws://localhost:3001
   # For production: wss://your-domain.com
   ```

2. **Test Backend Connectivity:**
   ```bash
   # Install wscat if needed
   npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:3001
   
   # Expected response: Connected (type ^C to exit)
   ```

3. **Check Browser Network Tab:**
   - Open DevTools → Network tab
   - Look for WebSocket connections (filter by "WS")
   - Check status code (should be 101 Switching Protocols)
   - Check for errors in response

4. **Firewall/Network:**
   ```bash
   # Check if port is accessible
   telnet localhost 3001
   
   # If not accessible, check firewall
   sudo ufw status (Ubuntu)
   sudo firewall-cmd --list-all (CentOS)
   ```

**Solutions:**

- ✅ Restart backend server
- ✅ Verify `VITE_WS_URL` is correct in `.env`
- ✅ Check backend logs for errors
- ✅ Try fallback polling mode
- ✅ Check browser network connectivity

---

### Issue 2: Ticker Shows "Waiting for data..." Indefinitely

**Symptoms:**
- Live Ticker component renders but shows no prices
- Bid/Ask/Volume remain empty
- No data appears even after long wait

**Diagnostic Steps:**

1. **Check Subscription:**
   ```javascript
   // In browser console
   console.log(websocketService.getMessageHistory('tick'));
   // Should show recent tick messages
   ```

2. **Verify Symbol Format:**
   - Symbols must be uppercase: "AAPL" not "aapl"
   - Check symbol exists in backend data feed
   - Try common symbols: AAPL, GOOGL, MSFT

3. **Check Backend Symbol Subscription:**
   ```bash
   # In backend logs, look for:
   # "Client subscribed to tick: AAPL"
   # If not present, subscription didn't work
   ```

**Solutions:**

- ✅ Verify symbols are uppercase
- ✅ Check backend has data for those symbols
- ✅ Unsubscribe and resubscribe to symbol
- ✅ Verify `/ws/market` endpoint is active
- ✅ Check backend market data feed is running

---

### Issue 3: Activity Dashboard Stays Empty

**Symptoms:**
- Activity Dashboard shows "No activities yet"
- No trades, signals, or logs appear
- Activity feed never updates

**Diagnostic Steps:**

1. **Check Strategy Status:**
   ```javascript
   // Check if strategy is running
   console.log(websocketService.getMessageHistory('strategy-status'));
   ```

2. **Verify Strategy ID:**
   - Match exactly with backend strategy ID
   - Check for typos or case sensitivity
   - Verify strategy exists and is active

3. **Check Event Channels:**
   ```javascript
   // Check each event type
   console.log('Trades:', websocketService.getMessageHistory('trade'));
   console.log('Signals:', websocketService.getMessageHistory('signal'));
   console.log('Logs:', websocketService.getMessageHistory('log'));
   ```

4. **Start Strategy:**
   - Use Strategy Controls to start the strategy
   - Look for logs/trades in Activity Dashboard after starting

**Solutions:**

- ✅ Verify strategy ID matches backend
- ✅ Start strategy using controls (if stopped)
- ✅ Check backend is generating events
- ✅ Review backend logs for activity
- ✅ Try switching to different strategy

---

### Issue 4: Strategy Controls Buttons Don't Respond

**Symptoms:**
- Start/Stop/Pause buttons don't trigger actions
- No error messages shown
- Connection status shows connected

**Diagnostic Steps:**

1. **Check Button State:**
   ```javascript
   // Browser console - check if buttons are enabled
   document.querySelectorAll('button[name*="Start"]').forEach(btn => 
     console.log(btn.textContent, 'disabled:', btn.disabled)
   );
   ```

2. **Monitor Network Requests:**
   - Open DevTools → Network tab
   - Click a strategy control button
   - Look for WebSocket message being sent
   - Check for errors in response

3. **Check Permissions:**
   ```bash
   # Backend should have strategy control endpoints
   # Verify user has permission to control strategies
   ```

**Solutions:**

- ✅ Verify WebSocket is connected
- ✅ Check backend strategy control endpoints exist
- ✅ Verify user has strategy control permissions
- ✅ Check browser console for errors
- ✅ Try manual reconnection

---

### Issue 5: Notifications (Toasts) Not Appearing

**Symptoms:**
- No success/error messages appear after actions
- Silent failures
- No visual feedback for operations

**Diagnostic Steps:**

1. **Verify Toast Container:**
   ```jsx
   // In src/app/App.tsx, should include:
   <ToastContainer />
   ```

2. **Check Toast Store:**
   ```javascript
   // Browser console
   import { useToastStore } from '@store/toastStore';
   const state = useToastStore.getState();
   console.log('Toasts:', state.toasts);
   ```

3. **Test Toast Manually:**
   ```javascript
   // Manually trigger a toast
   useToastStore.getState().addToast({
     message: 'Test notification',
     type: 'success',
   });
   // Should see notification appear
   ```

**Solutions:**

- ✅ Verify ToastContainer in App.tsx
- ✅ Check component is using useToastStore correctly
- ✅ Verify toast duration is > 0
- ✅ Check browser console for errors
- ✅ Restart development server

---

### Issue 6: High Latency - Updates Very Slow

**Symptoms:**
- Ticker prices update slowly
- Activity feed lags significantly
- Latency shown in connection indicator is high

**Diagnostic Steps:**

1. **Check Latency Reading:**
   - Look at Connection Status component
   - If latency > 1000ms, network issue
   - Check with multiple page reloads

2. **Monitor Browser Performance:**
   ```javascript
   // Check console for errors
   // Open DevTools Performance tab
   // Look for long tasks or blocked events
   ```

3. **Check System Resources:**
   ```bash
   # Check CPU usage
   top
   
   # Check memory usage
   free -h
   
   # Check network latency
   ping localhost
   ping backend-server-ip
   ```

4. **Backend Health:**
   ```bash
   # Check backend response time
   time curl http://localhost:3001/api/health
   
   # Check backend logs for slow operations
   tail -f backend.log | grep "slow\|latency"
   ```

**Solutions:**

- ✅ Close other browser tabs
- ✅ Reduce number of subscribed symbols
- ✅ Check backend server CPU/memory
- ✅ Verify network bandwidth
- ✅ Consider using fallback polling if WebSocket slow
- ✅ Enable browser hardware acceleration

---

### Issue 7: Page Freezes or Crashes

**Symptoms:**
- Page becomes unresponsive
- Browser tab crashes
- Memory usage increases rapidly

**Diagnostic Steps:**

1. **Check Memory Leaks:**
   - Open DevTools → Memory tab
   - Take heap snapshot
   - Look for large retained objects
   - Check for unbounded array growth

2. **Check Message Queue Size:**
   ```javascript
   // Message history shouldn't exceed ~100 items
   console.log(
     'Message queue size:',
     websocketService.getMessageHistory().length
   );
   ```

3. **Identify Problematic Component:**
   - Disable LiveTicker, test
   - Disable ActivityDashboard, test
   - Disable StrategyControls, test
   - Identify which component causes freeze

4. **Browser Console Errors:**
   - Look for repeated error messages
   - Check for stack overflow errors
   - Look for infinite loops

**Solutions:**

- ✅ Clear message history: `websocketService.clearMessageHistory()`
- ✅ Reduce active subscriptions
- ✅ Unsubscribe from unused symbols
- ✅ Restart WebSocket connection
- ✅ Reload page
- ✅ Check for memory leaks in components

---

### Issue 8: Reconnection Loop - Constant Reconnecting

**Symptoms:**
- Connection status shows "Reconnecting..." constantly
- Never establishes stable connection
- Multiple reconnection attempts in logs

**Diagnostic Steps:**

1. **Check Reconnection Settings:**
   ```javascript
   // Check reconnection attempts
   // Default: 5 attempts with increasing delays
   ```

2. **Backend Availability:**
   ```bash
   # Continuous test of backend
   while true; do
     curl http://localhost:3001/api/health
     sleep 2
   done
   ```

3. **Check for Backend Issues:**
   ```bash
   # Check backend process
   ps aux | grep backend
   
   # Check backend logs
   tail -100 backend.log
   
   # Check for errors/crashes
   ```

**Solutions:**

- ✅ Verify backend server is running
- ✅ Check backend logs for errors
- ✅ Restart backend server
- ✅ Check backend configuration
- ✅ Verify network connectivity
- ✅ Manually reconnect with button

---

### Issue 9: Symbols Not Updating After Being Added

**Symptoms:**
- Add symbol to list successfully
- Symbol appears in chip
- But ticker doesn't show data for new symbol

**Diagnostic Steps:**

1. **Verify Subscription:**
   ```javascript
   // Check if subscribe-tick message was sent
   console.log(websocketService.getMessageHistory());
   ```

2. **Check Symbol in History:**
   ```javascript
   // Look for specific symbol
   const ticks = websocketService.getMessageHistory('tick');
   console.log('Ticks for new symbol:', 
     ticks.filter(t => t.data.symbol === 'NEW_SYMBOL')
   );
   ```

3. **Network Timing:**
   - Symbol added correctly
   - Check if subscription message sent immediately
   - May need to wait for first data point

**Solutions:**

- ✅ Verify symbol is uppercase
- ✅ Wait a few seconds for data to arrive
- ✅ Check backend has data for symbol
- ✅ Remove and re-add symbol
- ✅ Restart WebSocket connection

---

### Issue 10: Fallback Polling Not Working

**Symptoms:**
- WebSocket disconnected
- No fallback polling indicator
- Data stops updating completely

**Diagnostic Steps:**

1. **Check Polling Enabled:**
   ```javascript
   // Should be called in LiveMonitoringPage
   websocketService.enableFallbackPolling();
   ```

2. **Check Polling Interval:**
   ```javascript
   // Default is 5000ms (5 seconds)
   websocketService.getMessageHistory()
     .filter(m => m.type === 'fallback-poll')
     .slice(-5)  // Last 5 polls
   ```

3. **Verify Fallback Events:**
   - Monitor console for fallback events
   - Should see periodic `fallback-poll` events

**Solutions:**

- ✅ Ensure fallback polling is enabled
- ✅ Verify polling interval isn't too long
- ✅ Check backend can handle fallback requests
- ✅ Review backend HTTP fallback endpoints

---

## Advanced Debugging

### Enable Verbose Logging

**Create Debug File (`src/utils/debugWebSocket.ts`):**
```typescript
import { websocketService } from '@services/websocketService';

export function enableDebugLogging() {
  // Log all events
  ['tick', 'trade', 'signal', 'log', 'strategy-status', 'connection-status'].forEach(event => {
    websocketService.on(event, (data) => {
      console.log(`[WS Event] ${event}:`, data);
    });
  });

  // Log all messages to file
  setInterval(() => {
    const messages = websocketService.getMessageHistory();
    console.table(messages.slice(-10).map(m => ({
      type: m.type,
      time: new Date(m.timestamp).toLocaleTimeString(),
    })));
  }, 10000);
}
```

**Use in component:**
```typescript
import { enableDebugLogging } from '@utils/debugWebSocket';

useEffect(() => {
  if (import.meta.env.DEV) {
    enableDebugLogging();
  }
}, []);
```

### Network Inspection

**Check WebSocket Frames:**
1. Open DevTools → Network tab
2. Filter by WS
3. Click on WebSocket connection
4. View Messages tab
5. See all sent/received frames

### Performance Profiling

**Measure Component Performance:**
```typescript
import { Profiler } from 'react';

<Profiler 
  id="LiveTicker"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  }}
>
  <LiveTicker symbols={symbols} />
</Profiler>
```

---

## Getting Help

### Information to Include

When reporting issues, provide:

1. **Environment:**
   - Browser and version
   - OS
   - `VITE_WS_URL` value
   - Backend URL

2. **Error Message:**
   - Exact error text
   - Browser console errors (copy entire error)
   - Backend logs if available

3. **Reproduction Steps:**
   - Exact steps to reproduce
   - Expected vs actual behavior
   - When issue started (if regression)

4. **Debugging Info:**
   ```javascript
   // Provide output of:
   console.log({
     connected: websocketService.isConnected(),
     reconnecting: websocketService.isReconnecting(),
     messageCount: websocketService.getMessageHistory().length,
     recentMessages: websocketService.getMessageHistory().slice(-5),
   });
   ```

### Useful Commands

```bash
# Check all backend WebSocket endpoints
grep -r "socket.on\|socket.emit" backend/src

# Monitor WebSocket traffic (if tcpdump available)
sudo tcpdump -i lo port 3001 -A

# Check browser WebSocket in console
# DevTools → Console → filter for 'websocket'
```

---

## References

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Browser DevTools WebSocket Debugging](https://developer.chrome.com/docs/devtools/network/websocket/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Material-UI Documentation](https://mui.com/)
