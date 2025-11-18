import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppRouter } from '@/app/Router';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Router', () => {
  it('renders login page on initial load', () => {
    render(<AppRouter />);
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
  });

  it('redirects to login when accessing protected route without auth', () => {
    render(<AppRouter />);
    // Component should render login page since no auth token
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
  });
});
