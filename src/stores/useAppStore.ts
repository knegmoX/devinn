import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { 
  AppState, 
  UserProfile, 
  UserPreferences, 
  TravelNote, 
  ChatMessage, 
  AISuggestion,
  AssistantState 
} from '@/types'

interface AppStore extends AppState {
  // User actions
  setUser: (user: UserProfile) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  logout: () => void
  
  // Notes actions
  setCurrentNote: (note: TravelNote | null) => void
  addNote: (note: TravelNote) => void
  updateNote: (noteId: string, updates: Partial<TravelNote>) => void
  deleteNote: (noteId: string) => void
  setNotesLoading: (loading: boolean) => void
  setNotesError: (error: string | null) => void
  
  // Assistant actions
  openAssistant: () => void
  closeAssistant: () => void
  setAssistantState: (state: AssistantState) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatHistory: () => void
  addSuggestion: (suggestion: AISuggestion) => void
  removeSuggestion: (suggestionId: string) => void
  setAssistantProcessing: (processing: boolean) => void
  
  // UI actions
  toggleTheme: () => void
  toggleSidebar: () => void
  setActiveDay: (day: number) => void
  setEditMode: (editMode: boolean) => void
}

const defaultPreferences: UserPreferences = {
  language: 'zh-CN',
  currency: 'CNY',
  timezone: 'Asia/Shanghai',
  travelStyle: [],
  dietaryRestrictions: [],
  accessibility: []
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: {
          profile: null,
          preferences: defaultPreferences,
          isAuthenticated: false
        },
        
        notes: {
          currentNote: null,
          notesList: [],
          isLoading: false,
          error: null
        },
        
        assistant: {
          isOpen: false,
          state: 'COLLAPSED',
          chatHistory: [],
          suggestions: [],
          isProcessing: false
        },
        
        ui: {
          theme: 'light',
          sidebarOpen: true,
          activeDay: 1,
          editMode: false
        },
        
        // User actions
        setUser: (user: UserProfile) => set(state => ({
          user: {
            ...state.user,
            profile: user,
            isAuthenticated: true,
            preferences: { ...defaultPreferences, ...user.preferences }
          }
        })),
        
        updateUserPreferences: (preferences: Partial<UserPreferences>) => set(state => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences }
          }
        })),
        
        logout: () => set(() => ({
          user: {
            profile: null,
            preferences: defaultPreferences,
            isAuthenticated: false
          },
          notes: {
            currentNote: null,
            notesList: [],
            isLoading: false,
            error: null
          },
          assistant: {
            isOpen: false,
            state: 'COLLAPSED',
            chatHistory: [],
            suggestions: [],
            isProcessing: false
          }
        })),
        
        // Notes actions
        setCurrentNote: (note: TravelNote | null) => set(state => ({
          notes: { ...state.notes, currentNote: note }
        })),
        
        addNote: (note: TravelNote) => set(state => ({
          notes: {
            ...state.notes,
            notesList: [note, ...state.notes.notesList]
          }
        })),
        
        updateNote: (noteId: string, updates: Partial<TravelNote>) => set(state => ({
          notes: {
            ...state.notes,
            notesList: state.notes.notesList.map(note =>
              note.id === noteId ? { ...note, ...updates } : note
            ),
            currentNote: state.notes.currentNote?.id === noteId 
              ? { ...state.notes.currentNote, ...updates }
              : state.notes.currentNote
          }
        })),
        
        deleteNote: (noteId: string) => set(state => ({
          notes: {
            ...state.notes,
            notesList: state.notes.notesList.filter(note => note.id !== noteId),
            currentNote: state.notes.currentNote?.id === noteId 
              ? null 
              : state.notes.currentNote
          }
        })),
        
        setNotesLoading: (loading: boolean) => set(state => ({
          notes: { ...state.notes, isLoading: loading }
        })),
        
        setNotesError: (error: string | null) => set(state => ({
          notes: { ...state.notes, error }
        })),
        
        // Assistant actions
        openAssistant: () => set(state => ({
          assistant: { 
            ...state.assistant, 
            isOpen: true,
            state: state.assistant.state === 'COLLAPSED' ? 'QUICK_MENU' : state.assistant.state
          }
        })),
        
        closeAssistant: () => set(state => ({
          assistant: { 
            ...state.assistant, 
            isOpen: false,
            state: 'COLLAPSED'
          }
        })),
        
        setAssistantState: (assistantState: AssistantState) => set(state => ({
          assistant: { 
            ...state.assistant, 
            state: assistantState,
            isOpen: assistantState !== 'COLLAPSED'
          }
        })),
        
        addChatMessage: (message: ChatMessage) => set(state => ({
          assistant: {
            ...state.assistant,
            chatHistory: [...state.assistant.chatHistory, message]
          }
        })),
        
        clearChatHistory: () => set(state => ({
          assistant: {
            ...state.assistant,
            chatHistory: []
          }
        })),
        
        addSuggestion: (suggestion: AISuggestion) => set(state => ({
          assistant: {
            ...state.assistant,
            suggestions: [...state.assistant.suggestions, suggestion]
          }
        })),
        
        removeSuggestion: (suggestionId: string) => set(state => ({
          assistant: {
            ...state.assistant,
            suggestions: state.assistant.suggestions.filter(s => s.id !== suggestionId)
          }
        })),
        
        setAssistantProcessing: (processing: boolean) => set(state => ({
          assistant: {
            ...state.assistant,
            isProcessing: processing
          }
        })),
        
        // UI actions
        toggleTheme: () => set(state => ({
          ui: {
            ...state.ui,
            theme: state.ui.theme === 'light' ? 'dark' : 'light'
          }
        })),
        
        toggleSidebar: () => set(state => ({
          ui: {
            ...state.ui,
            sidebarOpen: !state.ui.sidebarOpen
          }
        })),
        
        setActiveDay: (day: number) => set(state => ({
          ui: {
            ...state.ui,
            activeDay: day
          }
        })),
        
        setEditMode: (editMode: boolean) => set(state => ({
          ui: {
            ...state.ui,
            editMode
          }
        }))
      }),
      {
        name: 'devinn-storage',
        partialize: (state) => ({
          user: {
            preferences: state.user.preferences,
            // Don't persist profile for security
          },
          ui: {
            theme: state.ui.theme,
            sidebarOpen: state.ui.sidebarOpen
          }
        })
      }
    ),
    {
      name: 'devinn-store'
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore(state => state.user)
export const useNotes = () => useAppStore(state => state.notes)
export const useAssistant = () => useAppStore(state => state.assistant)
export const useUI = () => useAppStore(state => state.ui)

// Action selectors
export const useUserActions = () => useAppStore(state => ({
  setUser: state.setUser,
  updateUserPreferences: state.updateUserPreferences,
  logout: state.logout
}))

export const useNotesActions = () => useAppStore(state => ({
  setCurrentNote: state.setCurrentNote,
  addNote: state.addNote,
  updateNote: state.updateNote,
  deleteNote: state.deleteNote,
  setNotesLoading: state.setNotesLoading,
  setNotesError: state.setNotesError
}))

export const useAssistantActions = () => useAppStore(state => ({
  openAssistant: state.openAssistant,
  closeAssistant: state.closeAssistant,
  setAssistantState: state.setAssistantState,
  addChatMessage: state.addChatMessage,
  clearChatHistory: state.clearChatHistory,
  addSuggestion: state.addSuggestion,
  removeSuggestion: state.removeSuggestion,
  setAssistantProcessing: state.setAssistantProcessing
}))

export const useUIActions = () => useAppStore(state => ({
  toggleTheme: state.toggleTheme,
  toggleSidebar: state.toggleSidebar,
  setActiveDay: state.setActiveDay,
  setEditMode: state.setEditMode
}))
