import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { ROUTES, TOKEN_KEYS } from '@/config/constants';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Readonly<ProtectedRouteProps>) {
  const { isAuthenticated, setUser, setTokens, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;

    const refreshToken = storage.get<string>(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChecking(false);
      return;
    }

    // Attempt to refresh token and restore session
    authService
      .refreshToken(refreshToken)
      .then((response) => {
        if (response.data) {
          setTokens(response.data.accessToken, response.data.refreshToken);
          // Fetch profile to restore user
          return authService.getProfile();
        }
        throw new Error('No token data');
      })
      .then((profileResponse) => {
        if (profileResponse.data) {
          setUser({
            id: profileResponse.data.id,
            name: profileResponse.data.name,
            email: profileResponse.data.email,
            lastLoginAt: profileResponse.data.lastLoginAt ?? null,
            lastLoginDevice: profileResponse.data.lastLoginDevice ?? null,
          });
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [isAuthenticated, setUser, setTokens, logout]);

  if (isChecking) {
    return <LoadingSpinner label="Memverifikasi sesi..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
