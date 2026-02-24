import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Axios instance for API v1
const Axios = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to configure auth interceptor
const configureAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Get the active organization ID
        const orgId = (window.Clerk as any)?.organization?.id;

        // Get token from Clerk session with organization context
        const token = await window.Clerk?.session?.getToken({
          ...(orgId && { organizationId: orgId })
        });

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }

      return config;
    },
    (error) => {
      console.error('Axios request interceptor error:', error);
      return Promise.reject(error);
    }
  );
};

// Track if we're currently syncing to prevent infinite loops
let isSyncing = false;

// Helper function to configure response interceptor for error handling
const configureResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 unauthorized
      if (error.response?.status === 401) {
        // Redirect to admin login page
        window.location.href = '/admin';
        return Promise.reject(error);
      }

      // Handle 403 "Organization context required"
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes('Organization context required')
      ) {
        console.error('Organization context missing. Please select an organization.');
        // Don't retry - user needs to select an organization
        return Promise.reject(error);
      }

      // Handle 404 "User not found" by auto-syncing
      if (
        error.response?.status === 404 &&
        error.response?.data?.message?.includes('User profile not found') &&
        !originalRequest._retry &&
        !isSyncing
      ) {
        originalRequest._retry = true;
        isSyncing = true;

        try {
          // Check if we have an organization context before syncing
          const hasOrg = (window.Clerk as any)?.organization?.id;
          if (!hasOrg) {
            console.error('Cannot sync user: No organization selected');
            isSyncing = false;
            return Promise.reject(new Error('Please select an organization before continuing'));
          }

          // Attempt to sync the user
          await instance.post('/users/sync');
          isSyncing = false;

          // Retry the original request
          return instance(originalRequest);
        } catch (syncError) {
          isSyncing = false;
          console.error('Failed to sync user:', syncError);
          return Promise.reject(syncError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Helper function to configure retry logic
const configureRetry = (instance: AxiosInstance) => {
  axiosRetry(instance, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
  });
};

// Apply interceptors and retry logic
configureAuthInterceptor(Axios);
configureResponseInterceptor(Axios);
configureRetry(Axios);

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Axios configured with baseURL:', BASE_URL);
}

export default Axios;
