// src/lib/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { createClient } from "@/lib/local/client";

interface AuthError {
  message: string;
  status?: number;
}

interface User {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  /**
   * Change the signed-in user's password. The current password is verified
   * SERVER-SIDE before the change (prevents session-hijack → lockout).
   */
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: AuthError | null }>;
  /** Reset password with a single-use token from the reset email. */
  resetPasswordWithToken: (
    token: string,
    newPassword: string
  ) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const initializeAuth = useCallback(async () => {
    try {
      // Session lives in an httpOnly cookie; /api/local/auth/me resolves it.
      const currentUser = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase.auth, initializeAuth]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      full_name: fullName,
    });
    if (!error && data?.user) setUser(data.user);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data?.user) setUser(data.user);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.changePassword(currentPassword, newPassword);
    return { error };
  };

  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    const { error } = await supabase.auth.resetPasswordWithToken(token, newPassword);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resetPasswordWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
