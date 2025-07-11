import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Edit3, Eye, Phone, Mail, 
  Calendar, MapPin, FileText, Heart, AlertTriangle, 
  Clock, MoreVertical, User, QrCode, Download, Upload
} from 'lucide-react';

const EnhancedPatientManagement = ({ user, db, clinic, userProfile }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(null);

  // Mock data for demonstration - replace with real Firebase integration
  const mockPatients = [
    {
      id: 'p1',
      patientId: 'P123456',
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '+62 812 3456 7890',
      birthDate: new Date('1985-03-15'),
      gender: 'male',
      bloodType: 'B+',
      address: 'Jl. Merdeka No. 123, Jakarta',
      emergencyContactName: 'Siti Santoso',
      emergencyContactPhone: '+62 813 4567 8901',
      allergies: 'Penicillin, Seafood',
      medicalHistory: 'Hypertension, controlled with medication',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastVisit: new Date('2024-12-01')
    },
    {
      id: 'p2',
      patientId: 'P123457',
      name: 'Siti Nurhaliza',
      email: 'siti@email.com',
      phone: '+62 821 2345 6789',
      birthDate: new Date('1990-07-22'),
      gender: 'female',
      bloodType: 'A+',
      address: 'Jl. Sudirman No. 456, Jakarta',
      emergencyContactName: 'Ahmad Nurhaliza',
      emergencyContactPhone: '+62 822 3456 7890',
      allergies: '',
      medicalHistory: 'No significant medical history',
      status: 'active',
      createdAt: new Date('2024-02-20'),
      lastVisit: new Date('2024-11-28')
    },
    {
      id: 'p3',
      patientId: 'P123458',
      name: 'Ahmad Fauzi',
      email: 'ahmad@email.com',
      phone: '+62 831 1234 5678',
      birthDate: new Date('1978-11-08'),
      gender: 'male',
      bloodType: 'O+',
      address: 'Jl. Thamrin No. 789, Jakarta',
      emergencyContactName: 'Fatimah Fauzi',
      emergencyContactPhone: '+62 832 2345 6789',
      allergies: 'Dust, Pollen',
      medicalHistory: 'Diabetes Type 2, under treatment',
      status: 'active',
      createdAt: new Date('2024-03-10'),
      lastVisit: new Date('2024-12-05')
    }
  ];

  // Fetch patients - replace with real Firebase integration
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 1000);
  }, [clinic?.id]);

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm) ||
                         patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const age = calculateAge(patient.birthDate);
    const matchesAge = ageFilter === 'all' || 
                      (ageFilter === 'child' && age && age < 18) ||
                      (ageFilter === 'adult' && age && age >= 18 && age < 65) ||
                      (ageFilter === 'senior' && age && age >= 65);
    
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesAge && matchesGender && matchesStatus;
  });

  // Add new patient - replace with real Firebase integration
  const handleAddPatient = async (patientData) => {
    try {
      // Generate patient ID
      const patientId = `P${Date.now().toString().slice(-6)}`;
      
      // Mock implementation - replace with actual Firebase addDoc
      const newPatient = {
        ...patientData,
        id: Date.now().toString(),
        patientId,
        status: 'active',
        registrationDate: new Date(patientData.registrationDate),
        birthDate: new Date(patientData.birthDate),
        createdAt: new Date(),
        createdBy: user?.uid || 'mock-user',
        clinicId: clinic?.id || 'mock-clinic'
      };
      
      // Add to local state (replace with Firebase integration)
      setPatients(prev => [newPatient, ...prev]);
      
      setShowAddModal(false);
      alert('✅ Patient added successfully');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('❌ Error adding patient');
    }
  };

  // Update patient - replace with real Firebase integration
  const handleUpdatePatient = async (patientId, updates) => {
    try {
      // Mock implementation - replace with actual Firebase updateDoc
      setPatients(prev => prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, ...updates, updatedAt: new Date(), updatedBy: user?.uid || 'mock-user' }
          : patient
      ));
      
      alert('✅ Patient updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('❌ Error updating patient');
    }
  };

  // Generate QR Code (placeholder)
  const generateQRCode = (patient) => {
    const qrData = {
      patientId: patient.patientId,
      name: patient.name,
      clinicId: clinic.id,
      type: 'patient_identification'
    };
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="90" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR Code for</text><text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="black">${patient.name}</text><text x="100" y="130" text-anchor="middle" font-family="Arial" font-size="10" fill="gray">ID: ${patient.patientId}</text></svg>`;
  };

  const AddPatientModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      gender: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: '',
      medicalHistory: '',
      bloodType: '',
      registrationDate: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.birthDate) {
        alert('Please fill in required fields (Name and Birth Date)');
        return;
      }
      handleAddPatient(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Add New Patient</h3>
            <button 
              onClick={() => setShowAddModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-3">Basic Information</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Patient's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Birth Date *</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({...prev, birthDate: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData(prev => ({...prev, bloodType: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Contact Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="patient@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Complete address"
              />
            </div>

            {/* Emergency Contact */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Emergency Contact</h4>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData(prev => ({...prev, emergencyContactName: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData(prev => ({...prev, emergencyContactPhone: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+62 812 3456 7890"
              />
            </div>

            {/* Medical Information */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Medical Information</h4>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Known Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({...prev, allergies: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="List any known allergies..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => setFormData(prev => ({...prev, medicalHistory: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief medical history and current conditions..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Patient
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PatientDetailsModal = () => {
    if (!selectedPatient) return null;
    
    const age = calculateAge(selectedPatient.birthDate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Patient Details</h3>
            <button 
              onClick={() => setShowViewModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedPatient.name}</span></div>
                  <div><span className="text-gray-600">Patient ID:</span> <span className="font-medium">{selectedPatient.patientId}</span></div>
                  <div><span className="text-gray-600">Age:</span> <span className="font-medium">{age ? `${age} years` : 'Not specified'}</span></div>
                  <div><span className="text-gray-600">Gender:</span> <span className="font-medium">{selectedPatient.gender || 'Not specified'}</span></div>
                  <div><span className="text-gray-600">Blood Type:</span> <span className="font-medium">{selectedPatient.bloodType || 'Not specified'}</span></div>
                  <div><span className="text-gray-600">Registration:</span> <span className="font-medium">{selectedPatient.createdAt?.toLocaleDateString()}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedPatient.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedPatient.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <span>{selectedPatient.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {(selectedPatient.emergencyContactName || selectedPatient.emergencyContactPhone) && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-red-800">Emergency Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-red-600">Name:</span> <span className="font-medium">{selectedPatient.emergencyContactName}</span></div>
                    <div><span className="text-red-600">Phone:</span> <span className="font-medium">{selectedPatient.emergencyContactPhone}</span></div>
                  </div>
                </div>
              )}

              {(selectedPatient.allergies || selectedPatient.medicalHistory) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-yellow-800">Medical Information</h4>
                  {selectedPatient.allergies && (
                    <div className="mb-3">
                      <span className="text-yellow-600 font-medium">Allergies:</span>
                      <p className="text-sm mt-1">{selectedPatient.allergies}</p>
                    </div>
                  )}
                  {selectedPatient.medicalHistory && (
                    <div>
                      <span className="text-yellow-600 font-medium">Medical History:</span>
                      <p className="text-sm mt-1">{selectedPatient.medicalHistory}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* QR Code and Actions */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold mb-3">Patient QR Code</h4>
                <div className="w-32 h-32 bg-white border-2 border-dashed border-blue-300 rounded-lg mx-auto flex items-center justify-center mb-3">
                  <QrCode className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xs text-blue-600 mb-3">QR code for quick patient identification</p>
                <button
                  onClick={() => setShowQRCode(selectedPatient)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Generate QR
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Appointment
                  </button>
                  <button className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    View Medical Records
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit Information
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.active}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-xl font-bold">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-xl font-bold">{patients.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-xl font-bold">
                {patients.filter(p => {
                  const createdThisMonth = p.createdAt && 
                    p.createdAt.getMonth() === new Date().getMonth() &&
                    p.createdAt.getFullYear() === new Date().getFullYear();
                  return createdThisMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">With Allergies</p>
              <p className="text-xl font-bold">{patients.filter(p => p.allergies).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ages</option>
            <option value="child">Children (&lt;18)</option>
            <option value="adult">Adults (18-64)</option>
            <option value="senior">Seniors (65+)</option>
          </select>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map(patient => {
                const age = calculateAge(patient.birthDate);
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{age ? `${age} years` : 'N/A'}</div>
                      <div className="text-gray-500 capitalize">{patient.gender || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{patient.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{patient.email || 'Not provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastVisit ? patient.lastVisit.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No patients found</p>
            <p className="text-sm">Try adjusting your search criteria or add a new patient</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddPatientModal />}
      {showViewModal && <PatientDetailsModal />}
    </div>
  );
};

export default EnhancedPatientManagement;
