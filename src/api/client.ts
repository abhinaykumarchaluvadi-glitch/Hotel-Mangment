import axios from 'axios';

// Determine if we should use Mock Database (defaults to true for standalone operation)
const MOCK_KEY = 'hms_use_mock';
if (localStorage.getItem(MOCK_KEY) === null) {
  localStorage.setItem(MOCK_KEY, 'true');
}

export const isMockMode = (): boolean => {
  return localStorage.getItem(MOCK_KEY) === 'true';
};

export const setMockMode = (value: boolean) => {
  localStorage.setItem(MOCK_KEY, value ? 'true' : 'false');
  window.location.reload(); // reload to re-initialize queries
};

const DEFAULT_BASE_URL = import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      // Redirection logic can be handled in router or context, but we clear data here
    }
    return Promise.reject(error);
  }
);

// Delay utility to simulate network latency for Mock mode
export const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
