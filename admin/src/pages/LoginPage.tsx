import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await adminApi.auth.login({ email, password });
      const { user, tokens } = response.data.data;

      if (!user.isAdmin) {
        setError('This account does not have admin access.');
        return;
      }

      localStorage.setItem('adminToken', tokens.accessToken);
      localStorage.setItem('adminRefreshToken', tokens.refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#0D0D0F] text-white lg:grid-cols-[600px_1fr]">
      <section className="flex items-center justify-center bg-[#111114] px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-7">
            <h1 className="font-['Space_Grotesk'] text-lg font-bold text-[#00CCCC]">TuneN2</h1>
            <p className="mt-1 text-xs text-[#8E8E93]">Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-[#8E8E93]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-[#1A1A1E] bg-[#1A1A1E] px-3 text-sm text-white placeholder-[#5A5A6E] outline-none transition focus:border-[#00CCCC] focus:ring-1 focus:ring-[#00CCCC]"
                placeholder="admin@tunen2.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-[#8E8E93]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-md border border-[#1A1A1E] bg-[#1A1A1E] px-3 text-sm text-white placeholder-[#5A5A6E] outline-none transition focus:border-[#00CCCC] focus:ring-1 focus:ring-[#00CCCC]"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-md bg-[#FF453A]/10 p-3 text-xs text-[#FF453A]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-md bg-[#00CCCC] px-4 text-xs font-semibold text-[#0D0D0F] transition hover:bg-[#00BBBB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>

      <section className="hidden items-center justify-center bg-[linear-gradient(135deg,#00CCCC_0%,#BF5AF2_100%)] lg:flex">
        <div className="text-center text-white">
          <div className="mb-4 text-5xl text-white/45">♫</div>
          <h2 className="font-['Space_Grotesk'] text-lg font-bold">Manage Your Platform</h2>
          <p className="mt-2 text-xs text-white/80">Monitor users, content, and financials</p>
        </div>
      </section>
    </div>
  );
}
