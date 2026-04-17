import * as adminApi from '@/lib/adminApi';

describe('Admin API Hooks', () => {
  it('should define useAdminUsers hook', () => {
    expect(adminApi.useAdminUsers).toBeDefined();
    expect(typeof adminApi.useAdminUsers).toBe('function');
  });

  it('should define useUpdateUser hook', () => {
    expect(adminApi.useUpdateUser).toBeDefined();
    expect(typeof adminApi.useUpdateUser).toBe('function');
  });

  it('should define useDeleteUser hook', () => {
    expect(adminApi.useDeleteUser).toBeDefined();
    expect(typeof adminApi.useDeleteUser).toBe('function');
  });

  it('should define useCreateUser hook', () => {
    expect(adminApi.useCreateUser).toBeDefined();
    expect(typeof adminApi.useCreateUser).toBe('function');
  });

  it('should define useAdminStaff hook', () => {
    expect(adminApi.useAdminStaff).toBeDefined();
    expect(typeof adminApi.useAdminStaff).toBe('function');
  });

  it('should define useCreateStaff hook', () => {
    expect(adminApi.useCreateStaff).toBeDefined();
    expect(typeof adminApi.useCreateStaff).toBe('function');
  });

  it('should define useUpdateStaff hook', () => {
    expect(adminApi.useUpdateStaff).toBeDefined();
    expect(typeof adminApi.useUpdateStaff).toBe('function');
  });

  it('should define useDeleteStaff hook', () => {
    expect(adminApi.useDeleteStaff).toBeDefined();
    expect(typeof adminApi.useDeleteStaff).toBe('function');
  });

  it('should define useAdminBookings hook', () => {
    expect(adminApi.useAdminBookings).toBeDefined();
    expect(typeof adminApi.useAdminBookings).toBe('function');
  });

  it('should define useAssignStaff hook', () => {
    expect(adminApi.useAssignStaff).toBeDefined();
    expect(typeof adminApi.useAssignStaff).toBe('function');
  });

  it('should define useAdminUpdateBooking hook', () => {
    expect(adminApi.useAdminUpdateBooking).toBeDefined();
    expect(typeof adminApi.useAdminUpdateBooking).toBe('function');
  });

  it('should define useAdminDeleteBooking hook', () => {
    expect(adminApi.useAdminDeleteBooking).toBeDefined();
    expect(typeof adminApi.useAdminDeleteBooking).toBe('function');
  });

  it('should define useBulkConfirmBookings hook', () => {
    expect(adminApi.useBulkConfirmBookings).toBeDefined();
    expect(typeof adminApi.useBulkConfirmBookings).toBe('function');
  });

  it('should define useBulkCancelBookings hook', () => {
    expect(adminApi.useBulkCancelBookings).toBeDefined();
    expect(typeof adminApi.useBulkCancelBookings).toBe('function');
  });

  it('should define useUserBookings hook', () => {
    expect(adminApi.useUserBookings).toBeDefined();
    expect(typeof adminApi.useUserBookings).toBe('function');
  });

  it('should define useAdminBookingOne hook', () => {
    expect(adminApi.useAdminBookingOne).toBeDefined();
    expect(typeof adminApi.useAdminBookingOne).toBe('function');
  });

  it('should define useAdminDashboardOverview hook', () => {
    expect(adminApi.useAdminDashboardOverview).toBeDefined();
    expect(typeof adminApi.useAdminDashboardOverview).toBe('function');
  });

  it('should define useAdminAnalytics hook', () => {
    expect(adminApi.useAdminAnalytics).toBeDefined();
    expect(typeof adminApi.useAdminAnalytics).toBe('function');
  });

  it('should define useAllServices hook', () => {
    expect(adminApi.useAllServices).toBeDefined();
    expect(typeof adminApi.useAllServices).toBe('function');
  });
});
