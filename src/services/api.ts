import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu data là FormData, không set Content-Type để axios tự động set với boundary
    // Backend hỗ trợ cả application/json và multipart/form-data
    if (config.data instanceof FormData) {
      // Axios sẽ tự động set Content-Type: multipart/form-data với boundary
      // Không set manually
      console.log('[API Request] FormData detected, letting axios set Content-Type with boundary');
    } else if (config.headers && !config.headers['Content-Type']) {
      // Chỉ set Content-Type nếu không phải FormData và chưa được set
      config.headers['Content-Type'] = 'application/json';
    }

    // Log for debugging (remove in production)
    console.log('[API Request]', config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
      tokenLength: token?.length,
      isFormData: config.data instanceof FormData,
      contentType: config.headers?.['Content-Type'],
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    
    if (config.data && !(config.data instanceof FormData)) {
      console.log('[API Request] Body:', config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API Request] Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error for debugging
    console.error('[API Error]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      fullURL: `${originalRequest?.baseURL}${originalRequest?.url}`,
      method: originalRequest?.method,
      message: error.response?.data?.message || error.message,
      errorCode: error.response?.data?.errorCode,
      details: error.response?.data?.details,
      fullError: error.response?.data,
      requestData: originalRequest?.data,
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('[API] Attempting to refresh token...');
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
            { refreshToken }
          );

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }

          console.log('[API] Token refreshed, retrying request...');
          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[API] Token refresh failed, logging out...');
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('[API] No refresh token available, redirecting to login...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Bạn không có quyền thực hiện thao tác này';
      console.error('[API] 403 Forbidden:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        message: errorMessage,
        errorCode: error.response?.data?.errorCode,
      });
      
      // Check if token exists
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[API] No access token found, redirecting to login...');
        window.location.href = '/login';
      } else {
        // Show user-friendly error message
        // This will be caught by component error handlers
        const customError = new Error(errorMessage);
        (customError as any).response = error.response;
        (customError as any).status = 403;
        return Promise.reject(customError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

