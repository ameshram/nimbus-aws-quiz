import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register';

export function UserAuthModal({ onClose, onSuccess }: UserAuthModalProps) {
  const { loginUser, registerUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      let success: boolean;

      if (mode === 'login') {
        success = await loginUser(username, password);
      } else {
        success = await registerUser(username, email, password);
      }

      if (success) {
        onSuccess?.();
        onClose();
      } else {
        setError(mode === 'login' ? 'Invalid username or password' : 'Registration failed. Username may already exist.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-nimbus-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-nimbus-text">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-nimbus-muted">
              {mode === 'login' ? 'Track your progress across sessions' : 'Start tracking your learning journey'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-nimbus-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="auth-username" className="block text-sm font-medium text-nimbus-text mb-2">
              Username
            </label>
            <input
              type="text"
              id="auth-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-nimbus-border rounded-xl focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-nimbus-text mb-2">
                Email
              </label>
              <input
                type="email"
                id="auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-nimbus-border rounded-xl focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
                placeholder="Enter email"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-nimbus-text mb-2">
              Password
            </label>
            <input
              type="password"
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-nimbus-border rounded-xl focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-confirm" className="block text-sm font-medium text-nimbus-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="auth-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-nimbus-border rounded-xl focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent"
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-aws-orange text-white hover:bg-aws-orange-dark'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="text-center text-sm text-nimbus-muted">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-aws-orange hover:text-aws-orange-dark font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-aws-orange hover:text-aws-orange-dark font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
