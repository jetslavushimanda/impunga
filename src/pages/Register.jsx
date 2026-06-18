import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Sprout, ChevronRight, ChevronLeft, Eye, EyeOff, 
  User, Mail, Lock, Calendar, Users, MapPin, 
  ChevronDown, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getProvinces, getDistricts } from '../data/provinces';

const step1Schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  age: z.number({ coerce: true }).min(13, 'You must be at least 13').max(100, 'Invalid age'),
  sex: z.string().min(1, 'Please select'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const step2Schema = z.object({
  province: z.string().min(1, 'Select your province'),
  district: z.string().min(1, 'Select your district'),
});

const schemas = [step1Schema, step2Schema];

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const { register: registerUser, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schemas[step - 1]),
    defaultValues: formData,
  });

  const province = watch('province');

  async function onNext(data) {
    const merged = { ...formData, ...data };
    setFormData(merged);
    if (data.province) setSelectedProvince(data.province);
    if (step < 2) {
      setStep(step + 1);
    } else {
      await submitRegistration(merged);
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

  async function submitRegistration(data) {
    setIsLoading(true);
    setAuthError('');
    try {
      // eslint-disable-next-line no-unused-vars
      const { email, password, confirmPassword, ...profile } = data;
      await registerUser(email, password, profile);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Try logging in.'
        : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const stepTitles = ['Personal Information', 'Your Location'];
  const districts = getDistricts(selectedProvince || province || '');

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)' }}>
      {/* Decorative Sprouts in Background */}
      <Sprout className="absolute -right-8 -top-8 w-48 h-48 text-white/5 pointer-events-none" />
      <Sprout className="absolute -left-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />

      <div className="card w-full max-w-md relative z-10 shadow-2xl">
        {/* Back Link to Landing */}
        {step === 1 && (
          <Link to="/" className="absolute left-6 top-6 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        )}
        <div className="text-center mb-6 pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-8 h-8 text-accent-gold logo-sprout" />
            <span className="text-2xl font-bold text-primary">IMPUNGA</span>
          </div>
          <p className="text-gray-500 text-sm">Create your free account</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 relative px-2">
          {/* Connector Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" 
            style={{ width: `${((step - 1) / 1) * 100}%` }}
          />

          {[1, 2].map(s => {
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm ${
                    isCompleted 
                      ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(27,79,114,0.2)]' 
                      : isActive 
                        ? 'bg-white border-primary text-primary shadow-[0_0_10px_rgba(27,79,114,0.15)] scale-110' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : s}
                </div>
                <span className={`text-[10px] mt-2 font-semibold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-primary' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stepTitles[s - 1].split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Step {step} of 2 — {stepTitles[step - 1]}</p>

        {authError && <ErrorMessage message={authError} />}

        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('fullName')} 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. Chanda Mwale" 
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('email')} 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com" 
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('password')} 
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="At least 8 characters" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('confirmPassword')} 
                    type="password" 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Repeat your password" 
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Age *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      {...register('age')} 
                      type="number" 
                      className="input-field" 
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="e.g. 22" 
                      min={13} 
                      max={100} 
                    />
                  </div>
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="label">Sex *</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      {...register('sex')} 
                      className="select-field appearance-none"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="preferNotToSay">Prefer not to say</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 my-5">
                <hr className="flex-1 border-gray-200" />
                <span className="text-gray-400 text-[11px] tracking-wider uppercase font-semibold">Or signup with</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <div className="flex flex-col gap-2.5">
                <button type="button" onClick={handleGoogle} disabled={isGoogleLoading} className="btn-secondary w-full gap-2 text-sm justify-center">
                  {isGoogleLoading ? <LoadingSpinner size="sm" /> : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <button type="button" onClick={handleApple} disabled={isAppleLoading} className="btn-secondary w-full gap-2 text-sm justify-center">
                  {isAppleLoading ? <LoadingSpinner size="sm" /> : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.32 3.34 9.8 7.73 9.4c1.25.1 2.11.75 2.84.73 1.17-.03 1.9-.77 3.3-.67 1.63.1 2.77.83 3.4 1.95-3.2 1.96-2.39 6.22.78 7.5-.66 1.67-1.5 3.37-2.55 4.37M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.08 4.49-3.74 4.25z" /></svg>
                      Continue with Apple
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="label">Province *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    {...register('province')} 
                    className="select-field appearance-none" 
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    onChange={e => setSelectedProvince(e.target.value)}
                  >
                    <option value="">Select your province</option>
                    {getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
              </div>
              <div>
                <label className="label">District *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    {...register('district')} 
                    className="select-field appearance-none disabled:opacity-50" 
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    disabled={!selectedProvince && !province}
                  >
                    <option value="">Select your district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="btn-secondary flex-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="btn-primary flex-1"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : step === 2 ? 'Create Account' : <>Next <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
