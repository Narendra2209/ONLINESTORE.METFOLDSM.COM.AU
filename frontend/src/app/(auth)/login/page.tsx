'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const { login, googleAuth, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    try {
      await googleAuth(credentialResponse.credential);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Google sign-in failed';
      setError(message);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Welcome Back</h1>
        <p className="mt-1.5 text-sm text-steel-500">
          Sign in to manage orders, quotes, and more
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {/* Google Sign-In — disabled for now */}
      {/* {GOOGLE_CLIENT_ID && (
        <>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed')}
              text="signin_with"
              shape="rectangular"
              width="100%"
              theme="outline"
              size="large"
            />
          </div>

          <div className="divider-text my-6">or sign in with email</div>
        </>
      )} */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-steel-400 hover:text-steel-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-steel-600 cursor-pointer group">
            <input type="checkbox" className="rounded border-steel-300 text-brand-600 focus:ring-brand-500" />
            <span className="group-hover:text-steel-800 transition-colors">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full btn-shine" size="lg" isLoading={isLoading}>
          Sign In
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-steel-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginContent />
      </GoogleOAuthProvider>
    );
  }
  return <LoginContent />;
}
