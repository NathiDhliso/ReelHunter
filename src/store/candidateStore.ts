import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { CandidateSearchResult, SearchFilters } from '../services/candidateService'
import type { Database } from '../types/supabase'

// Type alias for better readability
type LiveCandidateAvailability = Database['public']['Views']['live_candidate_availability']['Row']

interface CandidateStore {
  candidates: CandidateSearchResult[]
  selectedCandidate: CandidateSearchResult | null
  searchResults: CandidateSearchResult[]
  isLoading: boolean
  error: string | null
  
  // Actions
  searchCandidates: (query: string, filters?: SearchFilters) => Promise<void>
  selectCandidate: (candidate: CandidateSearchResult) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCandidateStore = create<CandidateStore>()((set) => ({
  candidates: [],
  selectedCandidate: null,
  searchResults: [],
  isLoading: false,
  error: null,

  searchCandidates: async (query: string, filters?: SearchFilters) => {
    set({ isLoading: true, error: null })
    try {
      // Use the live_candidate_availability view for optimized search
      let queryBuilder = supabase
        .from('live_candidate_availability')
        .select('*')

      // Apply text search if query provided
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,headline.ilike.%${query}%,email.ilike.%${query}%`)
      }

      // Apply ReelPass filter
      if (filters?.reelPassOnly) {
        queryBuilder = queryBuilder.gte('reelpass_score', 60)
      }

      // Apply availability filter
      if (filters?.availability) {
        const availabilityMap: Record<string, Database['public']['Enums']['availability_status']> = {
          'Available immediately': 'available',
          'Available in 2 weeks': 'available',
          'Available in 1 month': 'available',
          'Open to opportunities': 'open'
        }
        const status = availabilityMap[filters.availability]
        if (status) {
          queryBuilder = queryBuilder.eq('availability_status', status)
        }
      }

      // Apply salary filters
      if (filters?.salaryMin) {
        queryBuilder = queryBuilder.gte('salary_expectation_max', parseInt(filters.salaryMin))
      }
      if (filters?.salaryMax) {
        queryBuilder = queryBuilder.lte('salary_expectation_min', parseInt(filters.salaryMax))
      }

      // Apply location filter
      if (filters?.location) {
        queryBuilder = queryBuilder.contains('location_preferences', [filters.location])
      }

      // Apply province filter (SA specific)
      if (filters?.province) {
        const provinceValue = filters.province.toLowerCase().replace(' ', '_') as Database['public']['Enums']['sa_province']
        queryBuilder = queryBuilder.eq('province', provinceValue)
      }

      // Apply BEE level filter (SA specific)
      if (filters?.beeLevel) {
        const beeLevel = filters.beeLevel.toLowerCase().replace(/\s+/g, '_') as Database['public']['Enums']['bee_level']
        queryBuilder = queryBuilder.eq('bee_status', beeLevel)
      }

      // Execute the query
      const { data, error } = await queryBuilder.limit(50)

      if (error) {
        throw new Error(`Search failed: ${error.message}`)
      }

      if (!data) {
        set({ searchResults: [], isLoading: false })
        return
      }

      // Get skills for each candidate
      const candidateIds = data.map(candidate => candidate.candidate_id).filter((id): id is string => Boolean(id))
      const { data: skillsData } = await supabase
        .from('skills')
        .select('profile_id, name, verified')
        .in('profile_id', candidateIds)

      // Group skills by profile_id
      const skillsByProfile = skillsData?.reduce((acc, skill) => {
        if (!acc[skill.profile_id]) {
          acc[skill.profile_id] = []
        }
        acc[skill.profile_id].push(skill.name)
        return acc
      }, {} as Record<string, string[]>) || {}

      // Transform the data to match our interface
      const candidates: CandidateSearchResult[] = data.map((candidate: LiveCandidateAvailability) => {
        const skills = skillsByProfile[candidate.candidate_id || ''] || []
        
        return {
          id: candidate.candidate_id || '',
          firstName: candidate.first_name || '',
          lastName: candidate.last_name || '',
          headline: candidate.headline || 'Professional',
          email: candidate.email || '',
          reelpassScore: candidate.reelpass_score || 0,
          verificationStatus: candidate.verification_status as 'verified' | 'partial' | 'unverified' || 'unverified',
          availabilityStatus: candidate.availability_status || 'not-looking',
          availableFrom: candidate.available_from || undefined,
          noticePeriodDays: candidate.notice_period_days || undefined,
          salaryExpectationMin: candidate.salary_expectation_min || undefined,
          salaryExpectationMax: candidate.salary_expectation_max || undefined,
          preferredWorkType: candidate.preferred_work_type || undefined,
          locationPreferences: candidate.location_preferences || [],
          skills,
          lastActive: candidate.availability_updated_at || new Date().toISOString(),
          currency: filters?.currency || 'USD',
          province: candidate.province || undefined,
          beeStatus: candidate.bee_status || undefined,
          languages: [] // Will be populated if needed
        }
      })

      // Apply skills filter (client-side for now)
      let filteredCandidates = candidates
      if (filters?.skills && filters.skills.length > 0) {
        filteredCandidates = candidates.filter(candidate => 
          filters.skills!.some(skill => 
            candidate.skills.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        )
      }

      // Apply languages filter (client-side for now)
      if (filters?.languages && filters.languages.length > 0) {
        filteredCandidates = filteredCandidates.filter(candidate => 
          candidate.languages && 
          filters.languages!.some(lang => 
            candidate.languages!.includes(lang as Database['public']['Enums']['sa_language'])
          )
        )
      }

      set({ 
        searchResults: filteredCandidates,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
        searchResults: []
      })
    }
  },

  selectCandidate: (candidate) => {
    set({ selectedCandidate: candidate })
  },

  clearSelection: () => {
    set({ selectedCandidate: null })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))