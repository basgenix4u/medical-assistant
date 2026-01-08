// src/lib/database.ts

import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ConsultationData {
  symptoms: string[];
  symptoms_description?: string;
  duration?: string;
  severity_level?: number;
  ai_analysis?: {
    severity_assessment: string;
    confidence_score: number;
    summary: string;
    conditions: Array<{ name: string; probability: number; description: string; severity: string }>;
    recommendations: string[];
    remedies: Array<{ id: string; name: string; description: string; remedy_type: string }>;
    warnings: string[];
    see_doctor: { recommended: boolean; urgency: string; reason: string };
    [key: string]: unknown;  // This allows additional properties
  };
  ai_severity?: string;
  conditions_identified?: Array<{ name: string; probability: number; description: string; severity: string }>;
  recommendations?: string[];
  suggested_remedies?: Array<{ id: string; name: string; description: string; remedy_type: string }>;
  warning_flags?: string[];
  follow_up_recommended?: boolean;
}

// ============================================
// CONSULTATION (HISTORY) FUNCTIONS
// ============================================

export async function saveConsultation(data: ConsultationData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single();

  return { data: consultation, error };
}

export async function getConsultations(limit = 20) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

export async function deleteConsultation(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("consultations")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================
// REMEDY RATING FUNCTIONS
// ============================================

export async function saveRemedyRating(data: RatingData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data: rating, error } = await supabase
    .from("remedy_ratings")
    .upsert(
      {
        user_id: user.id,
        ...data,
      },
      {
        onConflict: "user_id,remedy_id",
      }
    )
    .select()
    .single();

  return { data: rating, error };
}

export async function getRemedyRating(remedyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("remedy_ratings")
    .select("*")
    .eq("user_id", user.id)
    .eq("remedy_id", remedyId)
    .maybeSingle();

  return { data, error };
}

export async function getRemedyAverageRating(remedyId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("remedy_ratings")
    .select("rating")
    .eq("remedy_id", remedyId);

  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return { average, count: data.length };
}

// ============================================
// SAVED REMEDIES (FAVORITES) FUNCTIONS
// ============================================

export async function saveRemedy(remedyId: string, notes?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data, error } = await supabase
    .from("saved_remedies")
    .insert({
      user_id: user.id,
      remedy_id: remedyId,
      notes,
    })
    .select()
    .single();

  return { data, error };
}

export async function unsaveRemedy(remedyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "Not authenticated" } as DatabaseError };
  }

  const { error } = await supabase
    .from("saved_remedies")
    .delete()
    .eq("user_id", user.id)
    .eq("remedy_id", remedyId);

  return { error };
}

export async function getSavedRemedies() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("saved_remedies")
    .select(`
      id,
      remedy_id,
      notes,
      created_at,
      remedies (
        id,
        name,
        description,
        short_description,
        remedy_type,
        effectiveness_rating,
        ingredients,
        preparation_method,
        usage_instructions,
        precautions,
        tags
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function isRemedySaved(remedyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("saved_remedies")
    .select("id")
    .eq("user_id", user.id)
    .eq("remedy_id", remedyId)
    .maybeSingle();

  return !!data;
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

export async function getProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data, error };
}

export async function updateProfile(updates: {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  medical_conditions?: string[];
  allergies?: string[];
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (!error && updates.full_name) {
    await supabase.auth.updateUser({
      data: { full_name: updates.full_name }
    });
  }

  return { data, error };
}

// ============================================
// USER PREFERENCES FUNCTIONS
// ============================================

export async function getUserPreferences() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { data, error };
}

export async function updateUserPreferences(preferences: {
  theme?: string;
  email_notifications?: boolean;
  reminder_notifications?: boolean;
  preferred_remedy_types?: string[];
  language?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;

  if (existing) {
    const result = await supabase
      .from("user_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    error = result.error;
  } else {
    const result = await supabase
      .from("user_preferences")
      .insert({
        user_id: user.id,
        theme: preferences.theme || "system",
        email_notifications: preferences.email_notifications ?? true,
        reminder_notifications: preferences.reminder_notifications ?? true,
        preferred_remedy_types: preferences.preferred_remedy_types || [],
        language: preferences.language || "en",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    error = result.error;
  }

  return { error };
}

// ============================================
// CHAT MESSAGES FUNCTIONS
// ============================================

export async function saveChatMessage(
  role: "user" | "assistant",
  content: string,
  consultationId?: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: user.id,
      consultation_id: consultationId,
      role,
      content,
    })
    .select()
    .single();

  return { data, error };
}

export async function getChatHistory(limit = 50) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(limit);

  return { data: data || [], error };
}

export async function clearChatHistory() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "Not authenticated" } as DatabaseError };
  }

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", user.id);

  return { error };
}

// ============================================
// DATA EXPORT FUNCTION
// ============================================

export async function exportUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Not authenticated" } as DatabaseError };
  }

  const [profile, preferences, consultations, savedRemedies, ratings, chatHistory] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("consultations").select("*").eq("user_id", user.id),
    supabase.from("saved_remedies").select("*, remedies(*)").eq("user_id", user.id),
    supabase.from("remedy_ratings").select("*").eq("user_id", user.id),
    supabase.from("chat_messages").select("*").eq("user_id", user.id),
  ]);

  return {
    data: {
      profile: profile.data,
      preferences: preferences.data,
      consultations: consultations.data || [],
      saved_remedies: savedRemedies.data || [],
      ratings: ratings.data || [],
      chat_history: chatHistory.data || [],
      exported_at: new Date().toISOString(),
    },
    error: null,
  };
}

// ============================================
// ACCOUNT DELETION FUNCTION
// ============================================

export async function deleteUserAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "Not authenticated" } as DatabaseError };
  }

  await supabase.from("chat_messages").delete().eq("user_id", user.id);
  await supabase.from("remedy_ratings").delete().eq("user_id", user.id);
  await supabase.from("saved_remedies").delete().eq("user_id", user.id);
  await supabase.from("consultations").delete().eq("user_id", user.id);
  await supabase.from("user_preferences").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  await supabase.auth.signOut();

  return { error: null };
}

// ============================================
// SYMPTOMS FUNCTIONS
// ============================================

export async function getSymptoms() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("symptoms")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return { data: data || [], error };
}

// ============================================
// REMEDIES FUNCTIONS
// ============================================

export async function getRemedies() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("remedies")
    .select("*")
    .order("effectiveness_rating", { ascending: false });

  return { data: data || [], error };
}

export async function getRemedyById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("remedies")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}