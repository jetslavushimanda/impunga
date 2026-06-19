import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  selectedPath: null,
  loading: true,
  customBack: null,
  customTitle: null,

  setUser: (user) => set({ user, loading: false }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setSelectedPath: (selectedPath) => set({ selectedPath }),
  setCustomBack: (customBack) => set({ customBack }),
  setCustomTitle: (customTitle) => set({ customTitle }),
  clearUser: () => set({ user: null, userProfile: null, selectedPath: null, customBack: null, customTitle: null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;
