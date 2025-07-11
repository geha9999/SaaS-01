// Initialize with default values if no clinic data provided
  useEffect(() => {
    if (clinic) {
      setClinicData(prev => ({
        ...prev,
        name: clinic.name || '',
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        website: clinic.website || '',
        description: clinic.description || '',
        logo: clinic.logo || null,
        operatingHours: clinic.operatingHours || prev.operatingHours,
        services: clinic.services || [],
        specializations: clinic.specializations || [],
        facilities: clinic.facilities || []
      }));
    }
    
    if (userProfile) {
      setManagerData(prev => ({
        ...prev,
        name: userProfile.name || '',
        title: userProfile.title || 'Clinic Manager',
        phone: userProfile.phone || '',
        email: user?.email || '',
        bio: userProfile.bio || ''
      }));
    }
    
    if (clinic?.notificationSettings) {
      setNotificationSettings(clinic.notificationSettings);
    }
  }, [clinic, userProfile, user?.email]);import React, { useState, useEffect } from 'react';
import { 
  Building, Upload, Save, Edit3, Users, Phone, Mail, 
  MapPin, Globe, Camera, User, Shield, Settings,
  CreditCard, Bell, Lock, Eye, EyeOff, Trash2, Plus
} from 'lucide-react';

const ClinicSettingsPage = ({ user, db, clinic, userProfile, onClinicUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Clinic data state
  const [clinicData, setClinicData] = useState({
    name: clinic?.name || '',
    address: clinic?.address || '',
    phone: clinic?.phone || '',
    email: clinic?.email || '',
    website: clinic?.website || '',
    description: clinic?.description || '',
    logo: clinic?.logo || null,
    operatingHours: clinic?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: '09:00', close: '12:00', closed: true }
    },
    services: clinic?.services || [],
    specializations: clinic?.specializations || [],
    facilities: clinic?.facilities || []
  });

  // Manager/Owner data state
  const [managerData, setManagerData] = useState({
    name: userProfile?.name || '',
    title: userProfile?.title || 'Clinic Manager',
    phone: userProfile?.phone || '',
    email: user?.email || '',
    bio: userProfile?.bio || ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: clinic?.notificationSettings?.emailNotifications ?? true,
    smsNotifications: clinic?.notificationSettings?.smsNotifications ?? false,
    telegramNotifications: clinic?.notificationSettings?.telegramNotifications ?? true,
    appointmentReminders: clinic?.notificationSettings?.appointmentReminders ?? true,
    paymentNotifications: clinic?.notificationSettings?.paymentNotifications ?? true
  });

  // Subscription info (read-only for tenant)
  const [subscriptionInfo] = useState({
    plan: clinic?.subscription?.plan || 'Monthly',
    status: clinic?.subscription?.status || 'Active',
    expiryDate: clinic?.subscription?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    transactionCount: clinic?.subscription?.transactionCount || 0,
    storageUsed: clinic?.subscription?.storageUsed || '245 MB'
  });

  const tabs = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'manager', label: 'Manager Profile', icon: User },
    { id: 'hours', label: 'Operating Hours', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setClinicData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock implementation - replace with actual Firebase integration
      console.log('Saving clinic data:', clinicData);
      console.log('Saving manager data:', managerData);
      console.log('Saving notification settings:', notificationSettings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update clinic data with timestamp
      const updatedClinicData = {
        ...clinicData,
        notificationSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'mock-user'
      };
      
      // Update manager data with timestamp
      const updatedManagerData = {
        ...managerData,
        updatedAt: new Date().toISOString()
      };
      
      // Notify parent component with updated data
      if (onClinicUpdate) {
        onClinicUpdate({ ...clinic, ...updatedClinicData });
      }

      setIsEditing(false);
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addListItem = (field, newItem) => {
    if (newItem.trim()) {
      setClinicData(prev => ({
        ...prev,
        [field]: [...prev[field], newItem.trim()]
      }));
    }
  };

  const removeListItem = (field, index) => {
    setClinicData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const GeneralInfoTab = () => (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Clinic Logo
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {clinicData.logo ? (
              <img src={clinicData.logo} alt="Clinic Logo" className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="logo-upload"
              disabled={!isEditing}
            />
            <label
              htmlFor="logo-upload"
              className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 ${
                isEditing 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Logo
            </label>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clinic Name</label>
            <input
              type="text"
              value={clinicData.name}
              onChange={(e) => setClinicData(prev => ({...prev, name: e.target.value}))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={clinicData.email}
              onChange={(e) => setClinicData(prev => ({...prev, email: e.target.value}))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={clinicData.phone}
              onChange={(e) => setClinicData(prev => ({...prev, phone: e.target.value}))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              type="url"
              value={clinicData.website}
              onChange={(e) => setClinicData(prev => ({...prev, website: e.target.value}))}
              disabled={!isEditing}
              placeholder="https://www.example.com"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            value={clinicData.address}
            onChange={(e) => setClinicData(prev => ({...prev, address: e.target.value}))}
            disabled={!isEditing}
            rows="3"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={clinicData.description}
            onChange={(e) => setClinicData(prev => ({...prev, description: e.target.value}))}
            disabled={!isEditing}
            rows="4"
            placeholder="Brief description of your clinic and services..."
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Services & Specializations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Services & Specializations</h3>
        
        {/* Services */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Services Offered</label>
          <div className="space-y-2">
            {clinicData.services.map((service, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-blue-50 rounded-lg">{service}</span>
                {isEditing && (
                  <button
                    onClick={() => removeListItem('services', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new service..."
                  className="flex-1 p-2 border rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addListItem('services', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium mb-2">Specializations</label>
          <div className="space-y-2">
            {clinicData.specializations.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-green-50 rounded-lg">{spec}</span>
                {isEditing && (
                  <button
                    onClick={() => removeListItem('specializations', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add specialization..."
                  className="flex-1 p-2 border rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addListItem('specializations', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ManagerProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Manager/Owner Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={managerData.name}
              onChange={(e) => setManagerData(prev => ({...prev, name: e.target.value}))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title/Position</label>
            <input
              type="text"
              value={managerData.title}
              onChange={(e) => setManagerData(prev => ({...prev, title: e.target.value}))}
              disabled={!isEditing}
              placeholder="e.g., Clinic Manager, Medical Director"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={managerData.phone}
              onChange={(e) => setManagerData(prev => ({...prev, phone: e.target.value}))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={managerData.email}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed from settings</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Bio/Description</label>
          <textarea
            value={managerData.bio}
            onChange={(e) => setManagerData(prev => ({...prev, bio: e.target.value}))}
            disabled={!isEditing}
            rows="4"
            placeholder="Brief professional background and experience..."
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  const OperatingHoursTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
        <div className="space-y-4">
          {Object.entries(clinicData.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium capitalize">{day}</div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => setClinicData(prev => ({
                    ...prev,
                    operatingHours: {
                      ...prev.operatingHours,
                      [day]: { ...hours, closed: !e.target.checked }
                    }
                  }))}
                  disabled={!isEditing}
                  className="rounded"
                />
                <span className="text-sm">Open</span>
              </label>
              {!hours.closed && (
                <>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => setClinicData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        [day]: { ...hours, open: e.target.value }
                      }
                    }))}
                    disabled={!isEditing}
                    className="px-2 py-1 border rounded disabled:bg-gray-50"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setClinicData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        [day]: { ...hours, close: e.target.value }
                      }
                    }))}
                    disabled={!isEditing}
                    className="px-2 py-1 border rounded disabled:bg-gray-50"
                  />
                </>
              )}
              {hours.closed && (
                <span className="text-sm text-gray-500 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive updates via email'}
                  {key === 'smsNotifications' && 'Receive SMS notifications'}
                  {key === 'telegramNotifications' && 'Receive Telegram messages'}
                  {key === 'appointmentReminders' && 'Get reminded about appointments'}
                  {key === 'paymentNotifications' && 'Get notified about payments'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Current Plan</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{subscriptionInfo.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  subscriptionInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {subscriptionInfo.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {subscriptionInfo.expiryDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Usage Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-medium">{subscriptionInfo.transactionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Used:</span>
                <span className="font-medium">{subscriptionInfo.storageUsed}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 Need to upgrade or change your plan? Contact support or check the admin panel for subscription management.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralInfoTab />;
      case 'manager': return <ManagerProfileTab />;
      case 'hours': return <OperatingHoursTab />;
      case 'notifications': return <NotificationsTab />;
      case 'subscription': return <SubscriptionTab />;
      default: return <GeneralInfoTab />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinic Settings</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Settings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ClinicSettingsPage;
