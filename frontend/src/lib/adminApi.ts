// Admin API hooks and utilities for connecting admin pages to real backend data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, bookingsApi, dashboardApi, servicesApi } from '@/lib/api';

// ==================== Dashboard ====================

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: async () => {
      const { data } = await dashboardApi.getOverview();
      return data.data;
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await dashboardApi.getAnalytics({ days: 30 });
      return data.data;
    },
  });
}

// ==================== Users ====================

export function useAdminUsers(page = 1, limit = 20, role?: string) {
  return useQuery({
    queryKey: ['admin-users', page, limit, role],
    queryFn: async () => {
      const { data } = await adminApi.getUsers({ page, limit, role });
      return data;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

// ==================== Staff/Cleaners ====================

export function useAdminStaff() {
  return useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data } = await adminApi.getStaff();
      return data.data;
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
  });
}

// ==================== Bookings ====================

export function useAdminBookings(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ['admin-bookings', page, limit, status],
    queryFn: async () => {
      const { data } = await bookingsApi.adminAll({ page, limit, status });
      return data;
    },
  });
}

export function useAssignStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, staffId }: { id: string; staffId: string }) =>
      bookingsApi.assignStaff(id, { staffId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

// ==================== Admin Analytics ====================

export function useAdminAnalyticsData() {
  return useQuery({
    queryKey: ['admin-analytics-data'],
    queryFn: async () => {
      const { data } = await adminApi.getAnalytics();
      return data.data;
    },
  });
}

// ==================== Services ====================

export function useAllServices() {
  return useQuery({
    queryKey: ['services-all'],
    queryFn: async () => {
      const { data } = await servicesApi.getAll();
      return data.data;
    },
  });
}
