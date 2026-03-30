import { create } from 'zustand';
import { User } from '@/types/auth';
import api from '@/lib/axios';

// Normalize user data: role can come as string or populated object
function normalizeUser(userData: any): User {
  const role = typeof userData.role === 'object' && userData.role?.name
    ? userData.role.name
    : userData.role;
  const permissions = userData.permissions
    || (typeof userData.role === 'object' ? userData.role?.permissions : undefined);
  return { ...userData, role, permissions };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  initiateRegistration: (data: any) => Promise<void>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  googleAuth: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: normalizeUser(data.data.user), isAuthenticated: true });
      // Load user's saved cart from backend (don't push empty local cart)
      const { useCartStore } = await import('./cartStore');
      await useCartStore.getState().loadFromBackend();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: normalizeUser(data.data.user), isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  initiateRegistration: async (formData) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/initiate-registration', formData);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyRegistrationOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: normalizeUser(data.data.user), isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  resendOtp: async (email) => {
    await api.post('/auth/resend-otp', { email });
  },

  googleAuth: async (idToken) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/google', { idToken });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: normalizeUser(data.data.user), isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    // Save cart to backend BEFORE removing token
    try {
      const { useCartStore } = await import('./cartStore');
      await useCartStore.getState().syncToBackend();
    } catch { /* ignore */ }
    // Now logout and remove token
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    // Clear local cart only (backend already has the saved version)
    const { useCartStore } = await import('./cartStore');
    useCartStore.getState().clearCart();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: normalizeUser(data.data), isAuthenticated: true });
      // Load cart from backend (merge with local)
      const { useCartStore } = await import('./cartStore');
      useCartStore.getState().loadFromBackend();
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
