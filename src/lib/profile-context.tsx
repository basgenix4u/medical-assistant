// src/lib/profile-context.tsx

"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/lib/database";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: string;
  medical_conditions: string[];
  allergies: string[];
  avatar_url?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getProfile();

      if (data && !error) {
        setProfile({
          id: user.id,
          full_name: data.full_name || "",
          email: user.email || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          medical_conditions: data.medical_conditions || [],
          allergies: data.allergies || [],
          avatar_url: data.avatar_url || "",
        });
      } else {
        // Fallback to auth user data if profile doesn't exist yet
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          medical_conditions: [],
          allergies: [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Still set a basic profile from auth data
      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        medical_conditions: [],
        allergies: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load profile when auth changes
  useEffect(() => {
    if (!authLoading) {
      refreshProfile();
    }
  }, [user, authLoading, refreshProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}