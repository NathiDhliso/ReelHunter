import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import RecruiterScorecard from '../components/scorecards/RecruiterScorecard'

const ScorecardsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <RecruiterScorecard />
      </div>
    </DashboardLayout>
  )
}

export default ScorecardsPage