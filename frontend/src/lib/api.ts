import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('[api] NEXT_PUBLIC_API_URL is not set. API calls will fail.');
}

const baseURL = API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies with requests
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle API errors globally with toast notifications
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.error?.message || data?.message || 'An unexpected error occurred';

      switch (status) {
        case 400:
          toast.error(message, { id: 'error-400' });
          break;
        case 401:
          // Only show toast if not already retrying
          if (!error.config._retry) {
            toast.error('Please log in to continue', { id: 'error-401' });
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action', { id: 'error-403' });
          break;
        case 404:
          toast.error('Resource not found', { id: 'error-404' });
          break;
        case 409:
          toast.error(message, { id: 'error-409' });
          break;
        case 429:
          toast.error('Too many requests. Please try again later', { id: 'error-429' });
          break;
        case 500:
          toast.error('Server error. Please try again later', { id: 'error-500' });
          break;
        default:
          toast.error(message, { id: `error-${status}` });
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection', { id: 'network-error' });
    } else {
      toast.error('An unexpected error occurred', { id: 'unknown-error' });
    }

    // Handle 401 retry logic
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh using HTTP-only cookie
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        // Cookie was refreshed, retry original request
        return api(originalRequest);
      } catch {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  refresh: (data: any) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const servicesApi = {
  getAll: (params?: any) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
};

export const bookingsApi = {
  getAll: (params?: any) => api.get('/bookings', { params }),
  adminAll: (params?: any) => api.get('/bookings/admin/all', { params }),
  adminGetOne: (id: string) => api.get(`/bookings/admin/${id}`),
  assignStaff: (id: string, data: { staffId: string }) => api.put(`/bookings/admin/${id}/assign`, data),
  adminUpdate: (id: string, data: any) => api.put(`/bookings/admin/${id}`, data),
  adminDelete: (id: string) => api.delete(`/bookings/admin/${id}`),
  bulkConfirm: (bookingIds: string[]) => api.post('/bookings/admin/bulk-confirm', { bookingIds }),
  bulkCancel: (bookingIds: string[]) => api.post('/bookings/admin/bulk-cancel', { bookingIds }),
  create: (data: any) => api.post('/bookings', data),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};

export const paymentsApi = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  history: (params?: any) => api.get('/payments/history', { params }),
};

export const reviewsApi = {
  create: (data: any) => api.post('/reviews', data),
  getByService: (serviceId: string, params?: any) => api.get(`/reviews/service/${serviceId}`, { params }),
};

export const menuApi = {
  getMenu: () => api.get('/menu'),
  getFlat: () => api.get('/menu/flat'),
};

export const dashboardApi = {
  getOverview: () => api.get('/dashboard'),
  getAnalytics: (params?: any) => api.get('/dashboard/analytics', { params }),
};

export const adminApi = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserBookings: (userId: string, params?: any) => api.get(`/admin/users/${userId}/bookings`, { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
  getStaff: () => api.get('/admin/staff'),
  createStaff: (data: any) => api.post('/admin/staff', data),
  updateStaff: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};
