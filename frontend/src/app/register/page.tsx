'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-neutral-600 mt-2">Fill in your details to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="Min 8 chars, uppercase, number" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-center text-neutral-600">
            Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
