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
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Bell,
  UserPlus,
  Download,
  Award,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAdminStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/lib/adminApi';

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'CRM', href: '/admin/crm' },
  { icon: UserCheck, label: 'Cleaners', href: '/admin/cleaners' },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  'on-leave': 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-red-100 text-red-700',
};

export default function AdminCleaners() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCleaner, setSelectedCleaner] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', suburb: '', hourlyRate: '', password: '' });
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ hourlyRate: number; isActive: boolean }>({ hourlyRate: 0, isActive: true });

  const { data: staffData, isLoading } = useAdminStaff();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const cleaners = useMemo(() => {
    return (staffData || []).map((s: any) => ({
      id: s.id.substring(0, 8).toUpperCase(),
      name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() || 'Staff Member',
      email: s.user?.email || '',
      phone: s.user?.phone || 'N/A',
      suburb: '',
      rating: Number(s.averageRating || 0),
      totalJobs: Number(s.completedJobs || 0),
      hourlyRate: Number(s.hourlyRate || 0),
      status: s.isActive ? 'active' : 'inactive',
      specialties: s.specialization ? s.specialization.split(',').map((sp: string) => sp.trim()) : [],
      joinedDate: new Date(s.createdAt).toLocaleDateString(),
      availability: [],
      currentBooking: null,
      nextAvailable: '',
    }));
  }, [staffData]);

  const filteredCleaners = cleaners
    .filter((c: any) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.suburb.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const performanceData = filteredCleaners.slice(0, 6).map((c: any) => ({
    name: c.name.split(' ')[0],
    jobs: c.totalJobs,
    rating: c.rating * 20,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleViewDetails = (cleanerId: string) => {
    setSelectedCleaner(cleanerId);
    setShowDetails(true);
  };

  const handleAddCleaner = () => {
    if (!addForm.email || !addForm.password || !addForm.name || !addForm.hourlyRate) return;
    // We need to create a user first, then a staff profile
    // For simplicity, call the createStaff endpoint with minimal data
    // This requires a user to exist — in production you'd create user + staff in one flow
    import('@/lib/api').then(({ api }) => {
      const [firstName, ...lastParts] = addForm.name.split(' ');
      api.post('/admin/users', {
        email: addForm.email,
        password: addForm.password,
        firstName: firstName,
        lastName: lastParts.join(' ') || 'Staff',
        role: 'STAFF',
        phone: addForm.phone,
      }).then((userRes) => {
        const userId = userRes.data.data.id;
        createStaffMutation.mutate({
          userId,
          specialization: 'RESIDENTIAL',
          hourlyRate: parseFloat(addForm.hourlyRate),
        }, {
          onSuccess: () => {
            setShowAddModal(false);
            setAddForm({ name: '', email: '', phone: '', suburb: '', hourlyRate: '', password: '' });
          },
        });
      });
    });
  };

  const handleEditCleaner = (shortId: string) => {
    const staff = (staffData || []).find((s: any) => s.id.substring(0, 8).toUpperCase() === shortId);
    if (staff) {
      setEditStaffId(staff.id);
      setEditForm({ hourlyRate: Number(staff.hourlyRate || 0), isActive: staff.isActive });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editStaffId) return;
    updateStaffMutation.mutate({ id: editStaffId, data: editForm }, {
      onSuccess: () => setShowEditModal(false),
    });
  };

  const handleDeleteCleaner = (shortId: string) => {
    const staff = (staffData || []).find((s: any) => s.id.substring(0, 8).toUpperCase() === shortId);
    if (staff) {
      setEditStaffId(staff.id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (editStaffId) {
      deleteStaffMutation.mutate(editStaffId, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setEditStaffId(null);
        },
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Specialization', 'Hourly Rate', 'Rating', 'Jobs', 'Status'].join(','),
      ...filteredCleaners.map((c: any) =>
        [c.id, c.name, c.email, c.phone, c.specialties.join(';'), c.hourlyRate, c.rating, c.totalJobs, c.status].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaners-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCleanerData = cleaners.find((c: any) => c.id === selectedCleaner);

  const stats = {
    total: cleaners.length,
    active: cleaners.filter((c: any) => c.status === 'active').length,
    onLeave: cleaners.filter((c: any) => c.status === 'on-leave').length,
    available: cleaners.filter((c: any) => c.status === 'active' && !c.currentBooking).length,
    avgRating: cleaners.length > 0 ? (cleaners.reduce((sum: number, c: any) => sum + c.rating, 0) / cleaners.length).toFixed(1) : '0',
    totalJobs: cleaners.reduce((sum: number, c: any) => sum + c.totalJobs, 0),
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
                  link.href === '/admin/cleaners'
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
            <h1 className="text-xl font-bold">Cleaner Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">On Leave</p>
                  <p className="text-2xl font-bold">{stats.onLeave}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold">{stats.available}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Cleaner Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jobs" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Jobs Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cleaners..."
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
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Cleaner
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
          </div>

          {/* Cleaners Table */}
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
                        Cleaner {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Contact</th>
                    <th className="px-4 py-4 font-medium">Location</th>
                    <th className="px-4 py-4 font-medium">Specialties</th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('rating')}>
                      <div className="flex items-center gap-1">
                        Rating {sortBy === 'rating' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('totalJobs')}>
                      <div className="flex items-center gap-1">
                        Jobs {sortBy === 'totalJobs' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-4 font-medium">Current Booking</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCleaners.map((cleaner: any) => (
                    <tr key={cleaner.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium">{cleaner.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {cleaner.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{cleaner.name}</p>
                            <p className="text-sm text-gray-500">${cleaner.hourlyRate}/hr</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {cleaner.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {cleaner.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {cleaner.suburb}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {cleaner.specialties.map((s: string) => (
                            <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{cleaner.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold">{cleaner.totalJobs}</td>
                      <td className="px-4 py-4">
                        {cleaner.currentBooking ? (
                          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {cleaner.currentBooking}
                          </span>
                        ) : (
                          <span className="text-sm text-green-600">Available</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[cleaner.status]}`}>
                          {cleaner.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetails(cleaner.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCleaner(cleaner.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCleaner(cleaner.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="Remove"
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

          {/* Availability Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Availability Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cleaner</th>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <th key={day} className="py-3 px-2 text-center">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cleaners.filter((c: any) => c.status === 'active').map((cleaner: any) => (
                    <tr key={cleaner.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{cleaner.name}</td>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <td key={day} className="py-3 px-2 text-center">
                          {cleaner.availability.includes(day) ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Cleaner Details Modal */}
      {showDetails && selectedCleanerData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold">Cleaner Details</h3>
              <button onClick={() => setShowDetails(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Cleaner Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCleanerData.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{selectedCleanerData.name}</h4>
                  <p className="text-gray-500">{selectedCleanerData.id} &middot; {selectedCleanerData.suburb}</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedCleanerData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedCleanerData.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <p className="text-xl font-bold">{selectedCleanerData.rating}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="text-xl font-bold">{selectedCleanerData.totalJobs}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="text-xl font-bold">${selectedCleanerData.hourlyRate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[selectedCleanerData.status]}`}>
                    {selectedCleanerData.status}
                  </span>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Specialties</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCleanerData.specialties.map((s: string) => (
                    <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Availability</h5>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <span
                      key={day}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCleanerData.availability.includes(day)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Assignment */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Current Assignment</h5>
                {selectedCleanerData.currentBooking ? (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium">Booking: {selectedCleanerData.currentBooking}</p>
                    <p className="text-sm text-gray-500">Next available: {selectedCleanerData.nextAvailable}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Available for assignment
                    </p>
                    <p className="text-sm text-gray-500">From: {selectedCleanerData.nextAvailable}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const staff = (staffData || []).find((s: any) => s.id.substring(0, 8).toUpperCase() === selectedCleaner);
                  if (staff) {
                    setEditStaffId(staff.id);
                    setEditForm({ hourlyRate: Number(staff.hourlyRate || 0), isActive: staff.isActive });
                    setShowEditModal(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Cleaner
              </button>
              <button
                onClick={() => {
                  const staff = (staffData || []).find((s: any) => s.id.substring(0, 8).toUpperCase() === selectedCleaner);
                  if (staff) {
                    setEditStaffId(staff.id);
                    setShowDeleteConfirm(true);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <Link href="/admin/bookings" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Assign Booking
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Cleaner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Add New Cleaner</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@cleanpro.com.au" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="04XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input type="number" value={addForm.hourlyRate} onChange={(e) => setAddForm({ ...addForm, hourlyRate: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="30" />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddCleaner} disabled={createStaffMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {createStaffMutation.isPending ? 'Adding...' : 'Add Cleaner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cleaner Modal */}
      {showEditModal && editStaffId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Cleaner</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input type="number" value={editForm.hourlyRate} onChange={(e) => setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} id="staffActive" className="rounded" />
                <label htmlFor="staffActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEdit} disabled={updateStaffMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {updateStaffMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && editStaffId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-red-600">Delete Cleaner</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Are you sure you want to delete this cleaner? They will be removed from all future bookings. This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteStaffMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteStaffMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
