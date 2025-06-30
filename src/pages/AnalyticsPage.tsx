import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, DollarSign, Target, Calendar, Filter, Download, AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface MetricCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

const AnalyticsPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData()
    }
  }, [isAuthenticated, timeRange])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement actual analytics API call
      // For now, show empty metrics
      setMetrics([
        {
          title: 'Time to Fill',
          value: '--',
          change: '--',
          trend: 'neutral',
          icon: <Clock className="w-6 h-6" />
        },
        {
          title: 'Cost per Hire',
          value: '--',
          change: '--',
          trend: 'neutral',
          icon: <DollarSign className="w-6 h-6" />
        },
        {
          title: 'Active Candidates',
          value: '--',
          change: '--',
          trend: 'neutral',
          icon: <Users className="w-6 h-6" />
        },
        {
          title: 'Hire Rate',
          value: '--',
          change: '--',
          trend: 'neutral',
          icon: <Target className="w-6 h-6" />
        }
      ])
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <div className="w-4 h-4" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-text-muted'
    }
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Authentication Required</h2>
              <p className="text-text-muted">Please log in to view your analytics dashboard.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-muted">Loading analytics...</p>
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
            <h1 className="text-4xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-text-secondary">Track your hiring performance and metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-background-panel border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-background-panel border border-gray-600 rounded-xl text-text-secondary hover:text-text-primary transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-background-panel border border-gray-600 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  {metric.icon}
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary mb-1">{metric.value}</p>
                <p className="text-sm text-text-muted mb-2">{metric.title}</p>
                <p className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hiring Funnel */}
          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Hiring Funnel</h3>
              <button className="text-text-muted hover:text-text-primary">
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No data available</p>
                <p className="text-sm text-text-muted mt-2">Start tracking candidates to see funnel metrics</p>
              </div>
            </div>
          </div>

          {/* Time to Hire Trend */}
          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Time to Hire Trend</h3>
              <button className="text-text-muted hover:text-text-primary">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No data available</p>
                <p className="text-sm text-text-muted mt-2">Complete hiring processes to see trends</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-8">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Source Performance</h4>
              <p className="text-text-muted">Track which channels bring the best candidates</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Quality Metrics</h4>
              <p className="text-text-muted">Measure candidate quality and fit scores</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Team Performance</h4>
              <p className="text-text-muted">Compare recruiter and team effectiveness</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-semibold text-text-primary mb-4">Start Tracking Your Hiring Success</h3>
            <p className="text-text-secondary mb-6 text-lg leading-relaxed">
              Begin adding candidates to your pipeline to unlock powerful analytics and insights. Track your hiring performance, identify bottlenecks, and optimize your recruitment process.
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

export default AnalyticsPage