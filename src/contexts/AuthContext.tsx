import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  // Admin auth (simple session-based)
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // User auth (for progress tracking)
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (username: string, password: string) => Promise<boolean>;
  registerUser: (username: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple admin credentials - in production, use proper auth
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing sessions on mount
  useEffect(() => {
    const adminSession = sessionStorage.getItem('nimbus_admin');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }

    // Restore user session from localStorage
    const savedUser = localStorage.getItem('nimbus_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('nimbus_user');
      }
    }
  }, []);

  // Admin login
  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('nimbus_admin', 'true');
      return true;
    }
    return false;
  };

  // Admin logout
  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('nimbus_admin');
  };

  // User registration
  const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Registration failed:', error.error);
        return false;
      }

      const data = await response.json();
      const newUser = { id: data.user.id, username: data.user.username, email: data.user.email };
      setUser(newUser);
      localStorage.setItem('nimbus_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // User login
  const loginUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login failed:', error.error);
        return false;
      }

      const data = await response.json();
      const loggedInUser = { id: data.user.id, username: data.user.username, email: data.user.email };
      setUser(loggedInUser);
      localStorage.setItem('nimbus_user', JSON.stringify(loggedInUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // User logout
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('nimbus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        user,
        isAuthenticated: !!user,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
