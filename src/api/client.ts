import axios, { AxiosInstance } from 'axios';

let mockMode = false;

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const isMockMode = () => mockMode;
export const setMockMode = (value: boolean) => {
  mockMode = value;
  localStorage.setItem('hms_mockMode', JSON.stringify(value));
};

const savedMockMode = localStorage.getItem('hms_mockMode');
if (savedMockMode) {
  mockMode = JSON.parse(savedMockMode);
}

export default apiClient;
