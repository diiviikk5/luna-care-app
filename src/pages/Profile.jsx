import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Heart, 
  Settings, 
  Bell,
  Shield,
  Download,
  Trash2,
  Edit,
  Save,
  Camera,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Database,
  BarChart,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOutUser } from '../lib/firebase'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Input from '../components/ui/Input'

const Profile = () => {
  const { currentUser, userProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    age: 25,
    height: 165,
    weight: 60,
    averageCycleLength: 28,
    lastPeriodDate: '2024-08-14',
    location: 'New York, NY',
    joinedDate: currentUser?.metadata?.creationTime || new Date()
  })

  const [preferences, setPreferences] = useState({
    notifications: true,
    reminderDays: 3,
    dataPrivacy: 'private',
    cycleInsights: true,
    communityUpdates: false,
    tips: true,
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    pcosAlerts: true
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    dataExport: false,
    accountDeletion: false
  })

  const handleSave = async () => {
    try {
      // Here you would update Firebase
      console.log('Saving profile:', profileData, preferences)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile: profileData,
      cycles: [], // Would fetch from Firebase
      symptoms: [],
      preferences: preferences
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'luna-care-data.json'
    a.click()
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Would handle account deletion
      console.log('Account deletion requested')
    }
  }

  const firstName = currentUser?.displayName?.split(' ')[0] || 'User'

  const stats = [
    { label: 'Cycles Tracked', value: '12', icon: Calendar, color: 'from-luna-400 to-luna-600' },
    { label: 'Days Logged', value: '89', icon: Heart, color: 'from-green-400 to-green-600' },
    { label: 'Health Score', value: '85%', icon: BarChart, color: 'from-blue-400 to-blue-600' },
    { label: 'Login Streak', value: '12d', icon: User, color: 'from-purple-400 to-purple-600' }
  ]

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'data', label: 'Data & Export', icon: Database }
  ]

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              <Button
                variant={isEditing ? "primary" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                icon={isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                disabled={!isEditing}
              />
              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                disabled={true}
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Age"
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                disabled={!isEditing}
              />
              <Input
                label="Location"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                disabled={!isEditing}
              />
            </div>

            <div className="bg-luna-50 p-6 rounded-2xl">
              <h4 className="font-medium text-gray-800 mb-4">Health Profile</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                  disabled={!isEditing}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                  disabled={!isEditing}
                />
                <Input
                  label="Average Cycle Length (days)"
                  type="number"
                  value={profileData.averageCycleLength}
                  onChange={(e) => setProfileData({...profileData, averageCycleLength: e.target.value})}
                  disabled={!isEditing}
                />
                <Input
                  label="Last Period Start Date"
                  type="date"
                  value={profileData.lastPeriodDate}
                  onChange={(e) => setProfileData({...profileData, lastPeriodDate: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">App Preferences</h3>
            
            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <Bell className="h-4 w-4 mr-2 text-luna-500" />
                Notification Settings
              </h4>
              <div className="space-y-4">
                {[
                  { key: 'notifications', label: 'App Notifications', desc: 'General app notifications' },
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Mobile push notifications' },
                  { key: 'cycleInsights', label: 'Cycle Insights', desc: 'Daily cycle-related insights' },
                  { key: 'pcosAlerts', label: 'PCOS Risk Alerts', desc: 'Important health alerts  '},
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly health summaries' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-800">{setting.label}</label>
                      <p className="text-sm text-gray-600">{setting.desc}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[setting.key] ? 'luna-gradient' : 'bg-gray-200'
                      }`}
                      onClick={() => setPreferences({...preferences, [setting.key]: !preferences[setting.key]})}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">Reminder Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Reminder (days before)
                  </label>
                  <select
                    className="luna-input w-full"
                    value={preferences.reminderDays}
                    onChange={(e) => setPreferences({...preferences, reminderDays: e.target.value})}
                  >
                    <option value={1}>1 day</option>
                    <option value={2}>2 days</option>
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>1 week</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                {preferences.darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                Appearance
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-800">Dark Mode</label>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.darkMode ? 'luna-gradient' : 'bg-gray-200'
                  }`}
                  onClick={() => setPreferences({...preferences, darkMode: !preferences.darkMode})}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Security & Privacy</h3>
            
            {/* Password & Authentication */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-green-500" />
                Password & Authentication
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-800">Two-Factor Authentication</label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {securitySettings.twoFactorAuth ? 'Disable' : 'Enable'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-800">Change Password</label>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-800">Login Notifications</label>
                    <p className="text-sm text-gray-600">Get notified of new logins</p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.loginNotifications ? 'luna-gradient' : 'bg-gray-200'
                    }`}
                    onClick={() => setSecuritySettings({...securitySettings, loginNotifications: !securitySettings.loginNotifications})}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">Privacy Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Privacy Level
                  </label>
                  <select
                    className="luna-input w-full"
                    value={preferences.dataPrivacy}
                    onChange={(e) => setPreferences({...preferences, dataPrivacy: e.target.value})}
                  >
                    <option value="public">Public - Share anonymized insights</option>
                    <option value="community">Community - Share with Luna Care community</option>
                    <option value="private">Private - Keep all data personal</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Controls how your health data is used for research and community features
                  </p>
                </div>
              </div>
            </div>

            {/* Connected Devices */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <Smartphone className="h-4 w-4 mr-2 text-blue-500" />
                Connected Devices
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">iPhone 13</p>
                      <p className="text-sm text-gray-600">Last active: Now</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Data Management</h3>
            
            {/* Data Export */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <Download className="h-4 w-4 mr-2 text-green-500" />
                Export Your Data
              </h4>
              <p className="text-gray-600 mb-4">
                Download a copy of all your Luna Care data including cycles, symptoms, and insights.
              </p>
              <Button onClick={handleExportData} icon={<Download className="h-4 w-4" />}>
                Export Data (JSON)
              </Button>
            </div>

            {/* Storage Usage */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">Storage Usage</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cycle Data</span>
                  <span className="font-medium">2.4 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Symptom Logs</span>
                  <span className="font-medium">1.8 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Images & Photos</span>
                  <span className="font-medium">0 MB</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-medium">
                  <span className="text-gray-800">Total Usage</span>
                  <span className="text-luna-600">4.2 MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="luna-gradient h-2 rounded-full" style={{width: '8.4%'}}></div>
                </div>
                <p className="text-xs text-gray-500">8.4% of 50 MB free storage used</p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
              <h4 className="font-medium text-red-800 mb-4 flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Danger Zone
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-red-700 mb-2">Delete Account</p>
                  <p className="text-sm text-red-600 mb-4">
                    Permanently delete your Luna Care account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={handleDeleteAccount}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 luna-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {firstName.charAt(0)}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-3 w-3 text-gray-600" />
                  </motion.button>
                </div>
                
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {currentUser?.displayName || 'Luna Care User'}
                </h2>
                <p className="text-sm text-gray-600 mb-4">{currentUser?.email}</p>
                
                <div className="bg-luna-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-luna-700">
                    Member since {new Date(profileData.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                    >
                      <div className={`inline-block p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white mb-2`}>
                        <stat.icon className="h-3 w-3" />
                      </div>
                      <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleSignOut}
              icon={<LogOut className="h-4 w-4" />}
            >
              Sign Out
            </Button>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'luna-gradient text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-luna-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="min-h-[500px]">
              <CardContent className="p-6">
                {renderTabContent()}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile
