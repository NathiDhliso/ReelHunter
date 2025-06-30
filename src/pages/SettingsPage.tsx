import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

import { User, Bell, Shield, CreditCard, Users, Database, ChevronDown, Save, X, BarChart3 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    company: '',
    industry: '',
    location: '',
    timezone: '',
    currency: '',
    language: ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    verificationUpdates: true,
    interviewReminders: true,
    complianceUpdates: false,
    weeklyReports: true,
    emailDigest: true,
    pushNotifications: false,
    smsNotifications: false
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '8',
    loginAlerts: true,
    dataExportEnabled: true,
    apiAccessEnabled: false
  });

  // Team settings state
  const [teamSettings, setTeamSettings] = useState({
    teamName: 'Talent Acquisition Team',
    maxMembers: '10',
    defaultRole: 'recruiter',
    requireApproval: true,
    shareAnalytics: true
  });

  // Integration settings state
  const [integrationSettings, setIntegrationSettings] = useState({
    emailProvider: 'gmail',
    calendarSync: true,
    crmIntegration: false,
    slackNotifications: false,
    webhooksEnabled: false
  });

  // Privacy & Stats settings state
  const [privacySettings, setPrivacySettings] = useState({
    showStatsPage: true,
    allowPublicReviews: true,
    enableAIInsights: true,
    sharePerformanceData: false,
    allowCandidateRatings: true,
    publicProfileVisible: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy & Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Database className="w-5 h-5" /> }
  ];

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
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Africa/Johannesburg'
  ];

  const industries = [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Manufacturing',
    'Education',
    'Government',
    'Retail',
    'Consulting',
    'Media & Entertainment',
    'Other'
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handleSecurityChange = (setting: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handleTeamChange = (setting: string, value: string | boolean) => {
    setTeamSettings(prev => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handleIntegrationChange = (setting: string, value: string | boolean) => {
    setIntegrationSettings(prev => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-primary-500 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>Settings saved successfully!</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Job Title</label>
                  <input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-4">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Company Name</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Industry</label>
                  <div className="relative">
                    <select
                      value={profileData.industry}
                      onChange={(e) => handleProfileChange('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-4">Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
                  <div className="relative">
                    <select
                      value={profileData.timezone}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Default Currency</label>
                  <div className="relative">
                    <select
                      value={profileData.currency}
                      onChange={(e) => handleProfileChange('currency', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
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
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
                  <div className="relative">
                    <select
                      value={profileData.language}
                      onChange={(e) => handleProfileChange('language', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">New Candidate Applications</h4>
                    <p className="text-sm text-text-muted">Get notified when candidates apply to your jobs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newApplications}
                      onChange={(e) => handleNotificationChange('newApplications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Verification Updates</h4>
                    <p className="text-sm text-text-muted">Updates on verification status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.verificationUpdates}
                      onChange={(e) => handleNotificationChange('verificationUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Interview Reminders</h4>
                    <p className="text-sm text-text-muted">Receive reminders before scheduled interviews</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.interviewReminders}
                      onChange={(e) => handleNotificationChange('interviewReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Weekly Reports</h4>
                    <p className="text-sm text-text-muted">Weekly summary of your hiring activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Email Digest</h4>
                    <p className="text-sm text-text-muted">Daily digest of important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailDigest}
                      onChange={(e) => handleNotificationChange('emailDigest', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Push Notifications</h4>
                    <p className="text-sm text-text-muted">Browser push notifications for urgent updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-text-secondary">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  {securitySettings.twoFactorEnabled && (
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200">
                      Configure 2FA
                    </button>
                  )}
                </div>

                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Session Management</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Session Timeout (hours)
                      </label>
                      <div className="relative">
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                          className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="1">1 hour</option>
                          <option value="4">4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                          <option value="never">Never</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Login Alerts</h5>
                        <p className="text-sm text-text-muted">Get notified of new login attempts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.loginAlerts}
                          onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Data & Privacy</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Data Export</h5>
                        <p className="text-sm text-text-muted">Allow data export requests</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.dataExportEnabled}
                          onChange={(e) => handleSecurityChange('dataExportEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">API Access</h5>
                        <p className="text-sm text-text-muted">Enable API access for integrations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.apiAccessEnabled}
                          onChange={(e) => handleSecurityChange('apiAccessEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Privacy & Stats Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Show My Stats & Reviews Page</h4>
                    <p className="text-sm text-text-muted">Display the stats page in your navigation menu</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.showStatsPage}
                      onChange={(e) => handlePrivacyChange('showStatsPage', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Allow Public Reviews</h4>
                    <p className="text-sm text-text-muted">Let candidates leave public reviews about their experience</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowPublicReviews}
                      onChange={(e) => handlePrivacyChange('allowPublicReviews', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Enable AI Insights</h4>
                    <p className="text-sm text-text-muted">Get AI-powered performance analysis and recommendations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.enableAIInsights}
                      onChange={(e) => handlePrivacyChange('enableAIInsights', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Share Performance Data</h4>
                    <p className="text-sm text-text-muted">Contribute anonymized data to industry benchmarks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.sharePerformanceData}
                      onChange={(e) => handlePrivacyChange('sharePerformanceData', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Allow Candidate Ratings</h4>
                    <p className="text-sm text-text-muted">Enable candidates to rate their recruitment experience</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowCandidateRatings}
                      onChange={(e) => handlePrivacyChange('allowCandidateRatings', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                  <div>
                    <h4 className="font-medium text-text-primary">Public Profile Visible</h4>
                    <p className="text-sm text-text-muted">Make your recruiter profile visible in public scorecard listings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.publicProfileVisible}
                      onChange={(e) => handlePrivacyChange('publicProfileVisible', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mt-6">
                <h4 className="font-medium text-primary-400 mb-3">Privacy Information</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>• Your personal information is never shared without your explicit consent</p>
                  <p>• Performance data sharing is completely anonymized and aggregated</p>
                  <p>• You can disable any feature at any time</p>
                  <p>• All data is encrypted and stored securely</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Billing & Subscription</h3>
              <div className="bg-background-card rounded-xl border border-gray-600 p-6">
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-text-primary mb-2">No Active Subscription</h4>
                  <p className="text-text-muted mb-6">Choose a plan to unlock premium talent features</p>
                  <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Team Management</h3>
              <div className="space-y-6">
                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Team Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Team Name</label>
                      <input
                        type="text"
                        value={teamSettings.teamName}
                        onChange={(e) => handleTeamChange('teamName', e.target.value)}
                        className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Max Members</label>
                      <div className="relative">
                        <select
                          value={teamSettings.maxMembers}
                          onChange={(e) => handleTeamChange('maxMembers', e.target.value)}
                          className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="5">5 members</option>
                          <option value="10">10 members</option>
                          <option value="25">25 members</option>
                          <option value="50">50 members</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Require Approval</h5>
                        <p className="text-sm text-text-muted">New members need approval to join</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={teamSettings.requireApproval}
                          onChange={(e) => handleTeamChange('requireApproval', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Share Analytics</h5>
                        <p className="text-sm text-text-muted">Allow team members to view analytics</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={teamSettings.shareAnalytics}
                          onChange={(e) => handleTeamChange('shareAnalytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-background-card rounded-xl border border-gray-600 p-6">
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-text-primary mb-2">No Team Members</h4>
                    <p className="text-text-muted mb-6">Invite team members to collaborate on hiring</p>
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                      Invite Team Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Integrations</h3>
              <div className="space-y-6">
                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Email & Calendar</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Email Provider</label>
                      <div className="relative">
                        <select
                          value={integrationSettings.emailProvider}
                          onChange={(e) => handleIntegrationChange('emailProvider', e.target.value)}
                          className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="gmail">Gmail</option>
                          <option value="outlook">Outlook</option>
                          <option value="yahoo">Yahoo</option>
                          <option value="custom">Custom SMTP</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Calendar Sync</h5>
                        <p className="text-sm text-text-muted">Sync interviews with your calendar</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.calendarSync}
                          onChange={(e) => handleIntegrationChange('calendarSync', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-text-primary mb-4">Third-Party Services</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">CRM Integration</h5>
                        <p className="text-sm text-text-muted">Connect with Salesforce, HubSpot, etc.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.crmIntegration}
                          onChange={(e) => handleIntegrationChange('crmIntegration', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Slack Notifications</h5>
                        <p className="text-sm text-text-muted">Send updates to Slack channels</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.slackNotifications}
                          onChange={(e) => handleIntegrationChange('slackNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-text-primary">Webhooks</h5>
                        <p className="text-sm text-text-muted">Enable webhook endpoints for custom integrations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.webhooksEnabled}
                          onChange={(e) => handleIntegrationChange('webhooksEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-lg text-text-secondary">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-background-panel border border-gray-600 rounded-xl p-4">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-card'
                      }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-background-panel border border-gray-600 rounded-xl p-8">
              {renderTabContent()}

              {hasChanges && (
                <div className="flex justify-end pt-8 border-t border-gray-600 mt-8">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setHasChanges(false);
                        // Reset to original values by reloading the page
                        window.location.reload();
                      }}
                      className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;