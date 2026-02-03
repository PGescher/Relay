import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { SignupSchema, SignupInput } from '@relay/shared';
import { ArrowLeft, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        login(result.token, result.user);
        navigate('/home');
        return;
      }

      const msg =
        result?.error ||
        (res.status === 409
          ? 'An account with this email already exists.'
          : 'Signup failed.');
      setServerError(msg);

      // put cursor somewhere useful
      if (res.status === 409) setFocus('email');
    } catch {
      setServerError('Could not connect to the server.');
    }
  };

  const errorText = useMemo(() => {
    if (serverError) return serverError;
    if (errors.name?.message) return errors.name.message;
    if (errors.email?.message) return errors.email.message;
    if (errors.password?.message) return errors.password.message;
    return null;
  }, [
    serverError,
    errors.name?.message,
    errors.email?.message,
    errors.password?.message,
  ]);

  const disabled = isSubmitting;

  return (
    <div className="min-h-screen bg-[var(--hero-bg)] text-[var(--hero-text)] flex flex-col items-center justify-center px-8 relative overflow-hidden font-inter">
      <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>
      
      {/* 1. Base Dot Grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />

      {/* 2. Noise Texture Layer */}
      <div className="absolute inset-0 noise" />

      {/* 3. Primary Central Pulse Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900 rounded-full blur-[140px] animate-pulse-glow pointer-events-none z-0" />

      {/* 4. Secondary Drifting Glows */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-rose-950/20 rounded-full blur-[120px] animate-drift pointer-events-none" />
      <div
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#30000a]/20 rounded-full blur-[120px] animate-drift pointer-events-none"
        style={{ animationDirection: 'reverse' }}
      />

      {/* 5. Scanning Light Beam */}
      <div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent animate-scan pointer-events-none"
        style={{ animationDelay: '1.2s' }}
      />

      {/* 6. Floating Particles */}
      <div className="absolute top-[18%] left-[14%] w-1.5 h-1.5 bg-rose-400 rounded-full opacity-20 animate-float" />
      <div
        className="absolute bottom-[22%] right-[18%] w-2 h-2 bg-rose-400 rounded-full opacity-15 animate-float"
        style={{ animationDelay: '2.6s' }}
      />
      <div
        className="absolute top-[62%] right-[12%] w-1 h-1 bg-white rounded-full opacity-10 animate-float"
        style={{ animationDelay: '1.1s' }}
      />

      {/* Content */}
      <div className="w-full max-w-md z-10 relative">
        {/* Top row */}
        <div className="flex items-center justify-between mb-10 animate-reveal stagger-1">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.06)] group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-[900] uppercase tracking-[0.45em] hidden sm:inline">
              Back
            </span>
          </button>

          <div className="text-[9px] font-[900] uppercase tracking-[0.8em] text-white/10 select-none">
            Relay // v. 0.0.1
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-10 relative animate-reveal stagger-2">
          <div className="w-20 h-20 bg-white rounded-[34px] flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.08)] group transition-all duration-700">
            <Zap className="text-[#800020] w-10 h-10 fill-current transform transition-transform duration-500 " />
          </div>
          <div className="absolute -inset-6 border border-white/5 rounded-full animate-pulse opacity-40 pointer-events-none" />
        </div>

        {/* Headline */}
        <div className="text-center mb-10 select-none animate-reveal stagger-3">
          <h1 className="text-6xl md:text-7xl font-[900] italic tracking-tighter leading-[0.86] uppercase">
            <span className="text-white drop-shadow-[0_10px_30px_rgba(255,255,255,0.08)]">
              Sign up
            </span>
            <span className="block text-[#68001a] tracking-[-0.05em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              TODAY.
            </span>
          </h1>
          <p className="mt-4 text-[12px] font-[900] uppercase tracking-[0.45em] text-white/40">
            Start your modular training journey
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden animate-reveal stagger-4">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Error strip */}
            {errorText && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                <p className="text-[11px] font-[900] uppercase tracking-[0.35em] text-rose-200/80">
                  {errorText}
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] font-[900] uppercase tracking-[0.5em] text-white/40 mb-2 ml-1">
                Full name
              </label>
              <input
                {...register('name')}
                autoComplete="name"
                placeholder="Name"
                className={[
                  "w-full rounded-2xl px-4 py-4 text-base text-white placeholder:text-white/20",
                  "bg-black/30 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-white/20",
                  "transition-all",
                  errors.name ? "border-rose-500/40" : "",
                ].join(' ')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-[900] uppercase tracking-[0.5em] text-white/40 mb-2 ml-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="name@something.com"
                className={[
                  "w-full rounded-2xl px-4 py-4 text-base text-white placeholder:text-white/20",
                  "bg-black/30 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-white/20",
                  "transition-all",
                  errors.email ? "border-rose-500/40" : "",
                ].join(' ')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-[900] uppercase tracking-[0.5em] text-white/40 mb-2 ml-1">
                Password
              </label>
              <div
                className={[
                  "flex items-center gap-2 rounded-2xl px-4 py-4",
                  "bg-black/30 border border-white/10",
                  "focus-within:ring-2 focus-within:ring-rose-500/30 focus-within:border-white/20",
                  "transition-all",
                  errors.password ? "border-rose-500/40" : "",
                ].join(' ')}
              >
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder:text-white/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={disabled}
              className={[
                "group w-full bg-[#800020] text-white py-6 rounded-full",
                "flex items-center justify-center gap-3",
                "hover:bg-[#a8002d] active:scale-[0.97] transition-all",
                "shadow-[0_15px_45px_rgba(128,0,32,0.45)] border border-white/5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
              ].join(' ')}
            >
              <span className="text-2xl font-[900] italic uppercase tracking-tight">
                {isSubmitting ? 'CREATING' : 'JOIN NOW'}
              </span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
            </button>

            {/* Divider + Login */}
            <div className="pt-2">
              <div className="flex items-center gap-6 w-full opacity-60 hover:opacity-100 transition-all">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/20" />
                <Link
                  to="/login"
                  className="text-[11px] font-[900] uppercase tracking-[0.5em] text-white/50 hover:text-white transition-all whitespace-nowrap group flex items-center gap-2"
                >
                  RESUME
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse group-hover:bg-white" />
                </Link>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/20" />
              </div>
            </div>
          </form>
        </div>

        {/* Bottom hint */}
        <div className="mt-10 text-center text-[9px] font-[900] uppercase tracking-[0.8em] text-white/10 select-none animate-reveal stagger-4">
          BIG STEPPA // SIGNUP
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
