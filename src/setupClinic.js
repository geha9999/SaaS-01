// src/setupClinic.js
// Run this ONCE to initialize your clinic data

import { db } from './firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

const setupClinicData = async (clinicId) => {
  try {
    // 1. Add default services
    const defaultServices = [
      {
        name: "Konsultasi Dokter",
        price: 100000,
        category: "consultation",
        description: "General consultation with doctor",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        name: "Pemeriksaan Fisik",
        price: 75000,
        category: "examination",
        description: "Physical examination",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        name: "Tes Darah",
        price: 150000,
        category: "lab",
        description: "Blood test",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        name: "EKG",
        price: 200000,
        category: "examination",
        description: "Electrocardiogram",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        name: "Obat Paracetamol",
        price: 15000,
        category: "medication",
        description: "Pain reliever",
        inStock: true,
        createdAt: new Date().toISOString()
      }
    ];

    // Add services to clinic
    for (const service of defaultServices) {
      await addDoc(collection(db, `clinics/${clinicId}/services`), service);
    }

    // 2. Add default settings
    const defaultSettings = {
      clinicName: "Your Clinic Name",
      clinicAddress: "Your Clinic Address",
      clinicPhone: "Your Phone Number",
      clinicLogo: null,
      showAdminFee: false,
      adminFeeMarkup: 0,
      currentRate: 16675,
      markupPercentage: 2,
      minimumThreshold: 2000,
      standardFees: {
        consultation: 100000,
        examination: 75000,
        basicLab: 150000,
        advancedLab: 200000
      }
    };

    // Add settings to clinic
    await setDoc(doc(db, `clinics/${clinicId}/settings`, 'cashier'), defaultSettings);

    console.log('✅ Clinic setup completed successfully!');
    console.log('✅ Default services added');
    console.log('✅ Default settings configured');
    console.log('📝 Please update clinic info in Settings');

  } catch (error) {
    console.error('❌ Error setting up clinic:', error);
  }
};

// HOW TO USE:
// 1. Import this function in your AdminPanel.js
// 2. Call it once: setupClinicData('your_clinic_id')
// 3. Remove the call after running once

export default setupClinicData;

// Alternative: Add this button to your AdminPanel temporarily
/*
<button 
  onClick={() => setupClinicData(clinicData.id)}
  className="bg-yellow-500 text-white px-4 py-2 rounded"
>
  🔧 Setup Clinic Data (Run Once)
</button>
*/
