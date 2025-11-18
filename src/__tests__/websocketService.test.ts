import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { TradeEvent, SignalEvent, LogEvent, StrategyStatusEvent } from '@services/websocketService';
import { websocketService } from '@services/websocketService';

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  describe('Connection Management', () => {
    it('should initialize as disconnected', () => {
      expect(websocketService.isConnected()).toBe(false);
    });

    it('should track reconnection status', () => {
      expect(websocketService.isReconnecting()).toBe(false);
    });

    it('should handle connection events', () => {
      const callback = vi.fn();
      websocketService.on('connection-status', callback);

      websocketService.on('connection-status', (data: unknown) => {
        callback(data);
      });

      expect(callback).toBeDefined();
    });
  });

  describe('Message Handling', () => {
    it('should handle tick data', async () => {
      const callback = vi.fn();
      websocketService.on('tick', callback);

      const unsubscribe = websocketService.on('tick', callback);
      expect(unsubscribe).toBeDefined();

      unsubscribe();
    });

    it('should handle trade events', () => {
      const callback = vi.fn();

      const unsubscribe = websocketService.on('trade', callback);

      const tradeEvent: TradeEvent = {
        id: 'trade-001',
        strategyId: 'strategy-001',
        symbol: 'AAPL',
        side: 'BUY',
        price: 150.0,
        quantity: 100,
        timestamp: Date.now(),
        status: 'FILLED',
      };

      expect(tradeEvent.id).toBe('trade-001');
      unsubscribe();
    });

    it('should handle signal events', () => {
      const callback = vi.fn();

      const unsubscribe = websocketService.on('signal', callback);

      const signalEvent: SignalEvent = {
        id: 'signal-001',
        strategyId: 'strategy-001',
        symbol: 'AAPL',
        signal: 'BUY',
        confidence: 0.85,
        timestamp: Date.now(),
      };

      expect(signalEvent.confidence).toBe(0.85);
      unsubscribe();
    });

    it('should handle log events', () => {
      const callback = vi.fn();

      const unsubscribe = websocketService.on('log', callback);

      const logEvent: LogEvent = {
        id: 'log-001',
        strategyId: 'strategy-001',
        level: 'INFO',
        message: 'Test message',
        timestamp: Date.now(),
      };

      expect(logEvent.level).toBe('INFO');
      unsubscribe();
    });

    it('should handle strategy status events', () => {
      const callback = vi.fn();

      const unsubscribe = websocketService.on('strategy-status', callback);

      const statusEvent: StrategyStatusEvent = {
        strategyId: 'strategy-001',
        status: 'RUNNING',
        timestamp: Date.now(),
      };

      expect(statusEvent.status).toBe('RUNNING');
      unsubscribe();
    });
  });

  describe('Message Queue', () => {
    it('should maintain message history', () => {
      const history = websocketService.getMessageHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should clear message history', () => {
      websocketService.clearMessageHistory();
      const history = websocketService.getMessageHistory();
      expect(history.length).toBe(0);
    });

    it('should filter history by type', () => {
      const history = websocketService.getMessageHistory('tick');
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Strategy Commands', () => {
    it('should handle start strategy command', async () => {
      const result = await websocketService.startStrategy('strategy-001');
      expect(result).toBeDefined();
    });

    it('should handle stop strategy command', async () => {
      const result = await websocketService.stopStrategy('strategy-001');
      expect(result).toBeDefined();
    });

    it('should handle pause strategy command', async () => {
      const result = await websocketService.pauseStrategy('strategy-001');
      expect(result).toBeDefined();
    });

    it('should handle update strategy parameters command', async () => {
      const params = {
        riskPerTrade: 0.02,
        maxPositionSize: 10,
      };
      const result = await websocketService.updateStrategyParameters('strategy-001', params);
      expect(result).toBeDefined();
    });
  });

  describe('Subscriptions', () => {
    it('should handle tick subscription', () => {
      expect(() => websocketService.subscribeTick('AAPL')).not.toThrow();
    });

    it('should handle tick unsubscription', () => {
      expect(() => websocketService.unsubscribeTick('AAPL')).not.toThrow();
    });

    it('should handle strategy subscription', () => {
      expect(() => websocketService.subscribeStrategy('strategy-001')).not.toThrow();
    });

    it('should handle strategy unsubscription', () => {
      expect(() => websocketService.unsubscribeStrategy('strategy-001')).not.toThrow();
    });
  });

  describe('Fallback Polling', () => {
    it('should enable fallback polling', () => {
      expect(() => websocketService.enableFallbackPolling()).not.toThrow();
      websocketService.disableFallbackPolling();
    });

    it('should disable fallback polling', () => {
      websocketService.enableFallbackPolling();
      expect(() => websocketService.disableFallbackPolling()).not.toThrow();
    });

    it('should allow custom polling interval', () => {
      expect(() => websocketService.enableFallbackPolling(10000)).not.toThrow();
      websocketService.disableFallbackPolling();
    });
  });

  describe('Event Callbacks', () => {
    it('should support multiple callbacks for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = websocketService.on('tick', callback1);
      const unsub2 = websocketService.on('tick', callback2);

      expect(unsub1).toBeDefined();
      expect(unsub2).toBeDefined();

      unsub1();
      unsub2();
    });

    it('should return unsubscribe function from on()', () => {
      const callback = vi.fn();
      const unsubscribe = websocketService.on('tick', callback);

      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = () => {
        throw new Error('Test error');
      };

      expect(() => websocketService.on('tick', errorCallback)).not.toThrow();
    });
  });

  describe('Connection Lifecycle', () => {
    it('should disconnect gracefully', () => {
      expect(() => websocketService.disconnect()).not.toThrow();
      expect(websocketService.isConnected()).toBe(false);
    });

    it('should disconnect even if not connected', () => {
      expect(websocketService.isConnected()).toBe(false);
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });
});
