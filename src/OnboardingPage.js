import React, { useState } from 'react';
import { Shield, FileText, Globe, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const OnboardingPage = ({ onComplete, userProfile, clinic }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState('en');
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: language === 'en' ? 'Welcome to CLINICQ' : 'Selamat Datang di CLINICQ',
      component: 'Welcome'
    },
    {
      id: 'language',
      title: language === 'en' ? 'Choose Your Language' : 'Pilih Bahasa Anda',
      component: 'Language'
    },
    {
      id: 'terms',
      title: language === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan',
      component: 'Terms'
    },
    {
      id: 'privacy',
      title: language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi',
      component: 'Privacy'
    },
    {
      id: 'complete',
      title: language === 'en' ? 'Setup Complete' : 'Pengaturan Selesai',
      component: 'Complete'
    }
  ];

  const content = {
    en: {
      welcome: {
        title: 'Welcome to CLINICQ',
        subtitle: 'Your Complete Clinic Management Solution',
        description: 'CLINICQ helps you manage your clinic efficiently with patient records, appointments, payments, and more.',
        features: [
          'Patient Management System',
          'Appointment Scheduling',
          'Payment Processing',
          'Staff Management',
          'Analytics & Reports'
        ],
        getStarted: 'Get Started'
      },
      language: {
        title: 'Choose Your Language',
        description: 'Select your preferred language for using CLINICQ',
        options: [
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
        ]
      },
      terms: {
        title: 'Terms & Conditions',
        content: `# Terms and Conditions

## 1. Acceptance of Terms
By using CLINICQ, you agree to be bound by these Terms and Conditions.

## 2. Service Description
CLINICQ is a clinic management software that helps healthcare providers manage their practice.

## 3. User Responsibilities
- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You must comply with all applicable laws and regulations

## 4. Privacy and Data Protection
- We are committed to protecting your privacy
- Patient data is encrypted and securely stored
- You remain the owner of your clinic's data

## 5. Payment Terms
- Subscription fees are billed monthly or annually
- Transaction fees apply to patient payments
- Refunds are available according to our refund policy

## 6. Limitation of Liability
CLINICQ is provided "as is" without warranties of any kind.

By clicking "I Accept", you agree to these terms and conditions.`,
        accept: 'I Accept the Terms & Conditions',
        required: 'You must accept the terms to continue'
      },
      privacy: {
        title: 'Privacy Policy',
        content: `# Privacy Policy

## Information We Collect
- Account information (name, email, clinic details)
- Patient data you input into the system
- Usage analytics to improve our service

## How We Use Your Information
- To provide and maintain our service
- To process payments and transactions
- To communicate with you about your account
- To comply with legal obligations

## Data Security
- All data is encrypted in transit and at rest
- We use industry-standard security measures
- Regular security audits and updates

## Your Rights
- Access your personal data
- Correct inaccurate information
- Request deletion of your data
- Export your data

## Data Sharing
We do not sell or share your personal data with third parties except as necessary to provide our service.

## Contact Us
If you have questions about this privacy policy, contact us at privacy@clinicq.com`,
        accept: 'I Accept the Privacy Policy',
        marketing: 'I agree to receive marketing communications (optional)',
        required: 'You must accept the privacy policy to continue'
      },
      complete: {
        title: 'Setup Complete!',
        message: 'Your CLINICQ account is ready to use.',
        description: 'You can now start managing your clinic with our comprehensive tools.',
        enterApp: 'Enter CLINICQ'
      }
    },
    id: {
      welcome: {
        title: 'Selamat Datang di CLINICQ',
        subtitle: 'Solusi Manajemen Klinik Lengkap Anda',
        description: 'CLINICQ membantu Anda mengelola klinik dengan efisien menggunakan sistem rekam medis, jadwal appointment, pembayaran, dan lainnya.',
        features: [
          'Sistem Manajemen Pasien',
          'Penjadwalan Appointment',
          'Pemrosesan Pembayaran',
          'Manajemen Staff',
          'Analitik & Laporan'
        ],
        getStarted: 'Mulai'
      },
      language: {
        title: 'Pilih Bahasa Anda',
        description: 'Pilih bahasa yang Anda inginkan untuk menggunakan CLINICQ',
        options: [
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
        ]
      },
      terms: {
        title: 'Syarat & Ketentuan',
        content: `# Syarat & Ketentuan

## 1. Penerimaan Syarat
Dengan menggunakan CLINICQ, Anda setuju untuk terikat dengan Syarat & Ketentuan ini.

## 2. Deskripsi Layanan
CLINICQ adalah perangkat lunak manajemen klinik yang membantu penyedia layanan kesehatan mengelola praktik mereka.

## 3. Tanggung Jawab Pengguna
- Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda
- Anda harus memberikan informasi yang akurat dan lengkap
- Anda harus mematuhi semua hukum dan peraturan yang berlaku

## 4. Privasi dan Perlindungan Data
- Kami berkomitmen untuk melindungi privasi Anda
- Data pasien dienkripsi dan disimpan dengan aman
- Anda tetap menjadi pemilik data klinik Anda

## 5. Syarat Pembayaran
- Biaya berlangganan ditagih bulanan atau tahunan
- Biaya transaksi berlaku untuk pembayaran pasien
- Pengembalian dana tersedia sesuai dengan kebijakan pengembalian dana kami

## 6. Batasan Tanggung Jawab
CLINICQ disediakan "apa adanya" tanpa jaminan dalam bentuk apa pun.

Dengan mengklik "Saya Menerima", Anda menyetujui syarat dan ketentuan ini.`,
        accept: 'Saya Menerima Syarat & Ketentuan',
        required: 'Anda harus menerima syarat untuk melanjutkan'
      },
      privacy: {
        title: 'Kebijakan Privasi',
        content: `# Kebijakan Privasi

## Informasi yang Kami Kumpulkan
- Informasi akun (nama, email, detail klinik)
- Data pasien yang Anda masukkan ke dalam sistem
- Analitik penggunaan untuk meningkatkan layanan kami

## Bagaimana Kami Menggunakan Informasi Anda
- Untuk menyediakan dan memelihara layanan kami
- Untuk memproses pembayaran dan transaksi
- Untuk berkomunikasi dengan Anda tentang akun Anda
- Untuk mematuhi kewajiban hukum

## Keamanan Data
- Semua data dienkripsi dalam transit dan saat disimpan
- Kami menggunakan langkah-langkah keamanan standar industri
- Audit keamanan dan pembaruan rutin

## Hak Anda
- Mengakses data pribadi Anda
- Memperbaiki informasi yang tidak akurat
- Meminta penghapusan data Anda
- Mengekspor data Anda

## Berbagi Data
Kami tidak menjual atau membagikan data pribadi Anda dengan pihak ketiga kecuali jika diperlukan untuk menyediakan layanan kami.

## Hubungi Kami
Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi kami di privacy@clinicq.com`,
        accept: 'Saya Menerima Kebijakan Privasi',
        marketing: 'Saya setuju untuk menerima komunikasi pemasaran (opsional)',
        required: 'Anda harus menerima kebijakan privasi untuk melanjutkan'
      },
      complete: {
        title: 'Pengaturan Selesai!',
        message: 'Akun CLINICQ Anda siap digunakan.',
        description: 'Anda sekarang dapat mulai mengelola klinik Anda dengan alat-alat komprehensif kami.',
        enterApp: 'Masuk ke CLINICQ'
      }
    }
  };

  const currentContent = content[language];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!consents.terms || !consents.privacy) {
      alert(currentContent.terms.required);
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        termsAccepted: consents.terms,
        privacyAccepted: consents.privacy,
        marketingAccepted: consents.marketing,
        language: language,
        completedAt: new Date().toISOString(),
        clinicId: clinic?.id,
        userId: userProfile?.id
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error completing setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'terms':
        return consents.terms;
      case 'privacy':
        return consents.privacy;
      default:
        return true;
    }
  };

  // Welcome Step
  const WelcomeStep = () => (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentContent.welcome.title}</h2>
        <p className="text-xl text-gray-600 mb-4">{currentContent.welcome.subtitle}</p>
        <p className="text-gray-600 mb-8">{currentContent.welcome.description}</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-semibold mb-4">Features Include:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentContent.welcome.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {clinic && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">
            <strong>Clinic:</strong> {clinic.name}
          </p>
        </div>
      )}
    </div>
  );

  // Language Step
  const LanguageStep = () => (
    <div className="text-center">
      <Globe className="w-16 h-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentContent.language.title}</h2>
      <p className="text-gray-600 mb-8">{currentContent.language.description}</p>
      
      <div className="space-y-4 max-w-md mx-auto">
        {currentContent.language.options.map((option) => (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`w-full p-4 border rounded-lg flex items-center justify-between transition-colors ${
              language === option.code 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.flag}</span>
              <span className="font-medium">{option.name}</span>
            </div>
            {language === option.code && <CheckCircle className="w-5 h-5 text-blue-600" />}
          </button>
        ))}
      </div>
    </div>
  );

  // Terms Step
  const TermsStep = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">{currentContent.terms.title}</h2>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          {currentContent.terms.content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-lg font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
            } else if (line.startsWith('- ')) {
              return <li key={index} className="ml-4">{line.substring(2)}</li>;
            } else if (line.trim()) {
              return <p key={index} className="mb-2">{line}</p>;
            }
            return <br key={index} />;
          })}
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.terms}
            onChange={(e) => setConsents(prev => ({ ...prev, terms: e.target.checked }))}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-700">{currentContent.terms.accept}</span>
        </label>
      </div>
    </div>
  );

  // Privacy Step
  const PrivacyStep = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">{currentContent.privacy.title}</h2>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          {currentContent.privacy.content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-lg font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
            } else if (line.startsWith('- ')) {
              return <li key={index} className="ml-4">{line.substring(2)}</li>;
            } else if (line.trim()) {
              return <p key={index} className="mb-2">{line}</p>;
            }
            return <br key={index} />;
          })}
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.privacy}
            onChange={(e) => setConsents(prev => ({ ...prev, privacy: e.target.checked }))}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-700">{currentContent.privacy.accept}</span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.marketing}
            onChange={(e) => setConsents(prev => ({ ...prev, marketing: e.target.checked }))}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{currentContent.privacy.marketing}</span>
        </label>
      </div>
    </div>
  );

  // Complete Step
  const CompleteStep = () => (
    <div className="text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentContent.complete.title}</h2>
      <p className="text-xl text-gray-600 mb-4">{currentContent.complete.message}</p>
      <p className="text-gray-600 mb-8">{currentContent.complete.description}</p>
      
      {clinic && (
        <div className="bg-blue-50 p-6 rounded-xl mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Your Clinic Details:</h3>
          <p className="text-blue-700"><strong>Name:</strong> {clinic.name}</p>
          <p className="text-blue-700"><strong>ID:</strong> {clinic.id}</p>
          <p className="text-blue-700"><strong>Language:</strong> {language === 'en' ? 'English' : 'Bahasa Indonesia'}</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'Welcome': return <WelcomeStep />;
      case 'Language': return <LanguageStep />;
      case 'Terms': return <TermsStep />;
      case 'Privacy': return <PrivacyStep />;
      case 'Complete': return <CompleteStep />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600">{steps[currentStep].title}</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <ArrowLeft size={20} />
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'Setting up...' : currentContent.complete.enterApp}
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
