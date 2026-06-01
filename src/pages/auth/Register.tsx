import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button, Input } from '../../components/ui/core';
import { UserPlus, User, Mail, Key, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../schemas/auth';
import type { RegisterFormData } from '../../schemas/auth';

export const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);
    try {
      await signup(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1920')` 
      }}
    >
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      {/* Register Card */}
      <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-8 shadow-2xl relative z-10 text-white">
        <div className="text-center mb-6">
          <h2 className="text-sm font-semibold tracking-[0.25em] text-primary uppercase mb-2">Join Us</h2>
          <h1 className="text-3xl font-serif tracking-wide text-white">GRAND ROYALE</h1>
          <p className="text-xs text-white/60 mt-1">Begin your tailored luxury experience</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <Input
              type="text"
              placeholder="Alexander Mercer"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              placeholder="alex@example.com"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            isLoading={loading}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Register Guest Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};
