// Pipeline component styling configuration
// Keeps all styling modular and aligned with the app's two-tone dark theme

export const PIPELINE_THEME = {
  // Main container styles
  container: 'max-w-full mx-auto space-y-6',
  
  // Header section styles
  header: {
    container: 'bg-background-panel border border-gray-600 rounded-lg shadow-lg p-6',
    title: 'text-2xl font-bold text-text-primary',
    subtitle: 'text-text-secondary mt-1',
    statsText: 'text-sm text-text-muted',
    refreshButton: 'flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors',
  },
  
  // Progress indicator styles
  progress: {
    container: 'flex items-center gap-2 overflow-x-auto pb-2',
    stageItem: 'flex items-center gap-2 flex-shrink-0',
    stageIndicator: 'flex items-center gap-2 px-3 py-2 rounded-lg border bg-background-card border-gray-600',
    stageIcon: 'w-4 h-4 text-text-muted',
    stageText: 'text-sm font-medium text-text-secondary',
    connector: 'w-6 h-px bg-gray-600',
  },
  
  // Pipeline columns styles
  columns: {
    container: 'flex gap-6 overflow-x-auto pb-6',
    column: 'flex-shrink-0 w-80 rounded-lg border bg-background-panel border-gray-600',
    header: 'p-4 border-b border-gray-600',
    title: 'font-semibold text-text-primary',
    count: 'px-2 py-1 rounded-full text-xs font-medium bg-background-card text-text-secondary border border-gray-600',
    description: 'text-xs opacity-75 text-text-muted',
  },
  
  // Candidate card styles
  candidate: {
    container: 'rounded-lg p-4 shadow-sm border transition-all duration-200 cursor-move group hover:shadow-md hover:scale-[1.02] bg-background-card border-gray-600',
    avatar: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gradient-to-br from-primary-500 to-primary-600',
    name: 'font-medium text-sm text-text-primary',
    role: 'text-xs text-text-muted',
    email: 'flex items-center gap-2 text-xs text-text-secondary',
    date: 'flex items-center gap-2 text-xs text-text-muted',
    actions: 'flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity',
    actionButton: 'flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors',
  },
  
  // Empty state styles
  empty: {
    container: 'text-center py-8',
    icon: 'w-8 h-8 mx-auto mb-2 opacity-50 text-text-muted',
    text: 'text-sm opacity-75 text-text-muted',
  },
  
  // Add button styles
  addButton: 'w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed rounded-lg transition-colors border-gray-600 text-text-secondary hover:bg-background-card/50',
  
  // Modal styles
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    container: 'bg-background-panel border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4',
    title: 'text-lg font-semibold text-text-primary mb-4',
    text: 'text-text-secondary mb-4',
    input: 'w-full px-3 py-2 bg-background-card border border-gray-600 rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500',
    confirmButton: 'flex-1 bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors',
    cancelButton: 'flex-1 bg-background-card text-text-primary py-2 px-4 rounded-md hover:bg-gray-600 border border-gray-600 transition-colors',
  },
  
  // Loading/Error states
  state: {
    container: 'max-w-7xl mx-auto',
    centerContent: 'flex items-center justify-center min-h-[400px]',
    textCenter: 'text-center',
    loadingIcon: 'w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin',
    errorIcon: 'w-16 h-16 text-red-500 mx-auto mb-4',
    title: 'text-xl font-semibold text-text-primary mb-2',
    subtitle: 'text-text-muted',
    retryButton: 'px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors',
  }
}

// Simplified stage configurations with consistent two-tone theme
export const PIPELINE_STAGE_CONFIG = {
  applied: {
    name: 'Applied',
    description: 'New applications received'
  },
  screening: {
    name: 'Screening', 
    description: 'Initial qualification review'
  },
  interview: {
    name: 'Interview',
    description: 'Interview process'
  },
  offer: {
    name: 'Offer',
    description: 'Job offer extended'
  }
}

// Action button configurations with consistent theme
export const ACTION_BUTTONS = {
  email: {
    style: 'bg-background-panel text-text-secondary hover:bg-gray-600 border border-gray-600',
    icon: 'w-3 h-3'
  },
  schedule: {
    style: 'bg-background-panel text-text-secondary hover:bg-gray-600 border border-gray-600',
    icon: 'w-3 h-3'
  },
  note: {
    style: 'bg-background-panel text-text-secondary hover:bg-gray-600 border border-gray-600',
    icon: 'w-3 h-3'
  }
}

// Utility function to get stage configuration
export function getStageConfig(stageName: string) {
  const key = stageName.toLowerCase().replace(/\s+/g, '_') as keyof typeof PIPELINE_STAGE_CONFIG
  return PIPELINE_STAGE_CONFIG[key] || PIPELINE_STAGE_CONFIG.applied
}

// Utility function to merge class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
} 