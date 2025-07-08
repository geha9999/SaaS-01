import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, Globe, DollarSign, Database, FileText, Mail, 
  BarChart3, TrendingUp, Shield, Edit3, Save, X, Plus, Trash2,
  Building, Calendar, CreditCard, Eye, Search, Filter, Download,
  AlertTriangle, CheckCircle, Clock, Ban, Activity
} from 'lucide-react';

// Mock data - in real app, this would come from Firebase
const MOCK_ADMIN_DATA = {
  systemStats: {
    totalTenants: 1247,
    activeTenants: 1156,
    pendingPayments: 91,
    monthlyRevenue: 18705, // USD
    totalRevenue: 234560,
    transactionFees: 2847,
    storageUsed: "2.3TB",
    storageLimit: "10TB"
  },
  recentTenants: [
    { id: 1, clinicName: "Jakarta Medical Center", email: "admin@jmc.com", status: "active", plan: "annual", joined: "2025-01-08", lastActive: "2025-01-08" },
    { id: 2, clinicName: "Bali Health Clinic", email: "dr.smith@bali.com", status: "trial", plan: "monthly", joined: "2025-01-07", lastActive: "2025-01-07" },
    { id: 3, clinicName: "Surabaya Dental", email: "info@surbaya-dental.com", status: "pending_payment", plan: "monthly", joined: "2025-01-06", lastActive: "2025-01-06" },
    { id: 4, clinicName: "Clinic Sehat", email: "contact@sehat.co.id", status: "active", plan: "annual", joined: "2025-01-05", lastActive: "2025-01-08" },
    { id: 5, clinicName: "Wellness Center Bandung", email: "admin@wellness-bdg.com", status: "suspended", plan: "monthly", joined: "2025-01-04", lastActive: "2025-01-03" }
  ]
};

// Admin Panel Main Component
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminData, setAdminData] = useState(MOCK_ADMIN_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tenants', label: 'Tenant Management', icon: Users },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'pricing', label: 'Pricing & Billing', icon: DollarSign },
    { id: 'languages', label: 'Language Management', icon: Globe },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  // Dashboard Component
  const Dashboard = () => {
    const { systemStats } = adminData;
    
    const statCards = [
      { 
        title: 'Total Tenants', 
        value: systemStats.totalTenants.toLocaleString(), 
        change: '+12%', 
        trend: 'up',
        icon: Users,
        color: 'blue'
      },
      { 
        title: 'Active Tenants', 
        value: systemStats.activeTenants.toLocaleString(), 
        change: '+8%', 
        trend: 'up',
        icon: CheckCircle,
        color: 'green'
      },
      { 
        title: 'Monthly Revenue', 
        value: `$${systemStats.monthlyRevenue.toLocaleString()}`, 
        change: '+15%', 
        trend: 'up',
        icon: DollarSign,
        color: 'purple'
      },
      { 
        title: 'Storage Used', 
        value: systemStats.storageUsed, 
        change: `of ${systemStats.storageLimit}`, 
        trend: 'neutral',
        icon: Database,
        color: 'orange'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">CLINICQ Admin Dashboard</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium">Add New Tenant</p>
              <p className="text-sm text-gray-500">Manually create clinic account</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <FileText className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium">Update Terms</p>
              <p className="text-sm text-gray-500">Modify legal documents</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium">Adjust Pricing</p>
              <p className="text-sm text-gray-500">Update subscription plans</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Tenant Activity</h3>
          <div className="space-y-3">
            {adminData.recentTenants.slice(0, 5).map(tenant => (
              <div key={tenant.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tenant.status === 'active' ? 'bg-green-500' : 
                    tenant.status === 'trial' ? 'bg-yellow-500' : 
                    tenant.status === 'pending_payment' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{tenant.clinicName}</p>
                    <p className="text-sm text-gray-500">{tenant.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize font-medium">{tenant.status.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">Last active: {tenant.lastActive}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Tenant Management Component
  const TenantManagement = () => {
    const filteredTenants = adminData.recentTenants.filter(tenant => {
      const matchesSearch = tenant.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
      const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
        trial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Trial' },
        pending_payment: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending Payment' },
        suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' }
      };
      const config = statusConfig[status] || statusConfig.active;
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tenant Management</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} />
            Add Tenant
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tenants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.clinicName}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {tenant.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.joined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Ban size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Content Management Component
  const ContentManagement = () => {
    const [editingContent, setEditingContent] = useState(null);
    const [contentData, setContentData] = useState({
      terms_en: "Terms and Conditions in English...",
      terms_id: "Syarat dan Ketentuan dalam Bahasa Indonesia...",
      privacy_en: "Privacy Policy in English...",
      privacy_id: "Kebijakan Privasi dalam Bahasa Indonesia...",
      email_verification_en: "Email verification template in English...",
      email_verification_id: "Template verifikasi email dalam Bahasa Indonesia..."
    });

    const contentItems = [
      { id: 'terms_en', title: 'Terms & Conditions (English)', icon: FileText },
      { id: 'terms_id', title: 'Syarat & Ketentuan (Bahasa)', icon: FileText },
      { id: 'privacy_en', title: 'Privacy Policy (English)', icon: Shield },
      { id: 'privacy_id', title: 'Kebijakan Privasi (Bahasa)', icon: Shield },
      { id: 'email_verification_en', title: 'Email Template (English)', icon: Mail },
      { id: 'email_verification_id', title: 'Template Email (Bahasa)', icon: Mail }
    ];

    const handleSaveContent = (contentId, newContent) => {
      setContentData(prev => ({
        ...prev,
        [contentId]: newContent
      }));
      setEditingContent(null);
      // Here you would save to Firebase
      console.log('Saving content:', contentId, newContent);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
          <div className="text-sm text-gray-500">
            Last updated: January 8, 2025
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contentItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <button
                  onClick={() => setEditingContent(item.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              </div>
              
              {editingContent === item.id ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={contentData[item.id]}
                    onChange={(e) => setContentData(prev => ({
                      ...prev,
                      [item.id]: e.target.value
                    }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveContent(item.id, contentData[item.id])}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingContent(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {contentData[item.id].substring(0, 150)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Preview */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">English Version</h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                How users see the content in English...
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Bahasa Indonesia</h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                Bagaimana pengguna melihat konten dalam Bahasa Indonesia...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pricing Management Component
  const PricingManagement = () => {
    const [pricingConfig, setPricingConfig] = useState({
      monthly_usd: 15,
      annual_usd: 150,
      transaction_fee_usd: 0.10,
      transaction_fee_idr: 2000,
      storage_basic_gb: 5,
      storage_premium_gb: 50,
      storage_enterprise_gb: 200
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleSavePricing = () => {
      // Save to Firebase
      console.log('Saving pricing config:', pricingConfig);
      setIsEditing(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Pricing & Billing Management</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit3 size={16} />
            {isEditing ? 'Cancel' : 'Edit Pricing'}
          </button>
        </div>

        {/* Current Pricing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Monthly Plan</h3>
            <p className="text-3xl font-bold text-blue-600">${pricingConfig.monthly_usd}</p>
            <p className="text-sm text-gray-500">Per month in USDT</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-2">Annual Plan</h3>
            <p className="text-3xl font-bold text-green-600">${pricingConfig.annual_usd}</p>
            <p className="text-sm text-gray-500">Per year in USDT (17% discount)</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold mb-2">Transaction Fee</h3>
            <p className="text-2xl font-bold text-orange-600">
              ${pricingConfig.transaction_fee_usd} / Rp{pricingConfig.transaction_fee_idr}
            </p>
            <p className="text-sm text-gray-500">Per patient payment</p>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Pricing Configuration</h3>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Plan (USD)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.monthly_usd}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      monthly_usd: parseFloat(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Plan (USD)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.annual_usd}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      annual_usd: parseFloat(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.transaction_fee_usd}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      transaction_fee_usd: parseFloat(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Fee (IDR)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.transaction_fee_idr}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      transaction_fee_idr: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSavePricing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Plan:</span>
                  <span className="font-semibold">${pricingConfig.monthly_usd} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Plan:</span>
                  <span className="font-semibold">${pricingConfig.annual_usd} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Discount:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((1 - pricingConfig.annual_usd / (pricingConfig.monthly_usd * 12)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee USD:</span>
                  <span className="font-semibold">${pricingConfig.transaction_fee_usd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee IDR:</span>
                  <span className="font-semibold">Rp{pricingConfig.transaction_fee_idr}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">$18,705</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">$234,560</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">$2,847</p>
              <p className="text-sm text-gray-500">Transaction Fees</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // System Settings Component
  const SystemSettings = () => {
    const [systemConfig, setSystemConfig] = useState({
      maintenance_mode: false,
      new_registrations: true,
      email_notifications: true,
      max_storage_per_tenant: 10, // GB
      backup_frequency: 'daily',
      session_timeout: 24 // hours
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Temporarily disable all tenant access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.maintenance_mode}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      maintenance_mode: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Registrations</p>
                  <p className="text-sm text-gray-500">Allow new clinic registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.new_registrations}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      new_registrations: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">System-wide email notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.email_notifications}
                    onChange={(e) => setSystemConfig(prev => ({
                      ...prev,
                      email_notifications: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Storage & Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Storage & Performance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Storage per Tenant (GB)
                </label>
                <input
                  type="number"
                  value={systemConfig.max_storage_per_tenant}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    max_storage_per_tenant: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={systemConfig.backup_frequency}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    backup_frequency: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={systemConfig.session_timeout}
                  onChange={(e) => setSystemConfig(prev => ({
                    ...prev,
                    session_timeout: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Storage</p>
              <p className="text-xs text-green-600">Healthy</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Email Service</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Payment Gateway</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Save size={16} />
            Save System Settings
          </button>
        </div>
      </div>
    );
  };

  // Main Render
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tenants': return <TenantManagement />;
      case 'content': return <ContentManagement />;
      case 'pricing': return <PricingManagement />;
      case 'system': return <SystemSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">CLINICQ</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="text-xs text-gray-500">
            <p>ALTEAWORLD.IO</p>
            <p>System Administrator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
