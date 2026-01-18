import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/config/constants';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Readonly<ProtectedRouteProps>) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
