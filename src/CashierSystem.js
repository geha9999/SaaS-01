import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, Settings, DollarSign, User } from 'lucide-react';

const CashierCheckoutSystem = () => {
  const [settings, setSettings] = useState({
    clinicName: 'Klinik Sehat Sentosa',
    clinicAddress: 'Jl. Kesehatan No. 123, Jakarta',
    clinicPhone: '021-1234567',
    showAdminFee: false, // Toggle for showing admin fee to patient
    adminFeeMarkup: 0, // Additional markup if charged to patient
    currentRate: 16675,
    markupPercentage: 2,
    minimumThreshold: 2000,
  });

  const [cart, setCart] = useState([]);
  const [patient, setPatient] = useState({
    name: '',
    phone: '',
    id: ''
  });

  const [services] = useState([
    { id: 1, name: 'Konsultasi Dokter', price: 100000, category: 'consultation' },
    { id: 2, name: 'Pemeriksaan Fisik', price: 75000, category: 'examination' },
    { id: 3, name: 'Tes Darah', price: 150000, category: 'lab' },
    { id: 4, name: 'EKG', price: 200000, category: 'examination' },
    { id: 5, name: 'Obat Paracetamol', price: 15000, category: 'medication' },
    { id: 6, name: 'Obat Antibiotik', price: 45000, category: 'medication' },
    { id: 7, name: 'Vitamin C', price: 25000, category: 'medication' },
    { id: 8, name: 'Suntik Vitamin B12', price: 80000, category: 'treatment' }
  ]);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate system fee (your revenue)
  const calculateSystemFee = () => {
    const baseFeeIDR = 0.10 * settings.currentRate;
    const markupAmount = (settings.currentRate * settings.markupPercentage) / 100;
    const markedUpRate = settings.currentRate + markupAmount;
    const feeWithMarkup = 0.10 * markedUpRate;
    const finalFee = Math.max(feeWithMarkup, settings.minimumThreshold);
    const roundedFee = finalFee > settings.minimumThreshold ? Math.ceil(finalFee / 100) * 100 : finalFee;
    return Math.round(roundedFee);
  };

  // Calculate admin fee shown to patient (if enabled)
  const calculatePatientAdminFee = () => {
    const systemFee = calculateSystemFee();
    return systemFee + (systemFee * settings.adminFeeMarkup / 100);
  };

  const addToCart = (service) => {
    const existingItem = cart.find(item => item.id === service.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === service.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...service, quantity: 1 }]);
    }
  };

  const removeFromCart = (serviceId) => {
    setCart(cart.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId, change) => {
    setCart(cart.map(item => 
      item.id === serviceId 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const adminFee = settings.showAdminFee ? calculatePatientAdminFee() : 0;
    return subtotal + adminFee;
  };

  const processCheckout = () => {
    const transaction = {
      id: Date.now(),
      patient: patient,
      items: cart,
      subtotal: calculateSubtotal(),
      adminFee: settings.showAdminFee ? calculatePatientAdminFee() : 0,
      total: calculateTotal(),
      systemFee: calculateSystemFee(), // Hidden from patient
      timestamp: new Date().toISOString(),
      cashier: 'Current User', // In real app, get from auth
      paymentMethod: 'cash', // Can be extended
      clinicInfo: {
        name: settings.clinicName,
        address: settings.clinicAddress,
        phone: settings.clinicPhone
      }
    };

    setLastTransaction(transaction);
    setShowReceipt(true);
    
    // Clear cart and patient info
    setCart([]);
    setPatient({ name: '', phone: '', id: '' });
    
    // In real app, save to database here
    console.log('Transaction saved:', transaction);
  };

  const ReceiptModal = () => {
    if (!lastTransaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">{lastTransaction.clinicInfo.name}</h2>
            <p className="text-sm text-gray-600">{lastTransaction.clinicInfo.address}</p>
            <p className="text-sm text-gray-600">Tel: {lastTransaction.clinicInfo.phone}</p>
            <div className="border-t border-b border-gray-300 my-2 py-1">
              <p className="text-sm font-mono">RECEIPT / STRUK</p>
              <p className="text-xs text-gray-600">
                {new Date(lastTransaction.timestamp).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm"><strong>Patient:</strong> {lastTransaction.patient.name}</p>
            <p className="text-sm"><strong>Phone:</strong> {lastTransaction.patient.phone}</p>
            <p className="text-sm"><strong>ID:</strong> {lastTransaction.patient.id}</p>
          </div>

          <div className="border-t border-gray-300 pt-2 mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastTransaction.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1 text-left">{item.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">{item.price.toLocaleString()}</td>
                    <td className="py-1 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>IDR {lastTransaction.subtotal.toLocaleString()}</span>
            </div>
            
            {settings.showAdminFee && (
              <div className="flex justify-between text-sm">
                <span>Admin Fee:</span>
                <span>IDR {lastTransaction.adminFee.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold border-t pt-1">
              <span>TOTAL:</span>
              <span>IDR {lastTransaction.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t text-center text-xs text-gray-600">
            <p>Thank you for your visit!</p>
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="mt-2">Cashier: {lastTransaction.cashier}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              Print Receipt
            </button>
            <button 
              onClick={() => setShowReceipt(false)}
              className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SettingsModal = () => {
    const [tempSettings, setTempSettings] = useState(settings);

    const handleSave = () => {
      setSettings(tempSettings);
      setShowSettings(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Cashier Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Clinic Name</label>
              <input
                type="text"
                value={tempSettings.clinicName}
                onChange={(e) => setTempSettings({...tempSettings, clinicName: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Clinic Address</label>
              <textarea
                value={tempSettings.clinicAddress}
                onChange={(e) => setTempSettings({...tempSettings, clinicAddress: e.target.value})}
                className="w-full p-2 border rounded"
                rows="2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Clinic Phone</label>
              <input
                type="text"
                value={tempSettings.clinicPhone}
                onChange={(e) => setTempSettings({...tempSettings, clinicPhone: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showAdminFee"
                checked={tempSettings.showAdminFee}
                onChange={(e) => setTempSettings({...tempSettings, showAdminFee: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="showAdminFee" className="text-sm font-medium">
                Show Admin Fee to Patient
              </label>
            </div>
            
            {tempSettings.showAdminFee && (
              <div>
                <label className="block text-sm font-medium mb-1">Patient Admin Fee Markup (%)</label>
                <input
                  type="number"
                  value={tempSettings.adminFeeMarkup}
                  onChange={(e) => setTempSettings({...tempSettings, adminFeeMarkup: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  placeholder="Additional markup for patient"
                />
              </div>
            )}
            
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-yellow-800">
                <strong>System Fee (Your Revenue):</strong> IDR {calculateSystemFee().toLocaleString()}
                <br />
                <strong>Patient Admin Fee:</strong> IDR {calculatePatientAdminFee().toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Save Settings
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Cashier System</h1>
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Services */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Services & Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        service.category === 'consultation' ? 'bg-blue-100 text-blue-800' :
                        service.category === 'examination' ? 'bg-green-100 text-green-800' :
                        service.category === 'lab' ? 'bg-purple-100 text-purple-800' :
                        service.category === 'medication' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        IDR {service.price.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => addToCart(service)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={patient.name}
                  onChange={(e) => setPatient({...patient, name: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={patient.phone}
                  onChange={(e) => setPatient({...patient, phone: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Patient ID (optional)"
                  value={patient.id}
                  onChange={(e) => setPatient({...patient, id: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Current Order</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in cart</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">IDR {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Summary */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>IDR {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {settings.showAdminFee && (
                    <div className="flex justify-between">
                      <span>Admin Fee:</span>
                      <span>IDR {calculatePatientAdminFee().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>IDR {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={processCheckout}
                  disabled={!patient.name || !patient.phone}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Process Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReceipt && <ReceiptModal />}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default CashierCheckoutSystem;
