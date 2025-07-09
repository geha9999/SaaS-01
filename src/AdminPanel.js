import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, Globe, DollarSign, Database, FileText, Mail, 
  BarChart3, TrendingUp, Shield, Edit3, Save, X, Plus, Trash2,
  Building, Calendar, CreditCard, Eye, Search, Filter, Download,
  AlertTriangle, CheckCircle, Clock, Ban, Activity, LogOut
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  setDoc,
  addDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import NOWPaymentsService from './services/nowPayments';  // ← ADD THIS LINE

// Admin Panel Main Component
const AdminPanel = ({ user, auth, db }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Real data states
  const [systemStats, setSystemStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    transactionFees: 0,
    storageUsed: "0GB",
    storageLimit: "10TB"
  });
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Firebase
  useEffect(() => {
    if (!db) return;

    const unsubscribers = [];

    // Listen to all clinics
    const clinicsQuery = query(collection(db, "clinics"), orderBy("createdAt", "desc"));
    unsubscribers.push(onSnapshot(clinicsQuery, (snapshot) => {
      const clinicsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastActive: doc.data().lastActive?.toDate()
      }));
      setTenants(clinicsData);
    }));

    // Listen to all users
    const usersQuery = query(collection(db, "users"));
    unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAllUsers(usersData);
    }));

    // Calculate system stats
    const updateStats = () => {
      const activeTenants = tenants.filter(t => t.status === 'active' || t.status === 'onboarding_completed').length;
      const pendingPayments = tenants.filter(t => t.status === 'pending_payment').length;
      
      setSystemStats(prev => ({
        ...prev,
        totalTenants: tenants.length,
        activeTenants: activeTenants,
        pendingPayments: pendingPayments,
        monthlyRevenue: Math.floor(activeTenants * 15), // $15 per active tenant
        totalRevenue: Math.floor(tenants.length * 15 * 6), // Estimated
        transactionFees: Math.floor(activeTenants * 2.5) // Estimated
      }));
    };

    updateStats();
    setLoading(false);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [db, tenants.length]);

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

  const handleLogout = () => signOut(auth);

  // Dashboard Component
  const Dashboard = () => {
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

// TEST FUNCTION - we'll remove this later
const testPaymentConnection = async () => {
    try {
        alert('Testing available currencies... please wait');
        console.log('=== CHECKING AVAILABLE CURRENCIES ===');
        
        const currencies = await NOWPaymentsService.getAvailableCurrencies();
        
        console.log('Available currencies response:', currencies);
        
        if (currencies.currencies) {
            console.log('✅ Available payment currencies:', currencies.currencies);
            
            // Check if USDT is available
            const hasUSDT = currencies.currencies.includes('usdt');
            const hasBTC = currencies.currencies.includes('btc');
            const hasETH = currencies.currencies.includes('eth');
            
            console.log('USDT available:', hasUSDT);
            console.log('BTC available:', hasBTC);
            console.log('ETH available:', hasETH);
            
            alert(`✅ Found ${currencies.currencies.length} currencies. USDT available: ${hasUSDT}`);
        } else {
            console.log('❌ No currencies in response');
            alert('❌ Could not get currency list');
        }
        
    } catch (error) {
        alert('❌ ERROR: Could not check currencies');
        console.error('Currency check error:', error);
    }
};
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
    <button 
        onClick={testPaymentConnection}
        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
    >
        <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
        <p className="font-medium">Test Payments</p>
        <p className="text-sm text-gray-500">Check NOWPayments connection</p>
    </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium">Manage Tenants</p>
              <p className="text-sm text-gray-500">View and manage clinic accounts</p>
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <FileText className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium">Update Terms</p>
              <p className="text-sm text-gray-500">Modify legal documents</p>
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
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
            {tenants.slice(0, 5).map(tenant => (
              <div key={tenant.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tenant.status === 'active' || tenant.status === 'onboarding_completed' ? 'bg-green-500' : 
                    tenant.status === 'pending_verification' ? 'bg-yellow-500' : 
                    tenant.status === 'pending_payment' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.ownerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize font-medium">{tenant.status?.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">
                    Created: {tenant.createdAt?.toLocaleDateString() || 'N/A'}
                  </p>
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
    const filteredTenants = tenants.filter(tenant => {
      const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tenant.ownerId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
      const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
        onboarding_completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
        pending_verification: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Verification' },
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

    const suspendTenant = async (tenantId) => {
      if (window.confirm('Are you sure you want to suspend this tenant?')) {
        try {
          await setDoc(doc(db, "clinics", tenantId), { 
            status: 'suspended',
            suspendedAt: serverTimestamp()
          }, { merge: true });
          alert('Tenant suspended successfully');
        } catch (error) {
          console.error('Error suspending tenant:', error);
          alert('Error suspending tenant');
        }
      }
    };

    const activateTenant = async (tenantId) => {
      try {
        await setDoc(doc(db, "clinics", tenantId), { 
          status: 'active',
          activatedAt: serverTimestamp()
        }, { merge: true });
        alert('Tenant activated successfully');
      } catch (error) {
        console.error('Error activating tenant:', error);
        alert('Error activating tenant');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tenant Management</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} />
            Manual Add Tenant
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
              <option value="onboarding_completed">Onboarding Completed</option>
              <option value="pending_verification">Pending Verification</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.createdAt?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.ownerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 size={16} />
                      </button>
                      {tenant.status === 'suspended' ? (
                        <button 
                          onClick={() => activateTenant(tenant.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => suspendTenant(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Ban size={16} />
                        </button>
                      )}
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
      terms_en: "# Terms and Conditions\n\nBy using CLINICQ, you agree to these terms...",
      terms_id: "# Syarat dan Ketentuan\n\nDengan menggunakan CLINICQ, Anda menyetujui syarat-syarat berikut...",
      privacy_en: "# Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data...",
      privacy_id: "# Kebijakan Privasi\n\nKami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda...",
      email_verification_en: "Welcome to CLINICQ! Please verify your email address...",
      email_verification_id: "Selamat datang di CLINICQ! Silakan verifikasi alamat email Anda..."
    });

    const contentItems = [
      { id: 'terms_en', title: 'Terms & Conditions (English)', icon: FileText },
      { id: 'terms_id', title: 'Syarat & Ketentuan (Bahasa)', icon: FileText },
      { id: 'privacy_en', title: 'Privacy Policy (English)', icon: Shield },
      { id: 'privacy_id', title: 'Kebijakan Privasi (Bahasa)', icon: Shield },
      { id: 'email_verification_en', title: 'Email Template (English)', icon: Mail },
      { id: 'email_verification_id', title: 'Template Email (Bahasa)', icon: Mail }
    ];

    const handleSaveContent = async (contentId, newContent) => {
      try {
        await setDoc(doc(db, "system_content", contentId), {
          content: newContent,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
        
        setContentData(prev => ({
          ...prev,
          [contentId]: newContent
        }));
        setEditingContent(null);
        alert('Content updated successfully!');
      } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
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
      </div>
    );
  };

  // Pricing Management Component
// Enhanced Pricing Management Component with NOWPayments Integration
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

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

// Enhanced debugging version of payment creation function
const handleCreateSubscriptionPayment = async (clinicId, clinicName, plan) => {
  setIsCreatingPayment(true);
  
  try {
    // Determine amount based on plan
    const amount = plan === 'monthly' ? pricingConfig.monthly_usd : pricingConfig.annual_usd;
    const orderId = `${clinicId}_${plan}_${Date.now()}`;
    
    console.log('=== PAYMENT CREATION DEBUG ===');
    console.log('Creating payment for:', { clinicId, clinicName, plan, amount });
    console.log('Order ID:', orderId);
    console.log('API Key exists:', !!NOWPaymentsService.apiKey);
    console.log('API Key first 10 chars:', NOWPaymentsService.apiKey?.substring(0, 10) + '...');
    
    // Create payment with NOWPayments
    const paymentData = {
      price_amount: amount,
      price_currency: 'USD',
      pay_currency: 'usdterc20',
      order_id: orderId,
      order_description: `CLINICQ ${plan} subscription for ${clinicName}`,
      ipn_callback_url: `${window.location.origin}/api/payment-webhook`,
      success_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-cancel`
    };
    
    console.log('Payment data being sent:', paymentData);
    
    const payment = await NOWPaymentsService.createPayment(paymentData);
    
    console.log('=== PAYMENT RESPONSE ===');
    console.log('Full response:', payment);
    console.log('Payment URL:', payment.payment_url);
    console.log('Payment ID:', payment.payment_id);
    console.log('Payment Status:', payment.payment_status);
    
    // Check if we got a valid response
    if (payment.payment_id && payment.pay_address) {
      console.log('✅ Payment URL received successfully');
      
      // Save payment record to Firestore
      await addDoc(collection(db, "payments"), {
        clinicId,
        clinicName,
        paymentId: payment.payment_id,
        orderId,
        amount,
        currency: 'USDT-ERC20',
        status: payment.payment_status || 'waiting',
        plan,
        paymentUrl: payment.pay_address,
        fullResponse: payment, // Save full response for debugging
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      // Open payment page in new tab
      alert(`Payment created! Send ${payment.pay_amount} USDT to: ${payment.pay_address}`);
      alert(`✅ Payment link created successfully! Opening payment page for ${clinicName}`);
      
    } else if (payment.message) {
      // Check for error message in response
      console.error('❌ NOWPayments error message:', payment.message);
      alert(`❌ Payment creation failed: ${payment.message}`);
      
    } else {
      // No payment URL and no clear error message
      console.error('❌ Unexpected response structure:', payment);
      alert(`❌ Unexpected response from payment provider. Check console for details.`);
    }
    
  } catch (error) {
    console.error('=== PAYMENT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    alert(`❌ Payment creation failed: ${error.message}`);
  } finally {
    setIsCreatingPayment(false);
  }
};
  const handleSavePricing = async () => {
    try {
      await setDoc(doc(db, "system_config", "pricing"), {
        ...pricingConfig,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      setIsEditing(false);
      alert('Pricing updated successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Error saving pricing configuration');
    }
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

      {/* Payment Creation Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Create Subscription Payment</h3>
        <p className="text-gray-600 mb-4">Generate payment links for clinic subscriptions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Payment Button */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-600 mb-2">Monthly Subscription</h4>
            <p className="text-2xl font-bold mb-2">${pricingConfig.monthly_usd} USDT</p>
            <p className="text-sm text-gray-500 mb-4">Billed monthly</p>
            <button
              onClick={() => {
                const clinicId = prompt('Enter Clinic ID:');
                const clinicName = prompt('Enter Clinic Name:');
                if (clinicId && clinicName) {
                  handleCreateSubscriptionPayment(clinicId, clinicName, 'monthly');
                }
              }}
              disabled={isCreatingPayment}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isCreatingPayment ? 'Creating...' : 'Create Monthly Payment'}
            </button>
          </div>

          {/* Annual Payment Button */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-green-600 mb-2">Annual Subscription</h4>
            <p className="text-2xl font-bold mb-2">${pricingConfig.annual_usd} USDT</p>
            <p className="text-sm text-gray-500 mb-4">Billed annually (17% discount)</p>
            <button
              onClick={() => {
                const clinicId = prompt('Enter Clinic ID:');
                const clinicName = prompt('Enter Clinic Name:');
                if (clinicId && clinicName) {
                  handleCreateSubscriptionPayment(clinicId, clinicName, 'annual');
                }
              }}
              disabled={isCreatingPayment}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isCreatingPayment ? 'Creating...' : 'Create Annual Payment'}
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>How it works:</strong> Click a payment button, enter the clinic details, and a USDT payment link will be generated. 
            The clinic owner will receive the payment link to complete their subscription.
          </p>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${systemStats.monthlyRevenue}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${systemStats.totalRevenue}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">${systemStats.transactionFees}</p>
            <p className="text-sm text-gray-500">Transaction Fees</p>
          </div>
        </div>
      </div>

      {/* Save Pricing Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button 
            onClick={handleSavePricing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
            Save Pricing Settings
          </button>
        </div>
      )}
    </div>
  );
};
  // System Settings Component
  const SystemSettings = () => {
    const [systemConfig, setSystemConfig] = useState({
      maintenance_mode: false,
      new_registrations: true,
      email_notifications: true,
      max_storage_per_tenant: 10,
      backup_frequency: 'daily',
      session_timeout: 24
    });

    const handleSaveSystemSettings = async () => {
      try {
        await setDoc(doc(db, "system_config", "general"), {
          ...systemConfig,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
        alert('System settings updated successfully!');
      } catch (error) {
        console.error('Error saving system settings:', error);
        alert('Error saving system settings');
      }
    };

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
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSaveSystemSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
            Save System Settings
          </button>
        </div>
      </div>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Main Render
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tenants': return <TenantManagement />;
      case 'content': return <ContentManagement />;
      case 'pricing': return <PricingManagement />;
      case 'system': return <SystemSettings />;
      case 'analytics': return <Dashboard />; // For now, same as dashboard
      case 'languages': return <ContentManagement />; // For now, same as content
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

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t bg-white">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              <p>ALTEAWORLD.IO</p>
              <p>System Administrator</p>
              <p className="truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 pb-20">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
