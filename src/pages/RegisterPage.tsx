import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuthStore } from '../store/authStore';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signUp, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!firstName) { newErrors.firstName = 'First name is required'; isValid = false; }
    if (!lastName) { newErrors.lastName = 'Last name is required'; isValid = false; }
    if (!email) { newErrors.email = 'Email is required'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Email is invalid'; isValid = false; }
    if (!password) { newErrors.password = 'Password is required'; isValid = false; }
    else if (password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; isValid = false; }
    if (!confirmPassword) { newErrors.confirmPassword = 'Please confirm your password'; isValid = false; }
    else if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await signUp(email, password, {
          firstName,
          lastName,
          role: role as 'student' | 'employer',
          createdAt: new Date().toISOString(),
          ...(role === 'student' ? { skills: [], education: [], experience: [], savedJobs: [], appliedJobs: [] } : {}),
          ...(role === 'employer' ? { companyName: '', companyDescription: '', industry: '', location: '' } : {})
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="h-8 w-8 rounded bg-brand-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-surface-900">NxtHike</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-surface-900">
          Create a new account
        </h2>
        <p className="mt-1 text-center text-sm text-surface-500">
          Or{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 border border-surface-200 rounded-md sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} leftIcon={<User size={16} />} error={errors.firstName} fullWidth />
              <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} leftIcon={<User size={16} />} error={errors.lastName} fullWidth />
            </div>

            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail size={16} />} error={errors.email} fullWidth />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} leftIcon={<Lock size={16} />} error={errors.password} helperText="Password must be at least 6 characters" fullWidth />
            <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} leftIcon={<Lock size={16} />} error={errors.confirmPassword} fullWidth />

            <Select
              label="I am a"
              options={[
                { value: 'student', label: 'Student / Job Seeker' },
                { value: 'employer', label: 'Employer / Recruiter' },
              ]}
              value={role}
              onChange={setRole}
              fullWidth
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <p className="text-sm text-surface-500 mb-3">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-brand-600 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
              </p>
              <Button type="submit" isLoading={isLoading} fullWidth>
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-surface-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <Button type="button" variant="outline" fullWidth>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.001 4.478-10.001 10s4.479 10 10.001 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.081z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
