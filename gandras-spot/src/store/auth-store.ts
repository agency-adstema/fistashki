"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, setToken, clearToken } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  restaurant: { id: string; name: string; slug: string };
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          setToken(res.accessToken);
          const user = res.user as AuthUser;
          // #region agent log
          fetch('http://127.0.0.1:7375/ingest/54af1a43-3763-48c7-8c65-1ddf55fe8f73',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'163fcb'},body:JSON.stringify({sessionId:'163fcb',location:'auth-store.ts:login-ok',message:'login success',data:{role:user?.role,emailDomain:email.split('@')[1]},timestamp:Date.now(),hypothesisId:'C-E'})}).catch(()=>{});
          // #endregion
          set({ user, isLoading: false });
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7375/ingest/54af1a43-3763-48c7-8c65-1ddf55fe8f73',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'163fcb'},body:JSON.stringify({sessionId:'163fcb',location:'auth-store.ts:login-fail',message:'login failed',data:{error:e instanceof Error?e.message:'unknown'},timestamp:Date.now(),hypothesisId:'A-D'})}).catch(()=>{});
          // #endregion
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        clearToken();
        set({ user: null });
      },

      hydrate: async () => {
        try {
          const user = (await authApi.me()) as AuthUser;
          set({ user });
        } catch {
          clearToken();
          set({ user: null });
        }
      },
    }),
    { name: "gandras-auth", partialize: (s) => ({ user: s.user }) },
  ),
);
