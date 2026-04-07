import { useState, type FormEvent } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement login
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md rounded-2xl bg-surface-overlay p-8 shadow-xl backdrop-blur-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-content">TuneN2 Admin</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-content-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-surface-highlight bg-surface-overlay px-4 py-2 text-content placeholder-content-subtle outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="admin@tunen2.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-content-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-surface-highlight bg-surface-overlay px-4 py-2 text-content placeholder-content-subtle outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 font-semibold text-content transition hover:bg-accent-hover"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
