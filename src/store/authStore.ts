import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Helper to decode JWT payload (we don't verify signature on client, just read claims)
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem('token');
  let initialUser = null;
  
  if (initialToken) {
    const decoded = parseJwt(initialToken);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      initialUser = { id: decoded.sub, email: decoded.email || 'User' };
    } else {
      localStorage.removeItem('token');
    }
  }

  return {
    token: initialToken,
    user: initialUser,
    setToken: (token) => {
      localStorage.setItem('token', token);
      const decoded = parseJwt(token);
      set({ 
        token, 
        user: decoded ? { id: decoded.sub, email: decoded.email || 'User' } : null 
      });
    },
    setUser: (user) => set({ user }),
    logout: () => {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    },
  };
});
