# ReelHunter - AI-Powered Recruitment Platform

Intelligent recruitment platform with advanced candidate matching, pipeline management, and hiring analytics.

## 🌟 Features

### 🎯 Smart Candidate Matching
- **AI-Powered Search** - Machine learning algorithms for candidate discovery
- **Skill-Based Matching** - Advanced matching using verified skills from ReelSkills
- **Cultural Fit Analysis** - Personality and team compatibility assessment
- **Location Intelligence** - Geographic matching and remote work preferences
- **Salary Benchmarking** - Market-rate salary recommendations

### 📊 Recruitment Pipeline
- **Visual Pipeline Management** - Drag-and-drop candidate workflow
- **Customizable Stages** - Tailor pipeline stages to your hiring process
- **Automated Workflows** - Trigger actions based on stage changes
- **Bulk Operations** - Move multiple candidates through stages efficiently
- **Pipeline Analytics** - Track conversion rates and bottlenecks

### 🤖 Interview Automation
- **AI Interview Scheduling** - Automated calendar integration and booking
- **Video Interview Platform** - Built-in video conferencing capabilities
- **Interview Question Bank** - Role-specific question templates
- **Automated Scoring** - AI-powered interview performance evaluation
- **Interview Analytics** - Performance metrics and insights

### 📈 Recruitment Analytics
- **Hiring Metrics Dashboard** - Time-to-hire, cost-per-hire, quality metrics
- **Source Performance** - Track effectiveness of recruitment channels
- **Team Performance** - Individual and team recruitment statistics
- **Predictive Analytics** - Forecast hiring needs and success rates
- **Custom Reports** - Generate detailed recruitment reports

### 💼 Job Management
- **Job Posting Creation** - Rich job description editor with templates
- **Multi-Platform Publishing** - Post to multiple job boards simultaneously
- **Application Tracking** - Centralized application management
- **Job Performance Analytics** - Track job posting effectiveness
- **Employer Branding** - Customize job posts with company branding

## 🎯 Target Users

### 🎯 Recruiters
- **Internal Recruiters** - Full-time talent acquisition professionals
- **Recruitment Agencies** - External recruitment service providers
- **HR Managers** - Human resources professionals handling recruitment
- **Hiring Managers** - Department heads involved in hiring decisions
- **Talent Scouts** - Specialized talent identification professionals

### 👑 Recruitment Teams
- **Team Collaboration** - Shared candidate pools and collaborative hiring
- **Role-Based Access** - Different permission levels for team members
- **Communication Tools** - Internal messaging and candidate discussion
- **Workflow Management** - Standardized processes across team members
- **Performance Tracking** - Individual and team performance metrics

## 🏗️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Supabase Auth + SSO
- **Database**: PostgreSQL (Supabase)
- **AI/ML**: OpenAI GPT-4, Custom matching algorithms
- **Real-time**: Supabase Realtime for live updates
- **Video**: WebRTC for video interviews
- **Email**: Automated email workflows
- **Deployment**: AWS Amplify

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- OpenAI API access
- Email service provider (SendGrid/AWS SES)

### Installation
```bash
git clone https://github.com/your-org/reelhunter-reelapps.git
cd reelhunter-reelapps
npm install
```

### Environment Setup
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOME_URL=https://www.reelapps.co.za
VITE_APP_URL=https://reelhunter.reelapps.co.za
VITE_SSO_ENABLED=true
VITE_MAIN_DOMAIN=reelapps.co.za
VITE_OPENAI_API_KEY=your_openai_key
VITE_SENDGRID_API_KEY=your_sendgrid_key
```

### Development
```bash
npm run dev
# App runs on http://localhost:5177
```

## 📋 Core Modules

### Candidate Discovery
- **Advanced Search Filters** - Skills, experience, location, availability
- **Boolean Search** - Complex search queries with operators
- **Saved Searches** - Store and rerun frequent searches
- **Search Alerts** - Notifications for new matching candidates
- **Candidate Recommendations** - AI-suggested candidates for roles

### Pipeline Management
- **Drag-and-Drop Interface** - Visual candidate movement through stages
- **Stage Customization** - Create custom pipeline stages
- **Automated Actions** - Trigger emails, tasks, or notifications
- **Bulk Operations** - Move multiple candidates simultaneously
- **Pipeline Templates** - Pre-configured pipelines for different roles

### Interview Management
- **Scheduling Integration** - Calendar sync with Google/Outlook
- **Interview Panels** - Multi-interviewer coordination
- **Question Banks** - Role-specific interview questions
- **Scoring Rubrics** - Standardized evaluation criteria
- **Interview Feedback** - Structured feedback collection

### Communication Hub
- **Email Templates** - Customizable email communications
- **SMS Integration** - Text message notifications
- **In-App Messaging** - Direct candidate communication
- **Automated Sequences** - Multi-touch communication workflows
- **Communication History** - Complete interaction timeline

### Reporting & Analytics
- **Real-Time Dashboards** - Live recruitment metrics
- **Custom Reports** - Build reports with drag-and-drop interface
- **Data Export** - CSV, Excel, PDF export capabilities
- **Scheduled Reports** - Automated report delivery
- **Benchmark Comparisons** - Industry standard comparisons

## 🔍 Advanced Features

### AI-Powered Matching
- **Semantic Search** - Natural language job requirements matching
- **Skill Inference** - Identify transferable skills and experience
- **Culture Matching** - Personality and company culture alignment
- **Success Prediction** - Likelihood of candidate success in role
- **Diversity Analytics** - Track and improve diversity hiring

### Automation Workflows
- **Trigger-Based Actions** - Automate routine recruitment tasks
- **Conditional Logic** - Complex workflow rules and conditions
- **Integration Triggers** - Actions based on external system events
- **Approval Workflows** - Multi-step approval processes
- **Escalation Rules** - Automatic escalation for stalled processes

### Collaboration Tools
- **Team Workspaces** - Shared candidate pools and job requisitions
- **Role-Based Permissions** - Granular access control
- **Activity Feeds** - Real-time team activity updates
- **Candidate Notes** - Shared notes and evaluations
- **Decision Tracking** - Hiring decision audit trail

### Integration Ecosystem
- **ATS Integration** - Connect with existing applicant tracking systems
- **Job Board APIs** - Indeed, LinkedIn, Glassdoor integration
- **HRIS Systems** - HR information system connectivity
- **Calendar Systems** - Google Calendar, Outlook integration
- **Communication Tools** - Slack, Microsoft Teams integration

## 📊 Analytics & Reporting

### Recruitment Metrics
- **Time-to-Fill** - Average time to fill positions
- **Cost-per-Hire** - Total recruitment costs per successful hire
- **Source Effectiveness** - Performance of different recruitment channels
- **Conversion Rates** - Stage-to-stage conversion analytics
- **Quality of Hire** - Long-term success metrics of placed candidates

### Performance Dashboards
- **Individual Performance** - Recruiter-specific metrics and goals
- **Team Performance** - Department and team-level analytics
- **Pipeline Health** - Pipeline velocity and bottleneck identification
- **Candidate Experience** - Feedback and satisfaction metrics
- **Predictive Analytics** - Forecasting and trend analysis

### Custom Reporting
- **Report Builder** - Drag-and-drop report creation
- **Scheduled Delivery** - Automated report distribution
- **Data Visualization** - Charts, graphs, and visual analytics
- **Export Options** - Multiple format export capabilities
- **Historical Trending** - Long-term trend analysis and insights

## 🔐 Security & Compliance

- **GDPR Compliance** - European data protection regulation compliance
- **POPIA Compliance** - South African data protection compliance
- **SOC 2 Type II** - Security and availability controls
- **Data Encryption** - End-to-end encryption for sensitive data
- **Audit Logging** - Complete audit trail of all system activities
- **Role-Based Access** - Granular permission management
- **Two-Factor Authentication** - Enhanced security for user accounts

## 🌍 Global Features

- **Multi-Language Support** - Interface in multiple languages
- **Currency Localization** - Local currency for salary information
- **Time Zone Management** - Global time zone support for scheduling
- **Regional Compliance** - Local employment law compliance features
- **Cultural Customization** - Region-specific hiring practices support

## 📱 Mobile Experience

- **Responsive Design** - Optimized for all device sizes
- **Mobile App** - Native iOS and Android applications
- **Offline Capability** - Core functionality without internet
- **Push Notifications** - Real-time mobile notifications
- **Mobile Interview** - Conduct interviews on mobile devices

## 🔗 Integrations

- **ReelCV** - Access verified candidate profiles and portfolios
- **ReelSkills** - Skills verification and assessment integration
- **ReelPersona** - Personality assessment and cultural fit analysis
- **LinkedIn Recruiter** - Import candidates and job postings
- **Google Workspace** - Calendar, email, and document integration
- **Microsoft 365** - Office suite and Teams integration
- **Slack** - Team communication and notifications
- **Zapier** - Connect with 1000+ third-party applications 