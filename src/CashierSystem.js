import React, { useState, useEffect } from 'react';
import { Search, Plus, Receipt, Send, Printer, User, Calendar, Clock, DollarSign, Eye, Settings } from 'lucide-react';

const ProperCashierSystem = ({ currentUser, clinicData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Mock data - pending patient cases (who finished treatment, waiting to pay)
  const [pendingCases, setPendingCases] = useState([
    {
      id: 'case_001',
      patientName: 'Budi Santoso',
      patientBirthDate: '1985-03-15',
      visitDate: '2025-01-09',
      visitTime: '10:30',
      doctor: 'Dr. Ahmad Wijaya',
      services: [
        { id: 'serv_001', name: 'Konsultasi Dokter', price: 100000, category: 'consultation' },
        { id: 'serv_002', name: 'Tes Darah', price: 150000, category: 'lab' }
      ],
      medications: [
        { id: 'med_001', name: 'Paracetamol 500mg', price: 15000, quantity: 10, category: 'medication' }
      ],
      status: 'pending_payment',
      totalAmount: 265000
    },
    {
      id: 'case_002',
      patientName: 'Siti Nurhaliza',
      patientBirthDate: '1990-07-22',
      visitDate: '2025-01-09',
      visitTime: '11:15',
      doctor: 'Dr. Sari Indrawati',
      services: [
        { id: 'serv_001', name: 'Konsultasi Dokter', price: 100000, category: 'consultation' },
        { id: 'serv_003', name: 'EKG', price: 200000, category: 'examination' }
      ],
      medications: [],
      status: 'pending_payment',
      totalAmount: 300000
    },
    {
      id: 'case_003',
      patientName: 'Ahmad Fauzi',
      patientBirthDate: '1978-11-08',
      visitDate: '2025-01-09',
      visitTime: '09:45',
      doctor: 'Dr. Ahmad Wijaya',
      services: [
        { id: 'serv_001', name: 'Konsultasi Dokter', price: 100000, category: 'consultation' }
      ],
      medications: [
        { id: 'med_002', name: 'Amoxicillin 500mg', price: 45000, quantity: 14, category: 'medication' },
        { id: 'med_003', name: 'Vitamin C', price: 25000, quantity: 30, category: 'supplement' }
      ],
      status: 'pending_payment',
      totalAmount: 170000
    }
  ]);

  // Available additional items (dropdown)
  const [availableItems] = useState([
    { id: 'add_001', name: 'Surat Keterangan Sehat', price: 25000, category: 'document' },
    { id: 'add_002', name: 'Fotokopi Hasil Lab', price: 5000, category: 'document' },
    { id: 'add_003', name: 'Plaster', price: 10000, category: 'supplies' },
    { id: 'add_004', name: 'Alkohol 70%', price: 15000, category: 'supplies' },
    { id: 'add_005', name: 'Masker Medis', price: 20000, category: 'supplies' }
  ]);

  // Patient identification methods
  const [identificationMethod, setIdentificationMethod] = useState('manual'); // 'manual' or 'qr'
  const [patientSearch, setPatientSearch] = useState({
    name: '',
    birthDate: ''
  });

  const filteredCases = pendingCases.filter(case_ => {
    if (identificationMethod === 'manual') {
      const nameMatch = case_.patientName.toLowerCase().includes(patientSearch.name.toLowerCase());
      const birthMatch = !patientSearch.birthDate || case_.patientBirthDate === patientSearch.birthDate;
      return nameMatch && birthMatch;
    }
    return case_.patientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const calculateTotal = () => {
    if (!selectedPatient) return 0;
    const originalTotal = selectedPatient.totalAmount;
    const additionalTotal = additionalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return originalTotal + additionalTotal;
  };

  const addAdditionalItem = (item) => {
    const existingItem = additionalItems.find(addItem => addItem.id === item.id);
    if (existingItem) {
      setAdditionalItems(prev => prev.map(addItem => 
        addItem.id === item.id 
          ? { ...addItem, quantity: addItem.quantity + 1 }
          : addItem
      ));
    } else {
      setAdditionalItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const removeAdditionalItem = (itemId) => {
    setAdditionalItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateAdditionalQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeAdditionalItem(itemId);
    } else {
      setAdditionalItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const processPayment = () => {
    const transaction = {
      id: Date.now(),
      caseId: selectedPatient.id,
      patientName: selectedPatient.patientName,
      patientBirthDate: selectedPatient.patientBirthDate,
      doctor: selectedPatient.doctor,
      visitDate: selectedPatient.visitDate,
      visitTime: selectedPatient.visitTime,
      originalServices: selectedPatient.services,
      originalMedications: selectedPatient.medications,
      additionalItems: additionalItems,
      originalAmount: selectedPatient.totalAmount,
      additionalAmount: additionalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      totalAmount: calculateTotal(),
      timestamp: new Date().toISOString(),
      cashier: currentUser?.email || 'cashier',
      clinicInfo: {
        name: clinicData?.name || 'Clinic Name',
        address: clinicData?.address || 'Clinic Address',
        phone: clinicData?.phone || 'Phone Number'
      }
    };

    setLastTransaction(transaction);
    setShowReceipt(true);
    
    // Remove from pending cases
    setPendingCases(prev => prev.filter(case_ => case_.id !== selectedPatient.id));
    
    // Reset
    setSelectedPatient(null);
    setAdditionalItems([]);
    setPatientSearch({ name: '', birthDate: '' });
  };

  const PatientIdentification = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Patient Identification
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setIdentificationMethod('manual')}
            className={`px-4 py-2 rounded-lg ${
              identificationMethod === 'manual' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setIdentificationMethod('qr')}
            className={`px-4 py-2 rounded-lg ${
              identificationMethod === 'qr' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            QR Code Scan (Future)
          </button>
        </div>

        {identificationMethod === 'manual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient Name</label>
              <input
                type="text"
                value={patientSearch.name}
                onChange={(e) => setPatientSearch(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birth Date</label>
              <input
                type="date"
                value={patientSearch.birthDate}
                onChange={(e) => setPatientSearch(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <div className="text-gray-500 mb-2">📱 QR Code Scanner</div>
            <p className="text-sm text-gray-600">Future feature: Patient shows QR code from mobile app</p>
            <p className="text-xs text-gray-500 mt-2">Will auto-populate patient information</p>
          </div>
        )}
      </div>
    </div>
  );

  const PendingCasesList = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Pending Patient Cases ({filteredCases.length})
      </h2>
      
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending cases found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredCases.map(case_ => (
            <div 
              key={case_.id} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPatient?.id === case_.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPatient(case_)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{case_.patientName}</h3>
                  <p className="text-sm text-gray-600">
                    Birth: {new Date(case_.patientBirthDate).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Doctor: {case_.doctor} • {case_.visitTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    IDR {case_.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {case_.services.length} services, {case_.medications.length} medications
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const PaymentDetails = () => {
    if (!selectedPatient) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Details - {selectedPatient.patientName}
        </h2>
        
        <div className="space-y-4">
          {/* Original Services */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Medical Services</h3>
            <div className="space-y-2">
              {selectedPatient.services.map(service => (
                <div key={service.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{service.name}</span>
                  <span className="text-sm font-medium">IDR {service.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Original Medications */}
          {selectedPatient.medications.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Medications</h3>
              <div className="space-y-2">
                {selectedPatient.medications.map(medication => (
                  <div key={medication.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{medication.name} (x{medication.quantity})</span>
                    <span className="text-sm font-medium">IDR {medication.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Items */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Additional Items</h3>
            <div className="space-y-2">
              <select
                onChange={(e) => {
                  const selectedItem = availableItems.find(item => item.id === e.target.value);
                  if (selectedItem) {
                    addAdditionalItem(selectedItem);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select additional item...</option>
                {availableItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - IDR {item.price.toLocaleString()}
                  </option>
                ))}
              </select>
              
              {additionalItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAdditionalQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateAdditionalQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                      +
                    </button>
                    <span className="text-sm font-medium ml-2">
                      IDR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Original Amount:</span>
              <span>IDR {selectedPatient.totalAmount.toLocaleString()}</span>
            </div>
            {additionalItems.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Additional Items:</span>
                <span>IDR {additionalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-green-600">IDR {calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={processPayment}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            Process Payment
          </button>
        </div>
      </div>
    );
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
            <p className="text-sm"><strong>Patient:</strong> {lastTransaction.patientName}</p>
            <p className="text-sm"><strong>Birth Date:</strong> {new Date(lastTransaction.patientBirthDate).toLocaleDateString('id-ID')}</p>
            <p className="text-sm"><strong>Doctor:</strong> {lastTransaction.doctor}</p>
            <p className="text-sm"><strong>Visit:</strong> {lastTransaction.visitDate} {lastTransaction.visitTime}</p>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <h4 className="font-medium text-sm">Medical Services:</h4>
              {lastTransaction.originalServices.map(service => (
                <div key={service.id} className="flex justify-between text-xs">
                  <span>{service.name}</span>
                  <span>{service.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {lastTransaction.originalMedications.length > 0 && (
              <div>
                <h4 className="font-medium text-sm">Medications:</h4>
                {lastTransaction.originalMedications.map(med => (
                  <div key={med.id} className="flex justify-between text-xs">
                    <span>{med.name} (x{med.quantity})</span>
                    <span>{med.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {lastTransaction.additionalItems.length > 0 && (
              <div>
                <h4 className="font-medium text-sm">Additional Items:</h4>
                {lastTransaction.additionalItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>IDR {lastTransaction.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t text-center text-xs text-gray-600">
            <p>Thank you for your visit!</p>
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="mt-2">Cashier: {lastTransaction.cashier}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => alert('Send to Mobile App - Feature will be implemented')}
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send to App
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clinic Cashier System</h1>
          <p className="text-gray-600">Process payments for patients who have completed their treatment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Patient ID & Pending Cases */}
          <div className="lg:col-span-2 space-y-6">
            <PatientIdentification />
            <PendingCasesList />
          </div>

          {/* Right Column: Payment Details */}
          <div>
            {selectedPatient ? (
              <PaymentDetails />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500 py-8">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a patient case to process payment</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && <ReceiptModal />}
    </div>
  );
};

export default ProperCashierSystem;
