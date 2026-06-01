import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button, Input } from '../../components/ui/core';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth';
import type { LoginFormData } from '../../schemas/auth';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      await login(data);
      // Wait for session sync
      navigate(data.email.includes('admin') ? '/admin' : from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setValue('email', 'admin@hotel.com');
      setValue('password', 'admin123');
    } else {
      setValue('email', 'customer@hotel.com');
      setValue('password', 'customer123');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')` 
      }}
    >
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-8 shadow-2xl relative z-10 text-white">
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold tracking-[0.25em] text-primary uppercase mb-2">Welcome Back</h2>
          <h1 className="text-3xl font-serif tracking-wide text-white">GRAND ROYALE</h1>
          <p className="text-xs text-white/60 mt-1">Experience the pinnacle of luxury service</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              placeholder="guest@example.com"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            isLoading={loading}
          >
            <LogIn className="w-4 h-4 mr-2" /> Sign In to Retreat
          </Button>
        </form>

        {/* Demo Credentials quick fill */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50 block mb-3">
            Quick-Fill Demo Credentials
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fillDemo('customer')}
              className="flex-1 py-2 px-3 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Customer Guest
            </button>
            <button
              onClick={() => fillDemo('admin')}
              className="flex-1 py-2 px-3 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary font-medium transition-all"
            >
              Hotel Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/60">
          First time staying with us?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
