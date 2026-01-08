// src/types/index.ts

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  medical_conditions?: string[];
  allergies?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  reminder_notifications: boolean;
  preferred_remedy_types?: string[];
  language: string;
}

// ============================================
// SYMPTOM TYPES
// ============================================
export interface Symptom {
  id: string;
  name: string;
  category: string;
  description?: string;
  body_part?: string;
  severity_indicator?: string;
  icon?: string;
  created_at?: string;
}

export interface SelectedSymptom {
  symptom: Symptom;
  severity: number; // 1-10
  duration: string;
  notes?: string;
}

export type BodyPart = 
  | 'head' 
  | 'neck' 
  | 'chest' 
  | 'abdomen' 
  | 'back' 
  | 'arms' 
  | 'legs' 
  | 'skin' 
  | 'general';

export interface SymptomCategory {
  name: string;
  icon: string;
  symptoms: Symptom[];
}

// ============================================
// REMEDY TYPES
// ============================================
export interface Remedy {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  ingredients: string[];
  preparation_method?: string;
  preparation_time?: string;
  usage_instructions?: string;
  precautions?: string;
  contraindications?: string[];
  origin_region?: string;
  remedy_type: 'herbal' | 'home' | 'ayurvedic' | 'traditional' | 'chinese' | 'naturopathic';
  effectiveness_rating: number;
  total_ratings: number;
  image_url?: string;
  tags: string[];
  created_at?: string;
}

export interface RemedyRating {
  id: string;
  user_id: string;
  remedy_id: string;
  consultation_id?: string;
  rating: number;
  effectiveness?: number;
  ease_of_use?: number;
  review_text?: string;
  would_recommend?: boolean;
  created_at?: string;
}

export interface SavedRemedy {
  id: string;
  user_id: string;
  remedy_id: string;
  remedy?: Remedy;
  notes?: string;
  created_at?: string;
}

// ============================================
// CONSULTATION & ANALYSIS TYPES
// ============================================
export interface Consultation {
  id: string;
  user_id: string;
  symptoms: string[];
  symptoms_description?: string;
  duration?: string;
  severity_level?: number;
  ai_analysis?: AIAnalysis;
  ai_severity?: string;
  conditions_identified?: IdentifiedCondition[];
  recommendations?: string[];
  suggested_remedies?: SuggestedRemedy[];
  warning_flags?: string[];
  follow_up_recommended?: boolean;
  created_at?: string;
}

export interface AIAnalysis {
  summary: string;
  severity_assessment: 'mild' | 'moderate' | 'severe' | 'emergency';
  confidence_score: number;
  analysis_text: string;
  lifestyle_recommendations?: string[];
  when_to_see_doctor?: string[];
}

export interface IdentifiedCondition {
  name: string;
  probability: number; // 0-100
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface SuggestedRemedy {
  remedy_id: string;
  remedy_name: string;
  relevance_score: number;
  reason: string;
}

// ============================================
// CHAT TYPES
// ============================================
export interface ChatMessage {
  id: string;
  user_id?: string;
  consultation_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  consultation?: Consultation;
  created_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalyzeRequest {
  symptoms: SelectedSymptom[];
  additional_info?: string;
  user_profile?: Partial<User>;
}

export interface AnalyzeResponse {
  analysis: AIAnalysis;
  conditions: IdentifiedCondition[];
  remedies: SuggestedRemedy[];
  warnings: string[];
  recommendations: string[];
}

// ============================================
// UI STATE TYPES
// ============================================
export interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Symptoms
  selectedSymptoms: SelectedSymptom[];
  
  // Analysis
  currentAnalysis: AnalyzeResponse | null;
  analysisHistory: Consultation[];
  
  // Chat
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  
  // UI
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

// ============================================
// BODY MAP TYPES
// ============================================
export interface BodyMapArea {
  id: BodyPart;
  name: string;
  path: string; // SVG path
  symptoms: string[]; // symptom IDs related to this area
}

export interface BodyMapSelection {
  bodyPart: BodyPart;
  x: number;
  y: number;
}

// ============================================
// FORM TYPES
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export interface ProfileFormData {
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  medical_conditions?: string[];
  allergies?: string[];
}