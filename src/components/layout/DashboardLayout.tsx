import React, { useState } from 'react'
import { Search, Users, BarChart3, Settings, Menu, X, Shield, Bell, User, Briefcase, Upload, Calendar, TrendingUp } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CreateJobModal from '../modals/CreateJobModal'
import ImportCandidatesModal from '../modals/ImportCandidatesModal'
import ScheduleInterviewModal from '../modals/ScheduleInterviewModal'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const location = useLocation()

  const navigationItems = [
    { icon: Search, label: 'Search Talent', href: '/search' },
    { icon: Users, label: 'My Pipeline', href: '/pipeline' },
    { icon: TrendingUp, label: 'My Stats & Reviews', href: '/my-stats' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const quickActions = [
    {
      label: 'Create Job Posting',
      icon: Briefcase,
      onClick: () => setCreateJobModalOpen(true)
    },
    {
      label: 'Import Candidates',
      icon: Upload,
      onClick: () => setImportModalOpen(true)
    },
    {
      label: 'Schedule Interview',
      icon: Calendar,
      onClick: () => setScheduleModalOpen(true)
    }
  ]

  const isActive = (href: string) => location.pathname === href

  // Get user display name and initials
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getUserInitials = () => {
    const displayName = getUserDisplayName()
    if (displayName.includes(' ')) {
      const parts = displayName.split(' ')
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed and locked with proper text containment */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background-panel border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo - Fixed height and proper text containment */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-primary-500/10 rounded-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div className="min-w-0">
              <span className="text-xl font-bold text-text-primary block truncate">ReelHunter</span>
              <p className="text-xs text-text-muted block truncate">Global Talent</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable content with locked text */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="mt-8 px-4 flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when navigating
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group min-w-0
                      ${isActive(item.href)
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-card'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'group-hover:text-primary-400'} transition-colors duration-200`} />
                    <span className="font-medium truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick Actions with locked text */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-4 truncate">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-card rounded-lg transition-all duration-200 group min-w-0"
                  >
                    <action.icon className="w-4 h-4 flex-shrink-0 group-hover:text-primary-400 transition-colors duration-200" />
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Info with locked text */}
            <div className="mt-8 mx-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-primary-400 text-lg flex-shrink-0">🌍</span>
                <span className="text-primary-400 font-semibold text-sm truncate">Global Platform</span>
              </div>
              <p className="text-primary-300 text-xs leading-relaxed">
                Verified talent with comprehensive skill assessments and professional credentials
              </p>
            </div>
          </nav>

          {/* User section - Fixed at bottom with locked text */}
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{getUserDisplayName()}</p>
                <p className="text-xs text-text-muted truncate">Talent Acquisition Lead</p>
              </div>
              <div className="flex items-center space-x-1">
                <Link 
                  to="/settings"
                  className="text-text-muted hover:text-text-primary transition-colors duration-200 flex-shrink-0 p-1"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-text-muted hover:text-red-400 transition-colors duration-200 flex-shrink-0 p-1"
                  title="Sign Out"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with proper layout */}
      <div className="lg:pl-64">
        {/* Top navbar - Fixed and locked at the top */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-background-panel/95 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Hamburger menu for mobile - Fixed positioning */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary transition-colors duration-200 p-2 hover:bg-background-card rounded-lg flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Date display - Locked text */}
            <div className="hidden md:block min-w-0">
              <span className="text-sm text-text-muted truncate block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Right side navbar items - Fixed positioning */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Notification bell - Fixed */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background-card rounded-lg transition-all duration-200 flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></span>
            </button>
            
            {/* User info - Locked text */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-background-card rounded-lg min-w-0">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">{getUserInitials()}</span>
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:block truncate">{getUserDisplayName()}</span>
            </div>
          </div>
        </header>

        {/* Page content - With proper top padding to account for fixed navbar */}
        <main className="pt-16 p-6 min-h-screen">
          {children}
        </main>
      </div>

      {/* Modals */}
      <CreateJobModal 
        isOpen={createJobModalOpen} 
        onClose={() => setCreateJobModalOpen(false)} 
      />
      <ImportCandidatesModal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
      />
      <ScheduleInterviewModal 
        isOpen={scheduleModalOpen} 
        onClose={() => setScheduleModalOpen(false)} 
      />
    </div>
  )
}

export default DashboardLayout