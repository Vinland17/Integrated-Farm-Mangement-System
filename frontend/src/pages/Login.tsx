import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('rohith.manager@farm.agri');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid login credentials. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Left side: AgriTech Branding & Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-agri-950 via-slate-900 to-agri-900 p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-agri-500 to-emerald-600 rounded-2xl text-white shadow-lg">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">PRJ_533</h1>
            <p className="text-xs text-agri-400 font-bold uppercase tracking-widest">Integrated Farm Decision Support</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto max-w-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-agri-500/10 border border-agri-500/30 text-agri-300 rounded-full text-xs font-bold mb-6">
            <ShieldCheck className="w-4 h-4 text-agri-400" /> Enterprise Smart Agriculture System
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Data-Driven Insights for High-Yield Farming.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Empower your farm with machine learning crop recommendations, satellite weather advisories, leaf disease vision diagnostics, and automated resource decision-support.
          </p>

          <div className="space-y-3.5">
            {[
              'Real-time soil NPK & pH monitoring analytics',
              'AI predictive yield forecasting & disease classification',
              'Automated weather-integrated irrigation advisories',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-agri-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 border-t border-slate-800/80 pt-4 flex items-center justify-between">
          <span>© 2026 PRJ_533 Farm Resource Planning Platform.</span>
          <span>v2.4.0 Production</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="p-3 bg-agri-600 rounded-2xl text-white">
                <Sprout className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to Farm Console</h2>
            <p className="text-sm text-slate-500 mt-2">Enter your credentials to access farm analytics and decision support.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500/30 focus:border-agri-600 transition-all"
                  placeholder="manager@farm.agri"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500/30 focus:border-agri-600 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-agri-600 focus:ring-agri-500"
                />
                Remember me on this device
              </label>
              <a href="#" className="font-semibold text-agri-700 hover:text-agri-800 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 text-center border-t border-slate-100 text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-extrabold text-agri-700 hover:text-agri-800 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
