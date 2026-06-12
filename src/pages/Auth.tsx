import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { fetchApi } from '../lib/api';
import { CheckSquare, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/rpc/login' : '/rpc/signup';
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data && data.token) {
        setToken(data.token);
        navigate('/');
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="text-primary-500 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Enter your details to access your todos.' : 'Sign up to start managing your tasks.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 flex items-center justify-center mt-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-500 hover:text-primary-400 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
