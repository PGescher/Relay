import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { LoginSchema, LoginInput } from '@relay/shared';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- Get login function from context
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        // This saves the token and user to state and localStorage!
        login(result.token, result.user);
        navigate('/home');
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (err) {
      alert('Could not connect to server');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center px-8 transition-colors">
      <div className="max-w-sm mx-auto w-full">
        <button onClick={() => navigate('/')} className="mb-8 p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-[var(--text)] mb-2">Welcome Back.</h2>
        <p className="text-[var(--text-muted)] font-medium mb-10">Sign in to your Relay account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input {...register('email')} type="email" className="w-full bg-[var(--bg-card)] dark:bg-gray-900 border-0 border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-0 px-1 py-3 transition-colors text-lg" placeholder="jane@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Password</label>
            <input {...register('password')} type="password" className="w-full bg-[var(--bg-card)] dark:bg-gray-900 border-0 border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-0 px-1 py-3 transition-colors text-lg" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-black py-5 rounded-2xl hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50">
            {isSubmitting ? 'LOGGING IN...' : 'CONTINUE'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/signup" className="text-[var(--primary)] font-black text-sm uppercase tracking-widest">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;