import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { useAuthStore } from '@store/authStore';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ isAuthenticated: false });
});

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    // Mock authenticated state
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </Router>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </Router>
    );

    // Should render login page instead of protected content
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });
});
