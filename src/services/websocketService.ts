import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

export interface TickData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
}

export interface TradeEvent {
  id: string;
  strategyId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}

export interface SignalEvent {
  id: string;
  strategyId: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: number;
}

export interface LogEvent {
  id: string;
  strategyId: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: number;
}

export interface StrategyStatusEvent {
  strategyId: string;
  status: 'RUNNING' | 'STOPPED' | 'PAUSED' | 'ERROR';
  errorMessage?: string;
  timestamp: number;
}

type WebSocketCallback = (data: unknown) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private connected: boolean = false;
  private reconnecting: boolean = false;
  private callbacksByType: Map<string, Set<WebSocketCallback>> = new Map();
  private fallbackIntervalId: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private maxQueueSize = 100;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  connect(options?: { reconnection?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          reconnection: options?.reconnection !== false,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          this.connected = true;
          this.reconnecting = false;
          this.emit('connection-status', { connected: true, timestamp: Date.now() });
          resolve();
        });

        this.socket.on('disconnect', () => {
          this.connected = false;
          this.emit('connection-status', { connected: false, timestamp: Date.now() });
        });

        this.socket.on('reconnecting', () => {
          this.reconnecting = true;
          this.emit('connection-status', { connected: false, reconnecting: true, timestamp: Date.now() });
        });

        this.socket.on('error', (error) => {
          this.emit('ws-error', { error: error?.message || 'WebSocket error', timestamp: Date.now() });
          reject(error);
        });

        this.socket.on('tick', (data: TickData) => {
          this.handleMessage('tick', data);
        });

        this.socket.on('trade', (data: TradeEvent) => {
          this.handleMessage('trade', data);
        });

        this.socket.on('signal', (data: SignalEvent) => {
          this.handleMessage('signal', data);
        });

        this.socket.on('log', (data: LogEvent) => {
          this.handleMessage('log', data);
        });

        this.socket.on('strategy-status', (data: StrategyStatusEvent) => {
          this.handleMessage('strategy-status', data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  isReconnecting(): boolean {
    return this.reconnecting;
  }

  subscribeTick(symbol: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-tick', { symbol });
    }
  }

  unsubscribeTick(symbol: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-tick', { symbol });
    }
  }

  subscribeStrategy(strategyId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-strategy', { strategyId });
    }
  }

  unsubscribeStrategy(strategyId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-strategy', { strategyId });
    }
  }

  startStrategy(strategyId: string): Promise<unknown> {
    return this.emit('strategy-start', { strategyId });
  }

  stopStrategy(strategyId: string): Promise<unknown> {
    return this.emit('strategy-stop', { strategyId });
  }

  pauseStrategy(strategyId: string): Promise<unknown> {
    return this.emit('strategy-pause', { strategyId });
  }

  updateStrategyParameters(strategyId: string, parameters: Record<string, unknown>): Promise<unknown> {
    return this.emit('strategy-update-params', { strategyId, parameters });
  }

  on(eventType: string, callback: WebSocketCallback): () => void {
    if (!this.callbacksByType.has(eventType)) {
      this.callbacksByType.set(eventType, new Set());
    }
    this.callbacksByType.get(eventType)!.add(callback);

    return () => {
      this.callbacksByType.get(eventType)?.delete(callback);
    };
  }

  private handleMessage(type: string, data: unknown): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.messageQueue.push(message);
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift();
    }

    this.emit(type, data);
  }

  private emit(eventType: string, data: unknown): Promise<unknown> {
    const callbacks = this.callbacksByType.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in callback for event ${eventType}:`, error);
        }
      });
    }
    return Promise.resolve(data);
  }

  getMessageHistory(type?: string): WebSocketMessage[] {
    if (!type) return [...this.messageQueue];
    return this.messageQueue.filter((msg) => msg.type === type);
  }

  clearMessageHistory(): void {
    this.messageQueue = [];
  }

  enableFallbackPolling(interval: number = 5000): void {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
    }
    this.fallbackIntervalId = setInterval(() => {
      if (!this.connected) {
        this.emit('fallback-poll', { timestamp: Date.now() });
      }
    }, interval);
  }

  disableFallbackPolling(): void {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
  }
}

export const websocketService = new WebSocketService();
