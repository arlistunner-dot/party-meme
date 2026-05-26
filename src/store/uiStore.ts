import { create } from 'zustand';

interface UIState {
  // Navigatsiya
  activeTab: string;

  // Modal
  isModalOpen: boolean;
  modalContent: 'login' | 'shop' | 'settings' | 'cardCreate' | 'cardDetail' | null;
  modalData: unknown;

  // Toast
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;

  // Loading
  globalLoading: boolean;
  loadingText: string;

  // Sound
  soundEnabled: boolean;

  // Theme
  colorScheme: 'light' | 'dark';
}

interface UIActions {
  setActiveTab: (tab: string) => void;
  openModal: (content: UIState['modalContent'], data?: unknown) => void;
  closeModal: () => void;
  addToast: (message: string, type?: UIState['toasts'][0]['type']) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, text?: string) => void;
  toggleSound: () => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  // Holat
  activeTab: 'home',
  isModalOpen: false,
  modalContent: null,
  modalData: null,
  toasts: [],
  globalLoading: false,
  loadingText: '',
  soundEnabled: true,
  colorScheme: 'dark',

  // Harakatlar
  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (content, data = null) =>
    set({
      isModalOpen: true,
      modalContent: content,
      modalData: data,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
      modalData: null,
    }),

  addToast: (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Avtomatik o'chirish 3 soniyadan keyin
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setGlobalLoading: (loading, text = '') =>
    set({ globalLoading: loading, loadingText: text }),

  toggleSound: () =>
    set((state) => ({ soundEnabled: !state.soundEnabled })),

  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
