import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (mobile: string, passcode: string) => boolean;
  signup: (name: string, mobile: string, passcode: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const savedId = localStorage.getItem('roy-study-session');
      if (savedId) {
        const users: User[] = JSON.parse(localStorage.getItem('roy-study-users') || '[]');
        const user = users.find(u => u.id === savedId);
        if (user) return { user, isAuthenticated: true };
      }
    } catch (e) {
      console.error('Failed to load auth state from localStorage:', e);
    }
    return { user: null, isAuthenticated: false };
  });

  const signup = (name: string, mobile: string, passcode: string) => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem('roy-study-users') || '[]');
      if (users.find(u => u.mobile === mobile)) return false;

      const newUser: User = {
        id: Date.now().toString(),
        name,
        mobile,
        passcode,
        createdAt: Date.now()
      };

      localStorage.setItem('roy-study-users', JSON.stringify([...users, newUser]));
      setState({ user: newUser, isAuthenticated: true });
      localStorage.setItem('roy-study-session', newUser.id);
      return true;
    } catch (e) {
      console.error('Signup failed:', e);
      return false;
    }
  };

  const login = (mobile: string, passcode: string) => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem('roy-study-users') || '[]');
      const user = users.find(u => u.mobile === mobile && u.passcode === passcode);
      if (user) {
        setState({ user, isAuthenticated: true });
        localStorage.setItem('roy-study-session', user.id);
        return true;
      }
    } catch (e) {
      console.error('Login failed:', e);
    }
    return false;
  };

  const logout = () => {
    try {
      setState({ user: null, isAuthenticated: false });
      localStorage.removeItem('roy-study-session');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const updateUser = (user: User) => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem('roy-study-users') || '[]');
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      localStorage.setItem('roy-study-users', JSON.stringify(updatedUsers));
      setState(prev => ({ ...prev, user }));
    } catch (e) {
      console.error('Update user failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
