import { useCallback } from 'react';
import { useAuthStore } from '@store/authStore';
import { authAPI, type LoginRequest, type RegisterRequest } from '@api/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, logout, setIsLoading, setError } =
    useAuthStore();

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authAPI.login(credentials);
        login(response.user, response.token);
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return response;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error &&
          'response' in err &&
          typeof err.response === 'object' &&
          err.response !== null &&
          'data' in err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'message' in err.response.data
            ? String(err.response.data.message)
            : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login, setError, setIsLoading]
  );

  const handleRegister = useCallback(
    async (credentials: RegisterRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authAPI.register(credentials);
        login(response.user, response.token);
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return response;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error &&
          'response' in err &&
          typeof err.response === 'object' &&
          err.response !== null &&
          'data' in err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'message' in err.response.data
            ? String(err.response.data.message)
            : 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login, setError, setIsLoading]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
    }
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};
