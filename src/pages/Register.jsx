import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
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

const step3Schema = z.object({
  occupation: z.string().min(1, 'Select your occupation'),
  experience: z.string().min(1, 'Select your experience level'),
  primaryGoal: z.string().min(1, 'Select your main goal'),
});

const schemas = [step1Schema, step2Schema, step3Schema];

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const { register: registerUser } = useAuth();
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
    if (step < 3) {
      setStep(step + 1);
    } else {
      await submitRegistration(merged);
    }
  }

  async function submitRegistration(data) {
    setIsLoading(true);
    setAuthError('');
    try {
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

  const stepTitles = ['Personal Information', 'Your Location', 'Your Background'];
  const districts = getDistricts(selectedProvince || province || '');

  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-7 h-7 text-accent-gold" />
            <span className="text-xl font-bold text-primary">IMPUNGA</span>
          </div>
          <p className="text-gray-500 text-sm">Create your free account</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1 text-center hidden sm:block ${s === step ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                {stepTitles[s - 1]}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold text-gray-700 mb-4">Step {step} of 3 — {stepTitles[step - 1]}</p>

        {authError && <ErrorMessage message={authError} />}

        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="label">Full Name *</label>
                <input {...register('fullName')} className="input-field" placeholder="e.g. Chanda Mwale" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Repeat your password" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age *</label>
                  <input {...register('age')} type="number" className="input-field" placeholder="e.g. 22" min={13} max={100} />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="label">Sex *</label>
                  <select {...register('sex')} className="select-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="preferNotToSay">Prefer not to say</option>
                  </select>
                  {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex.message}</p>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="label">Province *</label>
                <select {...register('province')} className="select-field" onChange={e => setSelectedProvince(e.target.value)}>
                  <option value="">Select your province</option>
                  {getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
              </div>
              <div>
                <label className="label">District *</label>
                <select {...register('district')} className="select-field" disabled={!selectedProvince && !province}>
                  <option value="">Select your district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="label">What best describes you? *</label>
                <select {...register('occupation')} className="select-field">
                  <option value="">Select your occupation</option>
                  <option value="student">Secondary School Student</option>
                  <option value="outOfSchool">Out of School Youth</option>
                  <option value="university">University Student</option>
                  <option value="vendor">Market Vendor</option>
                  <option value="farmer">Farmer</option>
                  <option value="employed">Employed Person</option>
                  <option value="retired">Retired Person</option>
                  <option value="other">Other</option>
                </select>
                {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation.message}</p>}
              </div>
              <div>
                <label className="label">Business Experience *</label>
                <select {...register('experience')} className="select-field">
                  <option value="">Select your experience</option>
                  <option value="beginner">Complete beginner, never started</option>
                  <option value="hasIdea">Have an idea, not started yet</option>
                  <option value="started">Started but not registered</option>
                  <option value="registered">Registered and operating</option>
                </select>
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
              </div>
              <div>
                <label className="label">What is your main goal on IMPUNGA? *</label>
                <select {...register('primaryGoal')} className="select-field">
                  <option value="">Select your main goal</option>
                  <option value="validate">Validate my business idea</option>
                  <option value="register">Register my business</option>
                  <option value="plan">Write a business plan</option>
                  <option value="funding">Find funding</option>
                  <option value="advice">Get business advice</option>
                  <option value="track">Track my business growth</option>
                </select>
                {errors.primaryGoal && <p className="text-red-500 text-xs mt-1">{errors.primaryGoal.message}</p>}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <LoadingSpinner size="sm" /> : step === 3 ? 'Create Account' : <>Next <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
