// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  SelectedSymptom, 
  ChatMessage, 
  Consultation,
  AnalyzeResponse 
} from '@/types';

interface AppState {
  // ============================================
  // USER STATE
  // ============================================
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  
  // ============================================
  // SYMPTOM STATE
  // ============================================
  selectedSymptoms: SelectedSymptom[];
  symptomDescription: string;
  
  addSymptom: (symptom: SelectedSymptom) => void;
  removeSymptom: (symptomId: string) => void;
  updateSymptomSeverity: (symptomId: string, severity: number) => void;
  clearSymptoms: () => void;
  setSymptomDescription: (description: string) => void;
  
  // ============================================
  // ANALYSIS STATE
  // ============================================
  currentAnalysis: AnalyzeResponse | null;
  isAnalyzing: boolean;
  analysisHistory: Consultation[];
  
  setCurrentAnalysis: (analysis: AnalyzeResponse | null) => void;
  setIsAnalyzing: (value: boolean) => void;
  addToHistory: (consultation: Consultation) => void;
  clearHistory: () => void;
  
  // ============================================
  // CHAT STATE
  // ============================================
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  currentSessionId: string | null;
  
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setIsChatLoading: (value: boolean) => void;
  clearChat: () => void;
  setCurrentSessionId: (id: string | null) => void;
  
  // ============================================
  // UI STATE
  // ============================================
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // ============================================
  // RESET
  // ============================================
  resetStore: () => void;
}

const initialState = {
  // User
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Symptoms
  selectedSymptoms: [],
  symptomDescription: '',
  
  // Analysis
  currentAnalysis: null,
  isAnalyzing: false,
  analysisHistory: [],
  
  // Chat
  chatMessages: [],
  isChatLoading: false,
  currentSessionId: null,
  
  // UI
  theme: 'light' as const,
  sidebarOpen: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ============================================
      // USER ACTIONS
      // ============================================
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      
      // ============================================
      // SYMPTOM ACTIONS
      // ============================================
      addSymptom: (symptom) => set((state) => {
        // Prevent duplicates
        const exists = state.selectedSymptoms.some(
          s => s.symptom.id === symptom.symptom.id
        );
        if (exists) return state;
        
        return {
          selectedSymptoms: [...state.selectedSymptoms, symptom]
        };
      }),
      
      removeSymptom: (symptomId) => set((state) => ({
        selectedSymptoms: state.selectedSymptoms.filter(
          s => s.symptom.id !== symptomId
        )
      })),
      
      updateSymptomSeverity: (symptomId, severity) => set((state) => ({
        selectedSymptoms: state.selectedSymptoms.map(s =>
          s.symptom.id === symptomId ? { ...s, severity } : s
        )
      })),
      
      clearSymptoms: () => set({ 
        selectedSymptoms: [], 
        symptomDescription: '' 
      }),
      
      setSymptomDescription: (description) => set({ 
        symptomDescription: description 
      }),
      
      // ============================================
      // ANALYSIS ACTIONS
      // ============================================
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      setIsAnalyzing: (value) => set({ isAnalyzing: value }),
      
      addToHistory: (consultation) => set((state) => ({
        analysisHistory: [consultation, ...state.analysisHistory].slice(0, 50)
      })),
      
      clearHistory: () => set({ analysisHistory: [] }),
      
      // ============================================
      // CHAT ACTIONS
      // ============================================
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      
      setChatMessages: (messages) => set({ chatMessages: messages }),
      setIsChatLoading: (value) => set({ isChatLoading: value }),
      
      clearChat: () => set({ 
        chatMessages: [], 
        currentSessionId: null 
      }),
      
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      
      // ============================================
      // UI ACTIONS
      // ============================================
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // ============================================
      // RESET
      // ============================================
      resetStore: () => set(initialState),
    }),
    {
      name: 'medassist-storage',
      partialize: (state) => ({
        theme: state.theme,
        analysisHistory: state.analysisHistory,
      }),
    }
  )
);

// ============================================
// SELECTOR HOOKS (for performance)
// ============================================
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSelectedSymptoms = () => useAppStore((state) => state.selectedSymptoms);
export const useCurrentAnalysis = () => useAppStore((state) => state.currentAnalysis);
export const useChatMessages = () => useAppStore((state) => state.chatMessages);
export const useTheme = () => useAppStore((state) => state.theme);