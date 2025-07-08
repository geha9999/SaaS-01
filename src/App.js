import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    sendEmailVerification,
    reload
} from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, onSnapshot, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, LayoutDashboard, PlusCircle, MoreVertical, LogOut, X, UserPlus, LogIn, Building, Briefcase, Send, Mail, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

// --- Helper function for user-friendly error messages ---
const getFriendlyAuthError = (error) => {
    console.log('Auth error details:', error);
    if (!error || !error.code) return 'An unexpected error occurred. Please try again.';
    switch (error.code) {
        case 'auth/email-already-in-use': return 'This email address is already registered. Please try signing in instead.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/user-not-found': return 'No account found with this email. Please check the email or register a new clinic.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'The password is too weak. It must be at least 6 characters long.';
        case 'auth/invalid-credential': return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/invalid-login-credentials': return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/too-many-requests': return 'Too many failed attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed': return 'Network error. Please check your internet connection.';
        case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
        default: return `Authentication error: ${error.message || 'Please try again.'}`;
    }
};

// --- UI Components ---
const Input = ({ label, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <input {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> );
const Button = ({ children, className = '', ...props }) => ( <button {...props} className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}> {children} </button> );
const Card = ({ children }) => ( <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md"> {children} </div> );
const Modal = ({ children, onClose, title }) => ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}> <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}> <div className="flex justify-between items-center p-4 border-b"> <h3 className="text-xl font-semibold">{title}</h3> <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"> <X size={20} /> </button> </div> <div className="p-6"> {children} </div> </div> </div> );
const Select = ({ label, children, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <select {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"> {children} </select> </div> );
const LoadingSpinner = ({ message = "Loading..." }) => (<div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div><p className="mt-4 text-gray-600">{message}</p></div>);
const ErrorDisplay = ({ message }) => (<div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="text-center text-red-500 font-semibold p-4">{message}</div></div>);

// --- Email Verification Screen ---
const EmailVerificationScreen = ({ user, db, onResendVerification, onCheckVerification, onLogout }) => {
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleResendVerification = async () => {
        setIsResending(true);
        setResendMessage('');
        try {
            await onResendVerification();
            setResendMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            setResendMessage('Failed to send email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        try {
            await onCheckVerification();
        } catch (error) {
            console.error('Error checking verification:', error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <Mail className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Verify Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification email to:
                    </p>
                    <p className="font-semibold text-blue-600 mb-6">
                        {user?.email}
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Please click the link in the email to verify your account. 
                        Once verified, you can access your clinic dashboard.
                    </p>

                    <div className="space-y-4">
                        <Button 
                            onClick={handleCheckVerification} 
                            className="w-full"
                            disabled={isChecking}
                        >
                            {isChecking ? (
                                'Checking...'
                            ) : (
                                <>
                                    <CheckCircle className="mr-2" size={20} />
                                    I've Verified My Email
                                </>
                            )}
                        </Button>

                        <button 
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="w-full text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                            {isResending ? 'Sending...' : 'Resend verification email'}
                        </button>

                        {resendMessage && (
                            <p className={`text-sm ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                                {resendMessage}
                            </p>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <button 
                            onClick={onLogout}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Sign out and use different email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Success Screen After Registration ---
const RegistrationSuccessScreen = ({ email, onBackToLogin }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your clinic account has been created. We've sent a verification email to:
                    </p>
                    <p className="font-semibold text-blue-600 mb-6">
                        {email}
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Please check your email and click the verification link to activate your account. 
                        Once verified, you can sign in and start using CLINICQ.
                    </p>

                    <Button onClick={onBackToLogin} className="w-full">
                        <LogIn className="mr-2" size={20} />
                        Back to Sign In
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Auth Page Component ---
const AuthPage = ({ onLogin, onSignUp, onForgotPasswordClick }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', clinicName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError('');
        try {
            if (isLoginView) { 
                await onLogin(formData.email, formData.password); 
            } else { 
                await onSignUp(formData.email, formData.password, formData.clinicName);
                setRegisteredEmail(formData.email);
                setShowSuccessScreen(true);
            }
        } catch (error) {
            setAuthError(getFriendlyAuthError(error));
            setIsSubmitting(false);
        }
    };

    const handleBackToLogin = () => {
        setShowSuccessScreen(false);
        setIsLoginView(true);
        setFormData({ email: '', password: '', clinicName: '' });
        setAuthError('');
    };

    if (showSuccessScreen) {
        return <RegistrationSuccessScreen email={registeredEmail} onBackToLogin={handleBackToLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-4xl font-bold text-blue-600 text-center mb-8 flex items-center justify-center gap-2"><Building />CLINICQ</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">{isLoginView ? 'Clinic Portal Login' : 'Register Your Clinic'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        {!isLoginView && (<Input label="Clinic Name" name="clinicName" type="text" value={formData.clinicName} onChange={handleChange} required />)}
                        <Input label="Your Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <Button type="submit" className="w-full !mt-6" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : (isLoginView ? <><LogIn className="mr-2"/> Sign In</> : <><UserPlus className="mr-2"/> Register Clinic</>)}
                        </Button>
                        {authError && <p className="text-red-500 text-sm mt-4 text-center">{authError}</p>}
                    </form>
                    <div className="mt-6 text-center text-sm">
                        {isLoginView && (<button onClick={onForgotPasswordClick} className="text-blue-600 hover:underline">Forgot Password?</button>)}
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} className="text-sm text-blue-600 hover:underline">{isLoginView ? "Need to register a new clinic?" : "Already have an account? Sign In"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Application View (for logged-in users) ---
const MainApp = ({ user, auth, db }) => {
    const [page, setPage] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // Data states
    const [userProfile, setUserProfile] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [staff, setStaff] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);
    
    // --- Data Fetching Logic ---
    useEffect(() => {
        if (!user || !db) return;

        const userProfileRef = doc(db, "users", user.uid);
        const unsubProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile({ id: docSnap.id, ...docSnap.data() });
            } else {
                signOut(auth);
            }
        });

        return () => unsubProfile();
    }, [user, db, auth]);

    useEffect(() => {
        if (!userProfile) return;

        const clinicId = userProfile.clinicId;
        const unsubscribers = [];

        const clinicRef = doc(db, "clinics", clinicId);
        unsubscribers.push(onSnapshot(clinicRef, (clinicSnap) => {
            if (clinicSnap.exists()) setClinic({ id: clinicSnap.id, ...clinicSnap.data() });
        }));

        const staffQuery = query(collection(db, "users"), where("clinicId", "==", clinicId));
        unsubscribers.push(onSnapshot(staffQuery, (staffSnapshot) => {
             setStaff(staffSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }));

        const collections = ['patients', 'appointments', 'payments'];
        collections.forEach(colName => {
            const dataQuery = query(collection(db, `clinics/${clinicId}/${colName}`));
            unsubscribers.push(onSnapshot(dataQuery, (snapshot) => {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                if (colName === 'patients') setPatients(data);
                if (colName === 'appointments') setAppointments(data.map(a => ({...a, dateTime: a.dateTime?.toDate() })));
                if (colName === 'payments') setPayments(data.map(p => ({...p, date: p.date?.toDate() })));
            }));
        });
        
        return () => unsubscribers.forEach(unsub => unsub());
    }, [userProfile, db]);

    // --- Actions ---
    const handleLogout = () => signOut(auth);
    const openModal = (type) => { setIsModalOpen(true); setModalContent(type); };
    const closeModal = () => { setIsModalOpen(false); setModalContent(null); };

    const handleInviteStaff = async ({ email, role }) => {
        if (!db || !userProfile || !clinic) return;
        await addDoc(collection(db, "invitations"), {
            clinicId: userProfile.clinicId, clinicName: clinic.name, invitedBy: user.uid, email: email.toLowerCase(), role: role, status: "pending", createdAt: serverTimestamp()
        });
        alert(`Invitation sent to ${email}!`);
        closeModal();
    };
    const handleAddPatient = async (patientData) => {
        const clinicId = userProfile?.clinicId;
        if (!db || !clinicId) return;
        await addDoc(collection(db, `clinics/${clinicId}/patients`), { ...patientData, createdAt: serverTimestamp() });
        closeModal();
    };
    const handleAddAppointment = async (appointmentData) => {
        const clinicId = userProfile?.clinicId;
        if (!db || !clinicId) return;
        const selectedPatient = patients.find(p => p.id === appointmentData.patientId);
        await addDoc(collection(db, `clinics/${clinicId}/appointments`), {
            ...appointmentData, patientName: selectedPatient?.name || 'Unknown', dateTime: new Date(appointmentData.dateTime), status: 'Scheduled', createdAt: serverTimestamp()
        });
        closeModal();
    };
    const handleAddPayment = async (paymentData) => {
        const clinicId = userProfile?.clinicId;
        if (!db || !clinicId) return;
        const selectedPatient = patients.find(p => p.id === paymentData.patientId);
        await addDoc(collection(db, `clinics/${clinicId}/payments`), {
            ...paymentData, patientName: selectedPatient?.name || 'Unknown', amount: parseFloat(paymentData.amount), date: new Date(paymentData.date), status: 'Paid', createdAt: serverTimestamp()
        });
        closeModal();
    };
    const updateAppointmentStatus = async (id, status) => {
        const clinicId = userProfile?.clinicId;
        if (!db || !clinicId) return;
        await setDoc(doc(db, `clinics/${clinicId}/appointments`, id), { status }, { merge: true });
    };

    if (!userProfile || !clinic) {
        return <LoadingSpinner message="Loading Clinic Data..." />;
    }

    const renderPage = () => {
        switch (page) {
            case 'settings': return <SettingsPage clinic={clinic} />;
            case 'staff': return <StaffPage staff={staff} onInviteClick={() => openModal('inviteStaff')} userRole={userProfile.role}/>;
            case 'patients': return <PatientsPage patients={patients} />;
            case 'appointments': return <AppointmentsPage appointments={appointments} updateStatus={updateAppointmentStatus} />;
            case 'payments': return <PaymentsPage payments={payments} />;
            case 'dashboard': default: return <DashboardPage patients={patients} appointments={appointments} payments={payments} />;
        }
    };

    const renderModal = () => {
        if (!isModalOpen) return null;
        switch (modalContent) {
            case 'inviteStaff': return <InviteStaffModal onClose={closeModal} onSubmit={handleInviteStaff} />;
            case 'addPatient': return <AddPatientModal onClose={closeModal} onSubmit={handleAddPatient} />;
            case 'addAppointment': return <AddAppointmentModal onClose={closeModal} onSubmit={handleAddAppointment} patients={patients} />;
            case 'addPayment': return <AddPaymentModal onClose={closeModal} onSubmit={handleAddPayment} patients={patients} />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-100 text-gray-900 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row">
                <Sidebar page={page} setPage={setPage} clinicName={clinic?.name} onLogout={handleLogout} />
                <main className="flex-1 p-4 md:p-8 md:ml-64">
                    <Header page={page} onAddClick={() => openModal(`add${page.charAt(0).toUpperCase() + page.slice(1, -1)}`)} />
                    <div className="mt-8">{renderPage()}</div>
                </main>
            </div>
            {renderModal()}
            <BottomNav page={page} setPage={setPage} onLogout={handleLogout} />
        </div>
    );
};

// --- Top-Level App Component ---
const App = () => {
    const [appState, setAppState] = useState('initializing'); // 'initializing', 'authenticated', 'unauthenticated', 'error', 'email-verification'
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        try {
            if (firebaseConfig.apiKey) {
                const app = initializeApp(firebaseConfig);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);
                setAuth(authInstance);
                setDb(dbInstance);

                const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
                    try {
                        console.log('Auth state changed:', {
                            user: authUser?.email || 'No user',
                            emailVerified: authUser?.emailVerified || false
                        });
                        
                        setUser(authUser);
                        
                        if (authUser) {
                            // IMPORTANT: Check if email is verified
                            if (authUser.emailVerified) {
                                console.log('Email verified - allowing access');
                                setAppState('authenticated');
                            } else {
                                console.log('Email NOT verified - showing verification screen');
                                setAppState('email-verification');
                            }
                        } else {
                            console.log('No user - showing login screen');
                            setAppState('unauthenticated');
                        }
                    } catch (error) {
                        console.error('Error in auth state change:', error);
                        setAppState('error');
                    }
                });
                return () => unsubscribe();
            } else {
                setAppState('error');
            }
        } catch (e) {
            console.error("CRITICAL: Firebase initialization failed.", e);
            setAppState('error');
        }
    }, []);

    const handleLogin = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if email is verified
        if (!userCredential.user.emailVerified) {
            console.log('Login attempt with unverified email');
            // Don't throw error, let the onAuthStateChanged handle showing verification screen
            return userCredential;
        }
        
        console.log('Login successful with verified email');
        return userCredential;
    };

    const handleSignUp = async (email, password, clinicName) => {
        console.log('Starting sign-up process for:', email);
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        console.log('User created:', newUser.email);
        
        // Send verification email
        await sendEmailVerification(newUser);
        console.log('Verification email sent');
        
        // Create clinic and user profile (but user can't access until verified)
        const batch = writeBatch(db);
        const clinicRef = doc(collection(db, "clinics"));
        batch.set(clinicRef, { 
            name: clinicName, 
            ownerId: newUser.uid, 
            createdAt: serverTimestamp(),
            status: 'pending_verification'
        });
        const userProfileRef = doc(db, "users", newUser.uid);
        batch.set(userProfileRef, { 
            email: newUser.email, 
            clinicId: clinicRef.id, 
            role: 'owner',
            createdAt: serverTimestamp()
        });
        await batch.commit();
        console.log('Clinic and user profile created');
        
        // IMMEDIATELY sign out the user so they can't access the app until verified
        await signOut(auth);
        console.log('User signed out - must verify email first');
        
        // Force the auth state to update
        setAppState('unauthenticated');
    };

    const handleForgotPassword = async (email) => sendPasswordResetEmail(auth, email);

    const handleResendVerification = async () => {
        if (user) {
            await sendEmailVerification(user);
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        try {
            if (user && db) {
                await reload(user);
                console.log('After reload - emailVerified:', user.emailVerified);
                if (user.emailVerified) {
                    // Update clinic status to active
                    const userProfileRef = doc(db, "users", user.uid);
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (userProfileSnap.exists()) {
                        const userData = userProfileSnap.data();
                        const clinicRef = doc(db, "clinics", userData.clinicId);
                        await setDoc(clinicRef, { status: 'active' }, { merge: true });
                    }
                    setAppState('authenticated');
                }
            }
        } catch (error) {
            console.error('Error checking verification:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogoutFromVerification = () => {
        signOut(auth);
    };

    const openForgotPasswordModal = () => setIsModalOpen(true);
    const closeForgotPasswordModal = () => setIsModalOpen(false);

    if (appState === 'initializing') {
        return <LoadingSpinner message="Connecting to services..." />;
    }
    
    if (appState === 'error') {
        return <ErrorDisplay message="A critical error occurred. Could not load the application." />;
    }

    if (appState === 'email-verification') {
        return (
            <EmailVerificationScreen 
                user={user}
                db={db}
                onResendVerification={handleResendVerification}
                onCheckVerification={handleCheckVerification}
                onLogout={handleLogoutFromVerification}
            />
        );
    }

    if (appState === 'authenticated') {
        return <MainApp user={user} auth={auth} db={db} />;
    }

    return (
        <>
            <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} onForgotPasswordClick={openForgotPasswordModal} />
            {isModalOpen && <ForgotPasswordModal onClose={closeForgotPasswordModal} onSubmit={handleForgotPassword} />}
        </>
    );
};

// --- All other components remain below, unchanged ---
const SettingsPage = ({ clinic }) => ( <Card> <h3 className="text-xl font-bold mb-4">Clinic Settings</h3> <p className="text-gray-600">This is where you will be able to configure your clinic's profile, subscription, and payment settings.</p> {clinic && ( <div className="mt-6 p-4 bg-gray-50 rounded-lg"> <p><strong>Clinic Name:</strong> {clinic.name}</p> <p><strong>Clinic ID:</strong> {clinic.id}</p> <p><strong>Subscription Plan:</strong> {clinic.subscription?.plan || 'N/A'}</p> </div> )} </Card> );
const StaffPage = ({ staff, onInviteClick, userRole }) => ( <div> <div className="flex justify-end mb-4"> {userRole === 'owner' && ( <button onClick={onInviteClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"> <UserPlus size={20} /> <span>Invite New Member</span> </button> )} </div> <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Email</th> <th className="p-4">Role</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {staff.length > 0 ? staff.map(s => ( <tr key={s.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{s.email}</td> <td className="p-4 text-gray-500 capitalize">{s.role}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="3" className="text-center p-8 text-gray-500">No staff members found.</td></tr>} </tbody> </table> </div> </Card> </div> );
const DashboardPage = ({ patients, appointments, payments }) => { 
    const upcomingAppointments = useMemo(() => 
        appointments.filter(a => a.dateTime && a.dateTime > new Date()).sort((a, b) => a.dateTime - b.dateTime).slice(0, 5), 
        [appointments]
    ); 
    
    const monthlyRevenue = useMemo(() => { 
        const data = {}; 
        payments.forEach(p => { 
            if (p.date) { 
                const month = p.date.toLocaleString('default', { month: 'short', year: '2-digit' }); 
                if (!data[month]) data[month] = 0; 
                data[month] += p.amount || 0; 
            } 
        }); 
        const sortedMonths = Object.keys(data).sort((a, b) => new Date(`1 ${a.replace(' ',' 20')}`) - new Date(`1 ${b.replace(' ',' 20')}`)); 
        return sortedMonths.map(month => ({ name: month, revenue: data[month] })); 
    }, [payments]); 
    
    const stats = [ 
        { title: "Total Patients", value: patients.length, icon: Users }, 
        { title: "Upcoming Appointments", value: appointments.filter(a => a.dateTime && a.dateTime > new Date() && a.status === 'Scheduled').length, icon: Calendar }, 
        { title: "Revenue This Month", value: `Rp${payments.filter(p => p.date && p.date.getMonth() === new Date().getMonth()).reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('id-ID')}`, icon: DollarSign }, 
    ]; 
    
    return ( 
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> 
            {stats.map(stat => ( 
                <div key={stat.title} className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"> 
                    <div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div> 
                    <stat.icon className="w-8 h-8 text-blue-500" />
                </div> 
            ))} 
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md"> 
                <h3 className="font-bold text-lg mb-4">Monthly Revenue</h3> 
                <div style={{ width: '100%', height: 300 }}> 
                    <ResponsiveContainer> 
                        <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> 
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /> 
                            <XAxis dataKey="name" /> 
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)} /> 
                            <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} /> 
                            <Legend /> 
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (Rp)" /> 
                        </BarChart> 
                    </ResponsiveContainer> 
                </div> 
            </div> 
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md"> 
                <h3 className="font-bold text-lg mb-4">Upcoming Appointments</h3> 
                <ul className="space-y-4"> 
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => ( 
                        <li key={app.id} className="flex items-center justify-between"> 
                            <div>
                                <p className="font-semibold">{app.patientName}</p>
                                <p className="text-sm text-gray-500">{app.dateTime.toLocaleString('id-ID')}</p>
                            </div> 
                            <span className="text-sm font-medium text-green-500">{app.status}</span> 
                        </li> 
                    )) : <p className="text-gray-500">No upcoming appointments.</p>} 
                </ul> 
            </div> 
        </div> 
    ); 
};
const PatientsPage = ({ patients }) => ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Name</th> <th className="p-4 hidden md:table-cell">Email</th> <th className="p-4 hidden sm:table-cell">Phone</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {patients.length > 0 ? patients.map(p => ( <tr key={p.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{p.name}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{p.email}</td> <td className="p-4 text-gray-500 hidden sm:table-cell">{p.phone}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No patients found. Add one to get started.</td></tr>} </tbody> </table> </div> </Card> );
const AppointmentsPage = ({ appointments, updateStatus }) => { const sortedAppointments = useMemo(() => [...appointments].sort((a,b) => (b.dateTime || 0) - (a.dateTime || 0)), [appointments]); return ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Patient</th> <th className="p-4 hidden md:table-cell">Date & Time</th> <th className="p-4">Status</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {sortedAppointments.length > 0 ? sortedAppointments.map(a => ( <tr key={a.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{a.patientName}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{a.dateTime ? a.dateTime.toLocaleString('id-ID') : 'No Date'}</td> <td className="p-4"> <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className={`rounded-md px-2 py-1 text-sm font-semibold bg-transparent border ${ a.status === 'Completed' ? 'text-green-600 border-green-600' : a.status === 'Cancelled' ? 'text-red-600 border-red-600' : 'text-blue-600 border-blue-600' }`}> <option value="Scheduled">Scheduled</option> <option value="Completed">Completed</option> <option value="Cancelled">Cancelled</option> </select> </td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No appointments found.</td></tr>} </tbody> </table> </div> </Card> ); };
const PaymentsPage = ({ payments }) => { const sortedPayments = useMemo(() => [...payments].sort((a,b) => (b.date || 0) - (a.date || 0)), [payments]); return ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Patient</th> <th className="p-4 hidden md:table-cell">Date</th> <th className="p-4 hidden sm:table-cell">Method</th> <th className="p-4">Amount</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {sortedPayments.length > 0 ? sortedPayments.map(p => ( <tr key={p.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{p.patientName}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{p.date ? p.date.toLocaleDateString('id-ID') : 'No Date'}</td> <td className="p-4 text-gray-500 hidden sm:table-cell">{p.method}</td> <td className="p-4 font-semibold text-green-600">Rp{p.amount.toLocaleString('id-ID')}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="5" className="text-center p-8 text-gray-500">No payments found.</td></tr>} </tbody> </table> </div> </Card> ); };
const Sidebar = ({ page, setPage, clinicName, onLogout }) => { 
    const navItems = [ 
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, 
        { id: 'staff', label: 'Staff', icon: Briefcase }, 
        { id: 'patients', label: 'Patients', icon: Users }, 
        { id: 'appointments', label: 'Appointments', icon: Calendar }, 
        { id: 'payments', label: 'Payments', icon: DollarSign }, 
        { id: 'settings', label: 'Settings', icon: SettingsIcon }, 
    ]; 
    
    return ( 
        <aside className="hidden md:flex flex-col w-64 bg-white border-r fixed h-full"> 
            <div className="px-8 py-6">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Building />CLINICQ
                </h1>
            </div> 
            <nav className="flex-1 px-4"> 
                <div className="px-4 py-2 mb-2"> 
                    <p className="text-sm text-gray-500">CLINIC</p> 
                    <p className="font-semibold text-lg text-gray-800 truncate">{clinicName || 'Loading...'}</p> 
                </div> 
                {navItems.map(item => ( 
                    <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${ page === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}> 
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span> 
                    </button> 
                ))} 
            </nav> 
            <div className="p-4 border-t">
                <button onClick={onLogout} className="w-full flex items-center text-sm text-red-500 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />Logout
                </button>
            </div> 
        </aside> 
    ); 
};
const BottomNav = ({ page, setPage, onLogout }) => { 
    const navItems = [ 
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, 
        { id: 'staff', label: 'Staff', icon: Briefcase }, 
        { id: 'patients', label: 'Patients', icon: Users }, 
        { id: 'settings', label: 'Settings', icon: SettingsIcon }, 
    ]; 
    
    return ( 
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50"> 
            {navItems.map(item => ( 
                <button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/5 ${ page === item.id ? 'text-blue-600' : 'text-gray-500'}`}> 
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{item.label}</span> 
                </button>
            ))} 
            <button onClick={onLogout} className="flex flex-col items-center p-2 rounded-lg text-red-500 w-1/5">
                <LogOut className="w-6 h-6" />
                <span className="text-xs mt-1">Logout</span>
            </button> 
        </nav> 
    ); 
};
const Header = ({ page, onAddClick }) => { const title = page.charAt(0).toUpperCase() + page.slice(1); const canAdd = ['patients', 'appointments', 'payments'].includes(page); return ( <div className="flex justify-between items-center pb-4 mb-4 md:mb-0 border-b"> <h2 className="text-3xl font-bold">{title}</h2> {canAdd && ( <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"> <PlusCircle size={20} /> <span className="hidden sm:inline">Add New</span> </button> )} </div> ); };
const ForgotPasswordModal = ({ onClose, onSubmit }) => { const [email, setEmail] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); setError(''); setSuccess(false); try { await onSubmit(email); setSuccess(true); } catch (err) { setError(getFriendlyAuthError(err)); } finally { setIsSubmitting(false); } }; return ( <Modal onClose={onClose} title="Reset Your Password"> {success ? ( <div className="text-center"> <Mail className="mx-auto h-12 w-12 text-green-500" /> <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3> <p className="mt-2 text-sm text-gray-500">If an account exists for that email, we have sent instructions to reset your password.</p> <div className="mt-4"> <Button onClick={onClose} className="w-full">Close</Button> </div> </div> ) : ( <form onSubmit={handleSubmit} className="space-y-4"> <p className="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p> <Input label="Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <Button type="submit" className="w-full" disabled={isSubmitting}> {isSubmitting ? 'Sending...' : <><Send className="mr-2" />Send Reset Link</>} </Button> {error && <p className="text-red-500 text-sm text-center">{error}</p>} </form> )} </Modal> ); };
const InviteStaffModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ email: '', role: 'doctor' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Invite New Staff Member"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Select label="Role" name="role" value={formData.role} onChange={handleChange}> <option value="doctor">Doctor</option> <option value="admin">Admin</option> </Select> <Button type="submit" className="w-full"><Send className="mr-2" />Send Invitation</Button> </form> </Modal> ); };
const AddPatientModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ name: '', email: '', phone: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Add New Patient"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required /> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} /> <Button type="submit" className="w-full">Save Patient</Button> </form> </Modal> ); };
const AddAppointmentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', dateTime: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Schedule Appointment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Date and Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} required /> <Button type="submit" className="w-full">Schedule Appointment</Button> </form> </Modal> ); };
const AddPaymentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', amount: '', date: '', method: 'Card' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Record Payment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Amount (IDR)" name="amount" type="number" step="1000" value={formData.amount} onChange={handleChange} required /> <Input label="Payment Date" name="date" type="date" value={formData.date} onChange={handleChange} required /> <Select label="Payment Method" name="method" value={formData.method} onChange={handleChange} required> <option>Card</option> <option>Cash</option> <option>Bank Transfer</option> <option>GoPay</option> </Select> <Button type="submit" className="w-full">Record Payment</Button> </form> </Modal> ); };

export default App;
