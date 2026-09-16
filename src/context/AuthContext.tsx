import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  // Convenient aliases for UI modal components
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  openSignIn: () => void;
  openSignUp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fincommerce_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Load token on initial render
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error verifying stored auth token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error occurred. Please try again.' };
    }
  };

  const register = async (
    nameOrEmail: string,
    emailOrPassword: string,
    passwordOrName: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Intelligently handle both (name, email, password) and (email, password, name)
    let finalName = '';
    let finalEmail = '';
    let finalPassword = '';

    if (nameOrEmail.includes('@')) {
      finalEmail = nameOrEmail.trim();
      finalPassword = emailOrPassword;
      finalName = (passwordOrName || '').trim();
    } else if (emailOrPassword.includes('@')) {
      finalName = nameOrEmail.trim();
      finalEmail = emailOrPassword.trim();
      finalPassword = passwordOrName;
    } else {
      finalName = nameOrEmail.trim();
      finalEmail = emailOrPassword.trim();
      finalPassword = passwordOrName;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: finalName, email: finalEmail, password: finalPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error occurred. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) return { success: false, error: 'Not authenticated.' };

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, error: resData.error || 'Failed to update profile.' };
      }

      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error updating profile.' };
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    } else {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(data.user);
        }
      } catch {
        // ignore
      }
    }
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authMode: authModalMode,
        setAuthMode: setAuthModalMode,
        closeAuthModal,
        openSignIn,
        openSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
