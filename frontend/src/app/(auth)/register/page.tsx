'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Mail, ArrowLeft, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  abn: z.string().optional(),
  userType: z.enum(['retail', 'trade']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

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

function RegisterContent() {
  const router = useRouter();
  const { initiateRegistration, verifyRegistrationOtp, resendOtp, googleAuth, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userType: 'retail' },
  });

  const userType = watch('userType');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const { confirmPassword, ...registerData } = data;
      await initiateRegistration(registerData);
      setRegistrationEmail(data.email);
      setStep('otp');
      setCountdown(60);
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setError('');
    try {
      await verifyRegistrationOtp(registrationEmail, otp);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed';
      setError(message);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(registrationEmail);
      setCountdown(60);
      toast.success('New verification code sent!');
      setError('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    try {
      await googleAuth(credentialResponse.credential);
      toast.success('Welcome!');
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Google sign-up failed';
      setError(message);
    }
  };

  if (step === 'otp') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100 animate-fade-in-up">
        <button
          onClick={() => setStep('form')}
          className="flex items-center gap-1.5 text-sm text-steel-500 hover:text-steel-700 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100">
            <Mail className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Verify Your Email</h1>
          <p className="mt-2 text-sm text-steel-500">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-steel-700">{registrationEmail}</span>
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
          <div className="text-center mb-6">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <p className="text-sm text-steel-500 mt-2">Verifying your code...</p>
          </div>
        )}

        <div className="text-center text-sm text-steel-500">
          Didn&apos;t receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-steel-400 font-medium">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResendOtp}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-steel-200/50 border border-steel-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-steel-900 tracking-tight">Create Account</h1>
        <p className="mt-1.5 text-sm text-steel-500">
          Join us for easy ordering and trade pricing
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {/* Google Sign-Up — disabled for now */}
      {/* {GOOGLE_CLIENT_ID && (
        <>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up failed')}
              text="signup_with"
              shape="rectangular"
              width="100%"
              theme="outline"
              size="large"
            />
          </div>

          <div className="divider-text my-6">or register with email</div>
        </>
      )} */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('userType')} value="retail" />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Smith"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="04XX XXX XXX"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-steel-400 hover:text-steel-600 transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[34px] text-steel-400 hover:text-steel-600 transition-colors">
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button type="submit" className="w-full btn-shine" size="lg" isLoading={isLoading}>
          Create Account
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-steel-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RegisterContent />
      </GoogleOAuthProvider>
    );
  }
  return <RegisterContent />;
}
