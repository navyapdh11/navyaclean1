'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      toast.success('Signed in');
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || err.message || 'Login failed. Check your email and password.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-neutral-600 mt-2">Enter your email and password</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-neutral-600">
            Don&apos;t have an account? <Link href="/register" className="text-primary-600 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
