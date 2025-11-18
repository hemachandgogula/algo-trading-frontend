import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore } from '@store/toastStore';

describe('ToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  describe('Toast Management', () => {
    it('should start with empty toasts', () => {
      const { toasts } = useToastStore.getState();
      expect(toasts).toEqual([]);
    });

    it('should add a toast', () => {
      const { addToast } = useToastStore.getState();
      const toastId = addToast({
        message: 'Test message',
        type: 'success',
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].id).toBe(toastId);
    });

    it('should add multiple toasts', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: 'First', type: 'success' });
      addToast({ message: 'Second', type: 'error' });
      addToast({ message: 'Third', type: 'warning' });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(3);
    });

    it('should remove a toast', () => {
      const { addToast, removeToast } = useToastStore.getState();
      const id = addToast({ message: 'Test', type: 'info' });

      removeToast(id);

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(0);
    });

    it('should clear all toasts', () => {
      const { addToast, clearAll } = useToastStore.getState();
      addToast({ message: 'First', type: 'success' });
      addToast({ message: 'Second', type: 'error' });

      clearAll();

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(0);
    });
  });

  describe('Toast Types', () => {
    it('should support success type', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: 'Success!', type: 'success' });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('success');
    });

    it('should support error type', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: 'Error!', type: 'error' });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('error');
    });

    it('should support warning type', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: 'Warning!', type: 'warning' });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('warning');
    });

    it('should support info type', () => {
      const { addToast } = useToastStore.getState();
      addToast({ message: 'Info', type: 'info' });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('info');
    });
  });

  describe('Toast Options', () => {
    it('should support custom duration', () => {
      const { addToast } = useToastStore.getState();
      addToast({
        message: 'Test',
        type: 'info',
        duration: 10000,
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(10000);
    });

    it('should support zero duration (no auto-dismiss)', () => {
      const { addToast } = useToastStore.getState();
      addToast({
        message: 'Test',
        type: 'info',
        duration: 0,
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(0);
    });

    it('should support action buttons', () => {
      const { addToast } = useToastStore.getState();
      const callback = vi.fn();

      addToast({
        message: 'Test',
        type: 'info',
        action: {
          label: 'Retry',
          callback,
        },
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].action).toBeDefined();
      expect(toasts[0].action?.label).toBe('Retry');
    });
  });

  describe('Toast IDs', () => {
    it('should generate unique IDs', () => {
      const { addToast } = useToastStore.getState();
      const toastId1 = addToast({ message: 'First', type: 'success' });
      const toastId2 = addToast({ message: 'Second', type: 'success' });

      expect(toastId1).not.toBe(toastId2);
    });

    it('should return ID from addToast', () => {
      const { addToast } = useToastStore.getState();
      const id = addToast({ message: 'Test', type: 'info' });

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('Toast Removal', () => {
    it('should only remove specified toast', () => {
      const { addToast, removeToast } = useToastStore.getState();
      const toastId1 = addToast({ message: 'First', type: 'success' });
      addToast({ message: 'Second', type: 'success' });

      removeToast(toastId1);

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Second');
    });

    it('should handle removing non-existent toast', () => {
      const { removeToast } = useToastStore.getState();
      expect(() => removeToast('non-existent')).not.toThrow();
    });
  });
});
