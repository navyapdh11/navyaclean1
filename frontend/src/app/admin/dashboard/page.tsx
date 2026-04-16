'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAdminDashboardOverview, useAdminBookings, useAdminAnalyticsData } from '@/lib/adminApi';

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

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: overview, isLoading: loadingOverview } = useAdminDashboardOverview();
  const { data: adminBookings } = useAdminBookings(1, 5);
  const { data: analytics } = useAdminAnalyticsData();

  // Transform API data for charts
  const revenueData = (analytics?.monthlyRevenue || []).map((m: any) => ({
    month: new Date(m.month).toLocaleString('default', { month: 'short' }),
    revenue: Number(m.total) || 0,
  })).slice(0, 6).reverse();

  const serviceDistribution = (overview?.servicesByPopularity || []).map((s: any, i: number) => ({
    name: s.name,
    value: s.count,
    color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280'][i] || '#6B7280',
  }));

  const recentBookings = (adminBookings?.data || []).map((b: any) => ({
    id: b.id.substring(0, 8).toUpperCase(),
    customer: `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim() || 'Unknown',
    service: b.service?.name || 'Unknown',
    date: new Date(b.date).toLocaleDateString(),
    time: new Date(b.startTime || b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: (b.status || '').toLowerCase(),
    amount: Number(b.totalPrice || 0),
  }));

  if (loadingOverview) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = overview?.overview || {};

        <main className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                {stats.monthlyRevenue && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    Live
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold">${Number(stats.monthlyRevenue || 0).toLocaleString()}</h3>
              <p className="text-gray-500">Monthly Revenue</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                {stats.totalBookings && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    Total
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold">{Number(stats.totalBookings || 0).toLocaleString()}</h3>
              <p className="text-gray-500">Total Bookings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                {stats.totalUsers && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold">{Number(stats.totalUsers || 0).toLocaleString()}</h3>
              <p className="text-gray-500">Total Customers</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-orange-600" />
                </div>
                {stats.activeBookings && (
                  <span className="flex items-center text-orange-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold">{Number(stats.activeBookings || 0).toLocaleString()}</h3>
              <p className="text-gray-500">Active Bookings</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Revenue Trend</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Service Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Service Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Bookings Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Booking Activity</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {overview?.bookingsByStatus && overview.bookingsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overview.bookingsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No booking activity data available
              </div>
            )}
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <Link href="/admin/bookings" className="text-blue-600 hover:underline text-sm">
                View All
              </Link>
            </div>
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="px-6 py-4 font-medium">Booking ID</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Service</th>
                      <th className="px-6 py-4 font-medium">Date/Time</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking: any) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{booking.id}</td>
                        <td className="px-6 py-4">{booking.customer}</td>
                        <td className="px-6 py-4">{booking.service}</td>
                        <td className="px-6 py-4">{booking.date} {booking.time}</td>
                        <td className="px-6 py-4 font-semibold">${booking.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status.toUpperCase()] || 'bg-gray-100 text-gray-700'}`}>
                            {toTitleCase(booking.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings found yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/bookings?status=pending" className="p-4 border rounded-xl hover:bg-gray-50 transition-all text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <span className="font-medium">Pending Bookings</span>
                <span className="block text-sm text-gray-500">5 awaiting</span>
              </Link>
              <Link href="/admin/cleaners" className="p-4 border rounded-xl hover:bg-gray-50 transition-all text-center">
                <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <span className="font-medium">Assign Cleaner</span>
                <span className="block text-sm text-gray-500">3 unassigned</span>
              </Link>
              <Link href="/admin/crm" className="p-4 border rounded-xl hover:bg-gray-50 transition-all text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <span className="font-medium">View Customers</span>
                <span className="block text-sm text-gray-500">1,248 total</span>
              </Link>
              <Link href="/admin/bookings" className="p-4 border rounded-xl hover:bg-gray-50 transition-all text-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <span className="font-medium">Completed Today</span>
                <span className="block text-sm text-gray-500">12 done</span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
