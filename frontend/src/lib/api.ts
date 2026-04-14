import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies with requests
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh using HTTP-only cookie
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        // Cookie was refreshed, retry original request
        return api(originalRequest);
      } catch {
        window.location.href = '/login';
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
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  createUser: (data: any) => api.post('/admin/users', data),
  getStaff: () => api.get('/admin/staff'),
  createStaff: (data: any) => api.post('/admin/staff', data),
  getAnalytics: () => api.get('/admin/analytics'),
};
