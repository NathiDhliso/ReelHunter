import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { TrendingUp, TrendingDown, Users, Clock, Target, Star, MessageSquare, Award, RefreshCw } from 'lucide-react'

interface RecruiterStats {
  totalReviews: number
  avgCommunication: number
  avgProfessionalism: number
  avgRoleAccuracy: number
  overallRating: number
  positiveReviews: number
  negativeReviews: number
  monthlyTrend: number
  placementSuccess: number
  responseTime: number
  candidateNPS: number
}

const MyStatsPage: React.FC = () => {
  const [stats, setStats] = useState<RecruiterStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatsData()
  }, [])

  const loadStatsData = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement actual API calls to load recruiter stats
      // For now, show sample data
      setStats({
        totalReviews: 0,
        avgCommunication: 0,
        avgProfessionalism: 0,
        avgRoleAccuracy: 0,
        overallRating: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        monthlyTrend: 0,
        placementSuccess: 0,
        responseTime: 0,
        candidateNPS: 0
      })
    } catch (error) {
      console.error('Failed to load stats data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-primary-400'
    if (rating >= 4.0) return 'text-primary-400'
    if (rating >= 3.5) return 'text-text-primary'
    if (rating >= 3.0) return 'text-text-secondary'
    return 'text-text-muted'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-primary-400" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-text-muted" />
    return <div className="w-4 h-4" />
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-primary-400 fill-current'
            : i < rating
            ? 'text-primary-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-muted">Loading your stats...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">My ReelHunting Stats & Reviews</h1>
            <p className="text-lg text-text-secondary">Track your performance and manage your professional reputation</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={loadStatsData}
              className="flex items-center space-x-2 px-4 py-2 bg-background-panel border border-gray-600 rounded-xl text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {stats && stats.totalReviews === 0 && (
          <div className="bg-background-panel border border-gray-600 rounded-xl p-12 text-center">
            <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No reviews yet</h3>
            <p className="text-text-muted mb-6">
              Start recruiting candidates to receive feedback and build your professional reputation
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">
              Search Candidates
            </button>
          </div>
        )}

        {/* Overall Performance Metrics */}
        {stats && stats.totalReviews > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Star className="w-6 h-6 text-primary-400" />
                  </div>
                  {getTrendIcon(stats.monthlyTrend)}
                </div>
                <div>
                  <p className={`text-3xl font-bold ${getRatingColor(stats.overallRating)} mb-1`}>
                    {stats.overallRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-text-muted mb-2">Overall Rating</p>
                  <p className="text-sm font-medium text-primary-400">
                    +{stats.monthlyTrend.toFixed(1)} this month
                  </p>
                </div>
              </div>

              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary mb-1">{stats.totalReviews}</p>
                  <p className="text-sm text-text-muted mb-2">Total Reviews</p>
                  <p className="text-sm text-primary-400">
                    {Math.round((stats.positiveReviews / stats.totalReviews) * 100)}% positive
                  </p>
                </div>
              </div>

              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-400 mb-1">{stats.placementSuccess}%</p>
                  <p className="text-sm text-text-muted mb-2">Placement Success</p>
                  <p className="text-sm text-primary-400">Above industry average</p>
                </div>
              </div>

              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-400 mb-1">{stats.responseTime}h</p>
                  <p className="text-sm text-text-muted mb-2">Avg Response Time</p>
                  <p className="text-sm text-primary-400">Excellent responsiveness</p>
                </div>
              </div>
            </div>

            {/* Detailed Rating Breakdown */}
            <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-6">Rating Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <MessageSquare className="w-5 h-5 text-primary-400" />
                    <span className="font-medium text-text-primary">Communication</span>
                  </div>
                  <div className={`text-2xl font-bold ${getRatingColor(stats.avgCommunication)} mb-2`}>
                    {stats.avgCommunication.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {renderStars(stats.avgCommunication)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Award className="w-5 h-5 text-primary-400" />
                    <span className="font-medium text-text-primary">Professionalism</span>
                  </div>
                  <div className={`text-2xl font-bold ${getRatingColor(stats.avgProfessionalism)} mb-2`}>
                    {stats.avgProfessionalism.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {renderStars(stats.avgProfessionalism)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    <span className="font-medium text-text-primary">Role Accuracy</span>
                  </div>
                  <div className={`text-2xl font-bold ${getRatingColor(stats.avgRoleAccuracy)} mb-2`}>
                    {stats.avgRoleAccuracy.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {renderStars(stats.avgRoleAccuracy)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-semibold text-text-primary mb-4">Build Your Professional Reputation</h3>
            <p className="text-text-secondary mb-6 text-lg leading-relaxed">
              Start recruiting candidates through ReelHunter to receive feedback and build your professional scorecard. Transparency and accountability drive better hiring experiences for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Search Candidates
              </button>
              <button className="bg-background-card hover:bg-gray-600 text-text-primary px-6 py-3 rounded-xl font-semibold border border-gray-600 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyStatsPage