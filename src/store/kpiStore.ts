import { create } from 'zustand'
import { supabase } from '../services/supabase'

export interface KPIMetrics {
  timeToFill: number
  costPerHire: number
  badHireRate: number
  eeTargetRate: number
  candidateNPS: number
  hiringManagerNPS: number
  crossoverRate: number
  diversityRate: number
  retentionRate: number
  lastUpdated: string
}

interface KPIStore {
  metrics: KPIMetrics
  isLoading: boolean
  error: string | null
  
  // Actions
  initializeMetrics: () => Promise<void>
  updateMetric: (key: keyof Omit<KPIMetrics, 'lastUpdated'>, value: number) => void
  refreshMetrics: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const initialMetrics: KPIMetrics = {
  timeToFill: 0,
  costPerHire: 0,
  badHireRate: 0,
  eeTargetRate: 0,
  candidateNPS: 0,
  hiringManagerNPS: 0,
  crossoverRate: 0,
  diversityRate: 0,
  retentionRate: 0,
  lastUpdated: new Date().toISOString(),
}

export const useKPIStore = create<KPIStore>()((set, get) => ({
  metrics: initialMetrics,
  isLoading: false,
  error: null,

  initializeMetrics: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement actual metrics fetching from Supabase
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      set({
        metrics: {
          ...initialMetrics,
          timeToFill: 28,
          costPerHire: 4500,
          badHireRate: 12,
          eeTargetRate: 85,
          candidateNPS: 72,
          hiringManagerNPS: 68,
          crossoverRate: 15,
          diversityRate: 42,
          retentionRate: 88,
          lastUpdated: new Date().toISOString(),
        },
        isLoading: false,
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load metrics',
        isLoading: false 
      })
    }
  },

  updateMetric: (key, value) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        [key]: value,
        lastUpdated: new Date().toISOString(),
      },
    }))
  },

  refreshMetrics: async () => {
    await get().initializeMetrics()
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))