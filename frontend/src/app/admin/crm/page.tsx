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
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  Bell,
  Download,
  UserPlus,
  Star,
  Clock,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAdminUsers, useUpdateUser, useDeleteUser, useCreateUser, useUserBookings } from '@/lib/adminApi';

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'CRM', href: '/admin/crm' },
  { icon: UserCheck, label: 'Cleaners', href: '/admin/cleaners' },
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminCRM() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedCustomerFullId, setSelectedCustomerFullId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  const [editForm, setEditForm] = useState<{ id: string; role: string; isActive: boolean }>({ id: '', role: 'CUSTOMER', isActive: true });

  const [page] = useState(1);
  const limit = 50;
  const { data: usersData, isLoading } = useAdminUsers(page, limit, 'CUSTOMER');
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  const { data: userBookingsData } = useUserBookings(selectedCustomerFullId || '', 1, 50);

  const customers = useMemo(() => {
    return (usersData?.data || []).map((u: any) => ({
      id: u.id.substring(0, 8).toUpperCase(),
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
      email: u.email || '',
      phone: u.phone || 'N/A',
      address: '',
      suburb: '',
      joinDate: new Date(u.createdAt).toLocaleDateString(),
      totalBookings: 0,
      totalSpent: 0,
      lastBooking: '',
      rating: 0,
      notes: '',
    }));
  }, [usersData]);

  const filteredCustomers = customers
    .filter((c: any) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.suburb.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  const handleViewDetails = (customerId: string) => {
    const user = (usersData?.data || []).find((u: any) => u.id.substring(0, 8).toUpperCase() === customerId);
    if (user) {
      setSelectedCustomer(customerId);
      setSelectedCustomerFullId(user.id);
      setShowDetails(true);
    }
  };

  const selectedCustomerData = customers.find((c: any) => c.id === selectedCustomer);
  const customerBookings: any[] = (userBookingsData?.data || []).map((b: any) => ({
    service: b.service?.name || 'Unknown',
    date: new Date(b.date).toLocaleDateString(),
    amount: Number(b.totalPrice || 0),
    status: (b.status || '').toLowerCase(),
  }));

  const handleAddCustomer = () => {
    if (!addForm.email || !addForm.password || !addForm.firstName || !addForm.lastName) return;
    createUserMutation.mutate({
      ...addForm,
      role: 'CUSTOMER',
    }, {
      onSuccess: () => {
        setShowAddModal(false);
        setAddForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      },
    });
  };

  const handleEditCustomer = () => {
    updateUserMutation.mutate({ id: editForm.id, data: { role: editForm.role, isActive: editForm.isActive } }, {
      onSuccess: () => setShowEditModal(false),
    });
  };

  const handleDeleteCustomer = () => {
    if (editForm.id) {
      deleteUserMutation.mutate(editForm.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setShowDetails(false);
        },
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Join Date', 'Bookings', 'Revenue'].join(','),
      ...filteredCustomers.map((c: any) =>
        [c.id, c.name, c.email, c.phone, c.joinDate, c.totalBookings, c.totalSpent].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-export.csv';
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

  const totalCustomers = usersData?.total || customers.length;
  const totalRevenue = customers.reduce((sum: number, c: any) => sum + c.totalSpent, 0);
  const avgBookings = customers.length > 0 ? (customers.reduce((sum: number, c: any) => sum + c.totalBookings, 0) / customers.length).toFixed(1) : '0';
  const avgRating = customers.length > 0 ? (customers.reduce((sum: number, c: any) => sum + c.rating, 0) / customers.length).toFixed(1) : '0';

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
                  link.href === '/admin/crm'
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
            <h1 className="text-xl font-bold">Customer Management (CRM)</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Bookings</p>
                  <p className="text-2xl font-bold">{avgBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold">{avgRating}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Add Customer
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        ID {sortBy === 'id' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Customer {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Contact</th>
                    <th className="px-4 py-4 font-medium">Location</th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('totalBookings')}>
                      <div className="flex items-center gap-1">
                        Bookings {sortBy === 'totalBookings' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('totalSpent')}>
                      <div className="flex items-center gap-1">
                        Revenue {sortBy === 'totalSpent' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Rating</th>
                    <th className="px-4 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: any) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium">{customer.id}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">Since {customer.joinDate}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {customer.suburb}
                        </div>
                      </td>
                      <td className="px-4 py-4">{customer.totalBookings}</td>
                      <td className="px-4 py-4 font-semibold">${customer.totalSpent.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{customer.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetails(customer.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const user = (usersData?.data || []).find((u: any) => u.id.substring(0, 8).toUpperCase() === customer.id);
                              if (user) {
                                setEditForm({ id: user.id, role: user.role, isActive: user.isActive });
                                setShowEditModal(true);
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const user = (usersData?.data || []).find((u: any) => u.id.substring(0, 8).toUpperCase() === customer.id);
                              if (user) {
                                setEditForm({ id: user.id, role: user.role, isActive: user.isActive });
                                setShowDeleteConfirm(true);
                              }
                            }}
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
          </div>
        </main>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomerData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold">Customer Details</h3>
              <button onClick={() => setShowDetails(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCustomerData.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{selectedCustomerData.name}</h4>
                  <p className="text-gray-500">{selectedCustomerData.id}</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedCustomerData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedCustomerData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedCustomerData.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>Rating: {selectedCustomerData.rating}/5</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-xl font-bold">{selectedCustomerData.totalBookings}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold">${selectedCustomerData.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Last Booking</p>
                  <p className="text-xl font-bold">{selectedCustomerData.lastBooking}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomerData.notes && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800"><strong>Notes:</strong> {selectedCustomerData.notes}</p>
                </div>
              )}

              {/* Booking History */}
              <h5 className="font-semibold mb-3">Booking History ({customerBookings.length})</h5>
              {customerBookings.length > 0 ? (
                <div className="space-y-2">
                  {customerBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.service}</p>
                        <p className="text-sm text-gray-500">{booking.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No booking history available</p>
              )}
            </div>

            <div className="p-6 border-t flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowDetails(false); setSelectedCustomerFullId(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const user = (usersData?.data || []).find((u: any) => u.id === selectedCustomerFullId);
                  if (user) {
                    setEditForm({ id: user.id, role: user.role, isActive: user.isActive });
                    setShowEditModal(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Customer
              </button>
              <button
                onClick={() => {
                  const user = (usersData?.data || []).find((u: any) => u.id === selectedCustomerFullId);
                  if (user) {
                    setEditForm({ id: user.id, role: user.role, isActive: user.isActive });
                    setShowDeleteConfirm(true);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <Link href="/admin/bookings" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                New Booking
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddCustomer} disabled={createUserMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {createUserMutation.isPending ? 'Creating...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Customer</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} id="isActive" className="rounded" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Account</label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleEditCustomer} disabled={updateUserMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-red-600">Delete Customer</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Are you sure you want to delete this customer? This action cannot be undone and will remove all associated data.</p>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteCustomer} disabled={deleteUserMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
