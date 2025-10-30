import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  email: string;
  name: string;
  tasksCompleted: number;
  interviewsCompleted: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  completeTask: () => void;
  completeInterview: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, name: string) =>
        set({
          user: {
            email,
            name,
            tasksCompleted: 0,
            interviewsCompleted: 0,
          },
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      completeTask: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, tasksCompleted: (state.user.tasksCompleted || 0) + 1 }
            : null,
        })),
      completeInterview: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, interviewsCompleted: (state.user.interviewsCompleted || 0) + 1 }
            : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)