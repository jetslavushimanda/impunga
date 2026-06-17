import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  selectedPath: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setSelectedPath: (selectedPath) => set({ selectedPath }),
  clearUser: () => set({ user: null, userProfile: null, selectedPath: null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;
