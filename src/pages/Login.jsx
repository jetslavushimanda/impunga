import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setIsLoading(true);
    setAuthError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(getFriendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setAuthError('Google sign in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleApple() {
    setIsAppleLoading(true);
    setAuthError('');
    try {
      await loginWithApple();
      navigate('/dashboard');
    } catch {
      setAuthError('Apple ID sign in failed. Please try again.');
    } finally {
      setIsAppleLoading(false);
    }
  }

  function getFriendlyError(code) {
    const errors = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
    };
    return errors[code] || 'Login failed. Please try again.';
  }

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)' }}>
      {/* Decorative Sprouts in Background */}
      <Sprout className="absolute -right-8 -top-8 w-48 h-48 text-white/5 pointer-events-none" />
      <Sprout className="absolute -left-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />

      <div className="card w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-8 h-8 text-accent-gold" />
            <span className="text-2xl font-bold text-primary">IMPUNGA</span>
          </div>
          <p className="text-gray-500 text-sm">Welcome back. Sign in to continue.</p>
        </div>

        {authError && <ErrorMessage message={authError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                {...register('email')} 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com" 
                autoComplete="email" 
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-gray-400 text-[11px] tracking-wider uppercase font-semibold">Or continue with</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={handleGoogle} disabled={isGoogleLoading} className="btn-secondary w-full gap-2 text-sm justify-center">
            {isGoogleLoading ? <LoadingSpinner size="sm" /> : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </>
            )}
          </button>

          <button onClick={handleApple} disabled={isAppleLoading} className="btn-secondary w-full gap-2 text-sm justify-center">
            {isAppleLoading ? <LoadingSpinner size="sm" /> : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.32 3.34 9.8 7.73 9.4c1.25.1 2.11.75 2.84.73 1.17-.03 1.9-.77 3.3-.67 1.63.1 2.77.83 3.4 1.95-3.2 1.96-2.39 6.22.78 7.5-.66 1.67-1.5 3.37-2.55 4.37M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.08 4.49-3.74 4.25z" /></svg>
                Continue with Apple
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
