import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Search, Filter, Users, Shield, Clock, Star, AlertTriangle, X, ChevronDown, MapPin, DollarSign, Calendar } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { searchCandidates, CandidateSearchResult, SearchFilters } from '../services/candidateService'
import { supabase } from '../services/supabase'

// Candidate Card component
const CandidateCard = ({ candidate, onSelect, onAddToPipeline }) => {
  const currencies = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'ZAR': 'R',
    'INR': '₹',
    'SGD': 'S$',
    'JPY': '¥',
    'CHF': 'CHF'
  }

  const getVerificationBadge = () => {
    switch (candidate.verificationStatus) {
      case 'verified':
        return (
          <div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>ReelPass Verified</span>
          </div>
        )
      case 'partial':
        return (
          <div className="inline-flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>Partially Verified</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span>Unverified</span>
          </div>
        )
    }
  }

  const getAvailabilityBadge = () => {
    switch (candidate.availabilityStatus) {
      case 'available':
        return (
          <div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Available Now</span>
          </div>
        )
      case 'open':
        return (
          <div className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Open to Opportunities</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Not Looking</span>
          </div>
        )
    }
  }

  const formatSalaryRange = () => {
    if (candidate.salaryExpectationMin && candidate.salaryExpectationMax) {
      const currencySymbol = currencies[candidate.currency as keyof typeof currencies] || '$'
      return `${currencySymbol}${candidate.salaryExpectationMin.toLocaleString()} - ${currencySymbol}${candidate.salaryExpectationMax.toLocaleString()}`
    }
    return null
  }

  return (
    <div className="bg-background-panel border border-gray-600 rounded-xl p-6 hover:border-primary-500 transition-all duration-200 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-400 transition-colors duration-200">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-text-muted text-sm">{candidate.headline}</p>
            </div>
          </div>
          
          {/* Verification and Availability Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getVerificationBadge()}
            {getAvailabilityBadge()}
          </div>
        </div>
        
        {/* ReelPass Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{candidate.reelpassScore}</div>
          <div className="text-xs text-text-muted">ReelPass Score</div>
        </div>
      </div>

      {/* Availability Details */}
      {(candidate.availableFrom || candidate.noticePeriodDays || formatSalaryRange()) && (
        <div className="bg-background-card rounded-lg p-3 mb-4 space-y-2">
          {candidate.availableFrom && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>Available from {new Date(candidate.availableFrom).toLocaleDateString()}</span>
            </div>
          )}
          {candidate.noticePeriodDays && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>{candidate.noticePeriodDays} days notice period</span>
            </div>
          )}
          {formatSalaryRange() && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>{formatSalaryRange()}</span>
            </div>
          )}
          {candidate.preferredWorkType && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="capitalize">{candidate.preferredWorkType} work</span>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="px-3 py-1 bg-background-card text-text-muted rounded-full text-sm">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Location Preferences */}
      {candidate.locationPreferences && candidate.locationPreferences.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-text-muted">
            <MapPin className="w-4 h-4" />
            <span>Prefers: {candidate.locationPreferences.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
        <div className="text-xs text-text-muted">
          Last active: {new Date(candidate.lastActive).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSelect?.(candidate)}
            className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors duration-200"
          >
            View Profile
          </button>
          <button
            onClick={() => onAddToPipeline?.(candidate)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  )
}

// Search Interface component
const SearchInterface = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    skills: [],
    experience: '',
    location: '',
    reelPassOnly: true,
    availability: '',
    currency: 'USD',
    salaryMin: '',
    salaryMax: ''
  })

  const skillSuggestions = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#',
    'Angular', 'Vue.js', 'PHP', 'Laravel', 'Django', 'Spring Boot',
    'Cloud Computing', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL'
  ]

  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)', 
    'Senior Level (6-10 years)',
    'Lead/Principal (10+ years)'
  ]

  const availabilityOptions = [
    'Available immediately',
    'Available in 2 weeks',
    'Available in 1 month',
    'Open to opportunities'
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' }
  ]

  const addSkill = (skill) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const removeSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleSearch = () => {
    console.log("Search interface - handleSearch called with:", { query: searchQuery, ...filters })
    if (onSearch) {
      onSearch({
        query: searchQuery,
        ...filters
      })
    }
  }

  const selectedCurrency = currencies.find(c => c.code === filters.currency)

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 mb-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <Search className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-5xl font-bold text-text-primary">Find ReelCV Talent</h1>
        </div>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
          Search verified professionals from the ReelCV platform with government-backed credentials and comprehensive skill assessments
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-text-muted" />
          <input
            type="text"
            placeholder="Search for roles, skills, or technologies in ReelCV candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-16 pr-48 py-5 bg-background-panel border border-gray-600 rounded-2xl text-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-lg"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-background-card text-text-secondary hover:text-text-primary hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <button 
              onClick={handleSearch}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="max-w-6xl mx-auto bg-background-panel border border-gray-600 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-text-primary">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skills Filter */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Required Skills
              </label>
              <div className="space-y-3">
                {filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center space-x-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-primary-100 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {skillSuggestions.filter(skill => !filters.skills.includes(skill)).slice(0, 6).map(skill => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="text-left px-4 py-3 bg-background-card hover:bg-gray-600 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-all duration-200 border border-gray-600 hover:border-primary-500"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Any experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country, or Remote"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Salary Currency
              </label>
              <div className="relative">
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Salary Range ({selectedCurrency?.symbol})
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                  className="flex-1 px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-text-muted self-center">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                  className="flex-1 px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Availability
              </label>
              <div className="relative">
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Any availability</option>
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* ReelPass Filter */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Verification Status
              </label>
              <label className="flex items-center space-x-4 cursor-pointer p-4 bg-background-card rounded-xl border border-gray-600 hover:border-primary-500 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={filters.reelPassOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, reelPassOnly: e.target.checked }))}
                  className="w-5 h-5 text-primary-500 bg-background-card border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-primary-400" />
                  <span className="text-text-secondary font-medium">ReelPass Verified Only</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-gray-600 mt-8">
            <button
              onClick={() => setFilters({
                skills: [],
                experience: '',
                location: '',
                reelPassOnly: true,
                availability: '',
                currency: 'USD',
                salaryMin: '',
                salaryMax: ''
              })}
              className="text-text-muted hover:text-text-primary font-medium transition-colors duration-200"
            >
              Clear all filters
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-text-muted">
                {filters.skills.length + (filters.experience ? 1 : 0) + (filters.location ? 1 : 0) + (filters.availability ? 1 : 0)} filters applied
              </span>
              <button 
                onClick={handleSearch}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Placeholder */}
      <div className="max-w-4xl mx-auto bg-background-panel border border-gray-600 rounded-2xl p-12 text-center shadow-xl">
        <div className="max-w-lg mx-auto">
          <div className="p-6 bg-primary-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="text-2xl font-semibold text-text-primary mb-4">
            Ready to Find Your Perfect Match?
          </h3>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            Search through our verified ReelCV talent pool with comprehensive skill assessments and government-backed credentials
          </p>
          <div className="bg-background-card p-6 rounded-xl border border-gray-600">
            <p className="text-text-muted">
              🎯 <strong className="text-text-secondary">ReelCV Advantage:</strong> All candidates have verified skills, ReelPass credentials, and comprehensive profiles with video demonstrations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SearchPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const [searchResults, setSearchResults] = useState<CandidateSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("SearchPage - Auth state:", { isAuthenticated, userId: user?.id })

  const handleSearch = async (searchData: { query: string } & SearchFilters) => {
    console.log('Search performed with data:', searchData)
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await searchCandidates(searchData.query, searchData)
      console.log("Search results:", results.length, "candidates found")
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
      setSearchResults([])
      setShowResults(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCandidate = (candidate: CandidateSearchResult) => {
    console.log('Selected candidate:', candidate)
    // TODO: Navigate to candidate profile
  }

  const handleAddToPipeline = (candidate: CandidateSearchResult) => {
    console.log('Adding to pipeline:', candidate)
    // TODO: Add to pipeline logic
    showNotification('✅ Candidate Added to Pipeline', `${candidate.firstName} ${candidate.lastName} has been added to your pipeline`)
  }

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold">${title}</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 5000)
  }

  const getVerificationStats = () => {
    const verified = searchResults.filter(c => c.verificationStatus === 'verified').length
    const available = searchResults.filter(c => c.availabilityStatus === 'available').length
    const highScore = searchResults.filter(c => c.reelpassScore >= 80).length
    
    return { verified, available, highScore }
  }

  const stats = getVerificationStats()

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="p-4 bg-primary-500/10 rounded-2xl">
                <Search className="w-10 h-10 text-primary-400" />
              </div>
              <h1 className="text-5xl font-bold text-text-primary">Find ReelCV Talent</h1>
            </div>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Please log in to search verified professionals from the ReelCV platform
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {!showResults ? (
          <div className="space-y-8">
            <SearchInterface onSearch={handleSearch} />
            
            {/* ReelCV Platform Benefits */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Shield className="w-8 h-8 text-primary-400" />
                    <h3 className="text-2xl font-semibold text-text-primary">ReelCV Verified Talent Pool</h3>
                  </div>
                  <p className="text-text-secondary mb-6 text-lg leading-relaxed">
                    Search through our curated pool of ReelCV candidates with verified skills, government-backed credentials, and comprehensive ReelPass profiles
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="p-3 bg-green-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">ReelPass Verified</h4>
                      <p className="text-text-muted text-sm">Government-backed credential verification</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Star className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">Skill Demonstrations</h4>
                      <p className="text-text-muted text-sm">Video proofs and verified competencies</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-purple-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">Live Availability</h4>
                      <p className="text-text-muted text-sm">Real-time availability and notice periods</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">ReelCV Talent Search Results</h1>
                <p className="text-text-secondary">
                  {isLoading ? 'Searching...' : error ? 'Search encountered an error' : `Found ${searchResults.length} verified candidates from the ReelCV platform`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setError(null)
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Search className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Search Error</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-text-muted">Searching for candidates...</p>
                </div>
              </div>
            ) : !error && searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">No candidates found</h3>
                <p className="text-text-muted">Try adjusting your search criteria or filters</p>
              </div>
            ) : !error && searchResults.length > 0 ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="w-6 h-6 text-green-400" />
                      <span className="text-lg font-semibold text-text-primary">{stats.verified}</span>
                    </div>
                    <p className="text-text-muted">ReelPass Verified</p>
                  </div>
                  
                  <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <span className="text-lg font-semibold text-text-primary">{stats.available}</span>
                    </div>
                    <p className="text-text-muted">Available Now</p>
                  </div>
                  
                  <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <span className="text-lg font-semibold text-text-primary">{stats.highScore}</span>
                    </div>
                    <p className="text-text-muted">High ReelPass Score (80+)</p>
                  </div>
                  
                  <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="w-6 h-6 text-purple-400" />
                      <span className="text-lg font-semibold text-text-primary">{searchResults.length}</span>
                    </div>
                    <p className="text-text-muted">Total Candidates</p>
                  </div>
                </div>

                {/* Search Results */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onSelect={handleSelectCandidate}
                      onAddToPipeline={handleAddToPipeline}
                    />
                  ))}
                </div>

                {/* Load More */}
                {searchResults.length >= 50 && (
                  <div className="text-center">
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                      Load More Candidates
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SearchPage