import { useAuth } from '@clerk/clerk-react';
import { useEffect, ReactNode } from 'react';
import apiClient from '@/services/axios';

export function AxiosProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      apiClient.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return <>{children}</>;
}
