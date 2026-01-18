import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/constants';
import { parseApiError, FormErrors } from '@/utils/error';
import { useState } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, setTokens, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data.user);
        setTokens(response.data.accessToken, response.data.refreshToken);
        setFormErrors({}); // Clear errors on success
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: (error) => {
      const { formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data.user);
        setTokens(response.data.accessToken, response.data.refreshToken);
        setFormErrors({}); // Clear errors on success
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: (error) => {
      const { formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      setFormErrors({});
      navigate(ROUTES.LOGIN);
    },
  });

  // Get profile query
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: Infinity,
  });

  return {
    user,
    isAuthenticated,
    profile: profileData?.data,
    isLoadingProfile,
    formErrors,
    setFormErrors,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
