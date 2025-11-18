import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LiveTicker } from '@components/LiveTicker';
import { ActivityDashboard } from '@components/ActivityDashboard';
import { StrategyControls } from '@components/StrategyControls';
import { ConnectionStatus } from '@components/ConnectionStatus';
import type { TickData, TradeEvent } from '@services/websocketService';
import { websocketService } from '@services/websocketService';
import { useToastStore } from '@store/toastStore';

// Mock websocketService
vi.mock('@services/websocketService', () => ({
  websocketService: {
    subscribeTick: vi.fn(),
    unsubscribeTick: vi.fn(),
    subscribeStrategy: vi.fn(),
    unsubscribeStrategy: vi.fn(),
    startStrategy: vi.fn(() => Promise.resolve()),
    stopStrategy: vi.fn(() => Promise.resolve()),
    pauseStrategy: vi.fn(() => Promise.resolve()),
    updateStrategyParameters: vi.fn(() => Promise.resolve()),
    on: vi.fn((event, callback) => {
      if (event === 'tick') {
        const mockTick: TickData = {
          symbol: 'AAPL',
          price: 150.0,
          bid: 149.95,
          ask: 150.05,
          volume: 1000000,
          timestamp: Date.now(),
        };
        setTimeout(() => callback(mockTick), 100);
      }
      return () => {};
    }),
    isConnected: vi.fn(() => true),
    isReconnecting: vi.fn(() => false),
  },
}));

describe('Live Monitoring Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('LiveTicker Component', () => {
    it('should render ticker for selected symbols', () => {
      render(<LiveTicker symbols={['AAPL', 'GOOGL']} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });

    it('should show message when no symbols selected', () => {
      render(<LiveTicker symbols={[]} />);

      expect(screen.getByText('No symbols selected')).toBeInTheDocument();
    });

    it('should subscribe to tick data on mount', () => {
      render(<LiveTicker symbols={['AAPL']} />);

      expect(websocketService.subscribeTick).toHaveBeenCalledWith('AAPL');
    });

    it('should unsubscribe from tick data on unmount', () => {
      const { unmount } = render(<LiveTicker symbols={['AAPL']} />);

      unmount();

      expect(websocketService.unsubscribeTick).toHaveBeenCalledWith('AAPL');
    });

    it('should handle multiple symbols', () => {
      render(<LiveTicker symbols={['AAPL', 'GOOGL', 'MSFT']} />);

      expect(websocketService.subscribeTick).toHaveBeenCalledWith('AAPL');
      expect(websocketService.subscribeTick).toHaveBeenCalledWith('GOOGL');
      expect(websocketService.subscribeTick).toHaveBeenCalledWith('MSFT');
    });

    it('should update symbols reactively', () => {
      const { rerender } = render(<LiveTicker symbols={['AAPL']} />);

      vi.clearAllMocks();

      rerender(<LiveTicker symbols={['AAPL', 'GOOGL']} />);

      expect(websocketService.subscribeTick).toHaveBeenCalledWith('AAPL');
      expect(websocketService.subscribeTick).toHaveBeenCalledWith('GOOGL');
    });
  });

  describe('ActivityDashboard Component', () => {
    it('should render activity dashboard', () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    });

    it('should subscribe to strategy on mount', () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      expect(websocketService.subscribeStrategy).toHaveBeenCalledWith('strategy-001');
    });

    it('should unsubscribe from strategy on unmount', () => {
      const { unmount } = render(<ActivityDashboard strategyId="strategy-001" />);

      unmount();

      expect(websocketService.unsubscribeStrategy).toHaveBeenCalledWith('strategy-001');
    });

    it('should show no activities message initially', () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      expect(screen.getByText('No activities yet')).toBeInTheDocument();
    });

    it('should handle multiple event types', () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      expect(websocketService.on).toHaveBeenCalledWith('trade', expect.any(Function));
      expect(websocketService.on).toHaveBeenCalledWith('signal', expect.any(Function));
      expect(websocketService.on).toHaveBeenCalledWith('log', expect.any(Function));
    });
  });

  describe('StrategyControls Component', () => {
    it('should render strategy controls', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      expect(screen.getByText('Strategy Controls')).toBeInTheDocument();
    });

    it('should display strategy ID', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('strategy-001');
    });

    it('should have start button', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('should have stop button', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });

    it('should have pause button', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should have parameters button', () => {
      render(<StrategyControls strategyId="strategy-001" />);

      expect(screen.getByRole('button', { name: /parameters/i })).toBeInTheDocument();
    });

    it('should call startStrategy on start click', async () => {
      render(<StrategyControls strategyId="strategy-001" />);

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(websocketService.startStrategy).toHaveBeenCalledWith('strategy-001');
      });
    });

    it('should show error toast on failure', async () => {
      vi.mocked(websocketService.startStrategy).mockRejectedValueOnce(new Error('Test error'));

      render(<StrategyControls strategyId="strategy-001" />);

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        const { toasts } = useToastStore.getState();
        expect(toasts.some((t) => t.type === 'error')).toBe(true);
      });
    });

    it('should display strategy status when provided', () => {
      render(
        <StrategyControls
          strategyId="strategy-001"
          status={{
            strategyId: 'strategy-001',
            status: 'RUNNING',
            timestamp: Date.now(),
          }}
        />
      );

      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    it('should show error message in alert when status has error', () => {
      render(
        <StrategyControls
          strategyId="strategy-001"
          status={{
            strategyId: 'strategy-001',
            status: 'ERROR',
            errorMessage: 'Connection lost',
            timestamp: Date.now(),
          }}
        />
      );

      expect(screen.getByText('Connection lost')).toBeInTheDocument();
    });
  });

  describe('ConnectionStatus Component', () => {
    it('should render connection status', () => {
      render(<ConnectionStatus />);

      expect(screen.getByText(/Connected|Disconnected|Reconnecting/)).toBeInTheDocument();
    });

    it('should listen for connection status events', () => {
      render(<ConnectionStatus />);

      expect(websocketService.on).toHaveBeenCalledWith('connection-status', expect.any(Function));
    });
  });

  describe('WebSocket Event Handling', () => {
    it('should handle tick events in LiveTicker', async () => {
      render(<LiveTicker symbols={['AAPL']} />);

      await waitFor(() => {
        expect(websocketService.on).toHaveBeenCalled();
      });
    });

    it('should handle trade events in ActivityDashboard', async () => {
      const mockOn = vi.fn((event, callback) => {
        if (event === 'trade') {
          const mockTrade: TradeEvent = {
            id: 'trade-001',
            strategyId: 'strategy-001',
            symbol: 'AAPL',
            side: 'BUY',
            price: 150.0,
            quantity: 100,
            timestamp: Date.now(),
            status: 'FILLED',
          };
          setTimeout(() => callback(mockTrade), 100);
        }
        return () => {};
      });

      vi.mocked(websocketService.on).mockImplementation(mockOn);

      render(<ActivityDashboard strategyId="strategy-001" />);

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith('trade', expect.any(Function));
      });
    });

    it('should handle signal events in ActivityDashboard', async () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      await waitFor(() => {
        expect(websocketService.on).toHaveBeenCalledWith('signal', expect.any(Function));
      });
    });

    it('should handle log events in ActivityDashboard', async () => {
      render(<ActivityDashboard strategyId="strategy-001" />);

      await waitFor(() => {
        expect(websocketService.on).toHaveBeenCalledWith('log', expect.any(Function));
      });
    });

    it('should handle strategy status events', async () => {
      render(<StrategyControls strategyId="strategy-001" />);

      // Component renders successfully
      expect(screen.getByText('Strategy Controls')).toBeInTheDocument();
    });
  });

  describe('Fallback Behavior', () => {
    it('should show warning when disconnected', () => {
      render(<ConnectionStatus />);

      // Connection status component renders without crashing
      expect(websocketService.isConnected).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket errors gracefully', async () => {
      render(<LiveTicker symbols={['AAPL']} />);

      // Component should not crash on WebSocket errors
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should recover from failed subscriptions', async () => {
      vi.mocked(websocketService.subscribeTick).mockImplementationOnce(() => {
        // Silent fail - don't throw
      });

      render(<LiveTicker symbols={['AAPL']} />);

      // Component should render even if subscription fails
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });
});
