'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Plus,
  Menu,
  X,
  Bell,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAdminBookings, useAdminStaff, useAssignStaff, useAdminDeleteBooking, useBulkConfirmBookings, useBulkCancelBookings, useAdminBookingOne } from '@/lib/adminApi';

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'CRM', href: '/admin/crm' },
  { icon: UserCheck, label: 'Cleaners', href: '/admin/cleaners' },
];

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function toTitleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function AdminBookings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState<string | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const [page, setPage] = useState(1);
  const limit = 20;
  const { data: bookingsData, isLoading } = useAdminBookings(page, limit, statusFilter === 'all' ? undefined : statusFilter);
  const { data: staff } = useAdminStaff();
  const assignMutation = useAssignStaff();
  const deleteBookingMutation = useAdminDeleteBooking();
  const bulkConfirmMutation = useBulkConfirmBookings();
  const bulkCancelMutation = useBulkCancelBookings();
  const { data: selectedBookingDetails, isLoading: isLoadingDetails } = useAdminBookingOne(bookingActionId || '');

  const bookings = useMemo(() => {
    return (bookingsData?.data || []).map((b: any) => ({
      id: b.id.substring(0, 8).toUpperCase(),
      customer: `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim() || 'Unknown',
      email: b.customer?.email || '',
      service: b.service?.name || 'Unknown',
      date: new Date(b.date).toLocaleDateString(),
      time: new Date(b.startTime || b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      address: b.address || '',
      suburb: '',
      status: (b.status || '').toUpperCase(),
      amount: Number(b.totalPrice || 0),
      cleaner: b.staff ? `${b.staff.user?.firstName || ''} ${b.staff.user?.lastName || ''}`.trim() : null,
    }));
  }, [bookingsData]);

  const cleanersList = (staff || []).map((s: any) => `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() || 'Staff');

  const filteredBookings = bookings
    .filter((b: any) => {
      const matchesSearch =
        b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a: any, b: any) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(filteredBookings.map((b: any) => b.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssignCleaner = () => {
    if (bookingToAssign && selectedCleaner) {
      // Find the actual booking ID from the API data
      const booking = (bookingsData?.data || []).find((b: any) => b.id.substring(0, 8).toUpperCase() === bookingToAssign);
      if (booking) {
        // Find staff member by name
        const staffMember = (staff || []).find((s: any) =>
          `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() === selectedCleaner
        );
        if (staffMember) {
          assignMutation.mutate({ id: booking.id, staffId: staffMember.id });
        }
      }
      setShowAssignModal(false);
      setBookingToAssign(null);
      setSelectedCleaner('');
    }
  };

  const handleBulkAction = (action: string) => {
    // Map short IDs to full API IDs
    const fullIds = selectedBookings
      .map((shortId) => {
        const booking = (bookingsData?.data || []).find(
          (b: any) => b.id.substring(0, 8).toUpperCase() === shortId
        );
        return booking?.id;
      })
      .filter(Boolean) as string[];

    if (action === 'confirm') {
      bulkConfirmMutation.mutate(fullIds, {
        onSettled: () => setSelectedBookings([]),
      });
    } else if (action === 'cancel') {
      bulkCancelMutation.mutate(fullIds, {
        onSettled: () => setSelectedBookings([]),
      });
    }
  };

  const handleViewBooking = (shortId: string) => {
    const booking = (bookingsData?.data || []).find(
      (b: any) => b.id.substring(0, 8).toUpperCase() === shortId
    );
    if (booking) {
      setBookingActionId(booking.id);
      setShowViewModal(true);
    }
  };

  const handleEditBooking = (shortId: string) => {
    const booking = (bookingsData?.data || []).find(
      (b: any) => b.id.substring(0, 8).toUpperCase() === shortId
    );
    if (booking) {
      setBookingActionId(booking.id);
      setEditForm({
        address: booking.address,
        notes: booking.notes || '',
        totalPrice: booking.totalPrice,
        status: booking.status,
        date: new Date(booking.date).toISOString().slice(0, 16),
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (!bookingActionId) return;
    // We'll use the adminUpdateBooking mutation — need to add it to the hook
    import('@/lib/api').then(({ bookingsApi }) => {
      bookingsApi.adminUpdate(bookingActionId, editForm)
        .then(() => {
          setShowEditModal(false);
          setBookingActionId(null);
          // Invalidate the query
          window.location.reload();
        })
        .catch(() => {});
    });
  };

  const handleDeleteBooking = (shortId: string) => {
    const booking = (bookingsData?.data || []).find(
      (b: any) => b.id.substring(0, 8).toUpperCase() === shortId
    );
    if (booking) {
      setBookingActionId(booking.id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (bookingActionId) {
      deleteBookingMutation.mutate(bookingActionId, {
        onSettled: () => {
          setShowDeleteConfirm(false);
          setBookingActionId(null);
        },
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Customer', 'Service', 'Date', 'Time', 'Status', 'Amount'].join(','),
      ...filteredBookings.map((b: any) =>
        [b.id, b.customer, b.service, b.date, b.time, b.status, b.amount].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = {
    total: bookingsData?.total || 0,
    pending: bookings.filter((b: any) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b: any) => b.status === 'CANCELLED').length,
    revenue: bookings.filter((b: any) => b.status !== 'CANCELLED').reduce((sum: number, b: any) => sum + b.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  link.href === '/admin/bookings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Bookings Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">{stats.pending}</span>
            </button>
          </div>
        </div>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold">${stats.revenue}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookings.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <span className="text-sm text-gray-600">{selectedBookings.length} selected</span>
                <button onClick={() => handleBulkAction('confirm')} className="text-sm text-green-600 hover:underline">
                  Confirm Selected
                </button>
                <button onClick={() => handleBulkAction('cancel')} className="text-sm text-red-600 hover:underline">
                  Cancel Selected
                </button>
              </div>
            )}
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                    <th className="px-4 py-4">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        ID {sortBy === 'id' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('customer')}>
                      <div className="flex items-center gap-1">
                        Customer {sortBy === 'customer' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Service</th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        Date/Time {sortBy === 'date' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Suburb</th>
                    <th className="px-4 py-4 font-medium">Cleaner</th>
                    <th className="px-4 py-4 font-medium">Amount</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => handleSelect(booking.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4 font-medium">{booking.id}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{booking.customer}</p>
                          <p className="text-sm text-gray-500">{booking.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{booking.service}</td>
                      <td className="px-4 py-4">
                        <p>{booking.date}</p>
                        <p className="text-sm text-gray-500">{booking.time}</p>
                      </td>
                      <td className="px-4 py-4">{booking.suburb}</td>
                      <td className="px-4 py-4">
                        {booking.cleaner ? (
                          <span className="text-sm">{booking.cleaner}</span>
                        ) : (
                          <button
                            onClick={() => {
                              setBookingToAssign(booking.id);
                              setShowAssignModal(true);
                            }}
                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 font-semibold">${booking.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewBooking(booking.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBooking(booking.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings found matching your criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Assign Cleaner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Assign Cleaner</h3>
            <p className="text-sm text-gray-600 mb-4">Booking: {bookingToAssign}</p>
            <select
              value={selectedCleaner}
              onChange={(e) => setSelectedCleaner(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a cleaner</option>
              {cleanersList.map((cleaner: string) => (
                <option key={cleaner} value={cleaner}>{cleaner}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCleaner}
                disabled={!selectedCleaner}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBookingDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Booking Details</h3>
              <button onClick={() => { setShowViewModal(false); setBookingActionId(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Booking ID</p><p className="font-medium">{selectedBookingDetails.id.substring(0, 8).toUpperCase()}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedBookingDetails.status]}`}>{selectedBookingDetails.status}</span></div>
                <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium">{selectedBookingDetails.customer?.user?.firstName} {selectedBookingDetails.customer?.user?.lastName}</p></div>
                <div><p className="text-sm text-gray-500">Service</p><p className="font-medium">{selectedBookingDetails.service?.name}</p></div>
                <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{new Date(selectedBookingDetails.date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Time</p><p className="font-medium">{new Date(selectedBookingDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{selectedBookingDetails.address}</p></div>
                <div><p className="text-sm text-gray-500">Total Price</p><p className="font-medium">${selectedBookingDetails.totalPrice}</p></div>
                <div><p className="text-sm text-gray-500">Cleaner</p><p className="font-medium">{selectedBookingDetails.staff ? `${selectedBookingDetails.staff.user?.firstName} ${selectedBookingDetails.staff.user?.lastName}` : 'Not assigned'}</p></div>
                <div><p className="text-sm text-gray-500">Created</p><p className="font-medium">{new Date(selectedBookingDetails.createdAt).toLocaleDateString()}</p></div>
              </div>
              {selectedBookingDetails.notes && (
                <div><p className="text-sm text-gray-500">Notes</p><p className="text-sm">{selectedBookingDetails.notes}</p></div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => { setShowViewModal(false); setBookingActionId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && bookingActionId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Booking</h3>
              <button onClick={() => { setShowEditModal(false); setBookingActionId(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                  <input
                    type="number"
                    value={editForm.totalPrice || ''}
                    onChange={(e) => setEditForm({ ...editForm, totalPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => { setShowEditModal(false); setBookingActionId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-red-600">Delete Booking</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Are you sure you want to delete this booking? This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteConfirm(false); setBookingActionId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
