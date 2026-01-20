import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { SignupSchema, SignupInput } from '@relay/shared'; 
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Properly destructure the form tools
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
  });

  // 2. The submission logic
  const onSubmit = async (data: SignupInput) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        // We call login with the data returned from the server
        // Make sure your backend returns { token, user }
        login(result.token, result.user);
        navigate('/home');
      } else {
        alert(result.error || "Signup failed");
      }
    } catch (err) {
      alert("Could not connect to the server");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center px-8 transition-colors">
      <div className="max-w-sm mx-auto w-full">
        <button 
          onClick={() => navigate('/')} 
          className="mb-8 p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-[var(--text)] mb-2">Join the Tribe.</h2>
        <p className="text-[var(--text-muted)] font-medium mb-10">Start your modular training journey.</p>

        {/* 3. Changed onSignup to onSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">
              Full Name
            </label>
            <input 
              {...register('name')}
              className="w-full bg-[var(--bg-card)] dark:bg-gray-900 border-0 border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-0 px-1 py-3 transition-colors text-lg"
              placeholder="Name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">
              Email Address
            </label>
            <input 
              {...register('email')}
              type="email" 
              className="w-full bg-[var(--bg-card)] dark:bg-gray-900 border-0 border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-0 px-1 py-3 transition-colors text-lg"
              placeholder="name@something.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">
              Password
            </label>
            <input 
              {...register('password')}
              type="password" 
              className="w-full bg-[var(--bg-card)] dark:bg-gray-900 border-0 border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-0 px-1 py-3 transition-colors text-lg"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--primary)] text-white font-black py-5 rounded-2xl hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'CREATING...' : 'JOIN NOW'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-[var(--primary)] font-black text-sm uppercase tracking-widest">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;