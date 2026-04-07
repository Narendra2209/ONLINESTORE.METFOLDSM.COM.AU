'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import LogoLoader from '@/components/ui/LogoLoader';

function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (otp: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newValues = [...values];
    newValues[index] = val.slice(-1);
    setValues(newValues);

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const otp = newValues.join('');
    if (otp.length === length) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = [...values];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setValues(newValues);
    if (pasted.length === length) {
      onComplete(pasted);
    } else {
      inputs.current[pasted.length]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-steel-200 rounded-xl
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all
            hover:border-steel-300"
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyResetOtp, resetPassword, isLoading } = useAuthStore();

  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    try {
      await forgotPassword(email);
      setStep('otp');
      setCountdown(60);
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code');
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await forgotPassword(email);
      setCountdown(60);
      toast.success('New verification code sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setError('');
    try {
      const token = await verifyResetOtp(email, otp);
      setResetToken(token);
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await resetPassword(resetToken, password);
      toast.success('Password reset successfully! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  if (step === 'otp') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100 animate-fade-in-up">
        <button
          onClick={() => { setStep('email'); setError(''); }}
          className="flex items-center gap-1.5 text-sm text-steel-500 hover:text-steel-700 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100">
            <Mail className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Check Your Email</h1>
          <p className="mt-2 text-sm text-steel-500">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-steel-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-8">
          <OtpInput onComplete={handleOtpComplete} />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center mb-6">
            <LogoLoader size="sm" text="Verifying..." />
          </div>
        )}

        <div className="text-center text-sm text-steel-500">
          Didn&apos;t receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-steel-400 font-medium">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100 animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 border border-green-100">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Set New Password</h1>
          <p className="mt-2 text-sm text-steel-500">Choose a strong password for your account</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-steel-400 hover:text-steel-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[34px] text-steel-400 hover:text-steel-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" className="w-full btn-shine" size="lg" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    );
  }

  // Step: email
  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100">
          <KeyRound className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Forgot Password?</h1>
        <p className="mt-2 text-sm text-steel-500">
          Enter your email and we&apos;ll send you a verification code
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <Button type="submit" className="w-full btn-shine" size="lg" isLoading={isLoading}>
          Send Code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-steel-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
