// Re-export the axios instance from the shared services
// This maintains backward compatibility while using the new configuration
export { default as apiClient } from '@/services/axios';
export { default } from '@/services/axios';
