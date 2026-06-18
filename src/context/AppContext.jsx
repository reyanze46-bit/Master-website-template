import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const AppContext = createContext()

const STORAGE_KEY = 'reelflow-state'

const DEFAULT_STATE = {
  campaigns: [],
  leads: [],
  activeTab: 'campaigns',
  simulatorState: null, // { campaignId, stage, messages, currentStep, collected }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CAMPAIGN': {
      const campaign = {
        id: generateId(),
        name: action.payload.name,
        videoUrl: action.payload.videoUrl,
        triggerKeyword: action.payload.triggerKeyword.toUpperCase(),
        questions: action.payload.questions || [],
        createdAt: new Date().toISOString(),
        active: true,
      }
      return { ...state, campaigns: [...state.campaigns, campaign] }
    }
    case 'UPDATE_CAMPAIGN': {
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    }
    case 'DELETE_CAMPAIGN': {
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload),
      }
    }
    case 'TOGGLE_CAMPAIGN': {
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload ? { ...c, active: !c.active } : c
        ),
      }
    }
    case 'ADD_LEAD': {
      const lead = {
        id: generateId(),
        campaignId: action.payload.campaignId,
        campaignName: action.payload.campaignName,
        handle: action.payload.handle || '@user_' + Math.random().toString(36).slice(2, 6),
        name: action.payload.name || '',
        email: action.payload.email || '',
        qualifiers: action.payload.qualifiers || {},
        status: action.payload.status || 'qualified',
        timestamp: new Date().toISOString(),
      }
      return { ...state, leads: [lead, ...state.leads] }
    }
    case 'UPDATE_LEAD': {
      return {
        ...state,
        leads: state.leads.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
      }
    }
    case 'DELETE_LEAD': {
      return {
        ...state,
        leads: state.leads.filter(l => l.id !== action.payload),
      }
    }
    case 'SET_TAB': {
      return { ...state, activeTab: action.payload }
    }
    case 'START_SIMULATOR': {
      return {
        ...state,
        simulatorState: {
          campaignId: action.payload.campaignId,
          stage: 'reels',
          messages: [],
          currentStep: -1,
          collected: {},
          handle: null,
        }
      }
    }
    case 'SET_SIMULATOR_STAGE': {
      return {
        ...state,
        simulatorState: { ...state.simulatorState, stage: action.payload }
      }
    }
    case 'ADD_SIMULATOR_MESSAGE': {
      return {
        ...state,
        simulatorState: {
          ...state.simulatorState,
          messages: [...state.simulatorState.messages, action.payload]
        }
      }
    }
    case 'SET_SIMULATOR_STEP': {
      return {
        ...state,
        simulatorState: { ...state.simulatorState, currentStep: action.payload }
      }
    }
    case 'UPDATE_COLLECTED': {
      return {
        ...state,
        simulatorState: {
          ...state.simulatorState,
          collected: { ...state.simulatorState.collected, ...action.payload }
        }
      }
    }
    case 'SET_SIMULATOR_HANDLE': {
      return {
        ...state,
        simulatorState: { ...state.simulatorState, handle: action.payload }
      }
    }
    case 'RESET_SIMULATOR': {
      return { ...state, simulatorState: null }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { generateId }