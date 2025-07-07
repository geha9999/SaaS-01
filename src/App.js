import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, query, where, serverTimestamp, getDoc, writeBatch } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, LayoutDashboard, PlusCircle, MoreVertical, LogOut, X, UserPlus, LogIn, Building, Briefcase, Send, ShieldCheck, Mail, Settings as SettingsIcon } from 'lucide-react';

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
    if (!error || !error.code) {
        return 'An unexpected error occurred. Please check your connection and try again.';
    }
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email address is already registered. Please try signing in instead.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please check the email or register a new clinic.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'The password is too weak. It must be at least 6 characters long.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};

// --- Authentication Page Component ---
const AuthPage = ({ onLogin, onSignUp, onForgotPasswordClick }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', clinicName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');
    
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        setCaptcha({ num1: Math.ceil(Math.random() * 10), num2: Math.ceil(Math.random() * 10), answer: '' });
        setIsCaptchaSolved(false);
    };

    const handleCaptchaChange = (e) => {
        const userAnswer = e.target.value;
        setCaptcha(prev => ({ ...prev, answer: userAnswer }));
        if (parseInt(userAnswer, 10) === captcha.num1 + captcha.num2) {
            setIsCaptchaSolved(true);
        } else {
            setIsCaptchaSolved(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isCaptchaSolved) {
            setAuthError("Please solve the security question correctly.");
            return;
        }
        setIsSubmitting(true);
        setAuthError('');
        try {
            if (isLoginView) {
                await onLogin(formData.email, formData.password);
            } else {
                await onSignUp(formData.email, formData.password, formData.clinicName);
            }
        } catch (error) {
            setAuthError(getFriendlyAuthError(error));
            setIsSubmitting(false);
            generateCaptcha();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-4xl font-bold text-blue-600 text-center mb-8 flex items-center justify-center gap-2"><Building />TherapySaaS</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">{isLoginView ? 'Clinic Portal Login' : 'Register Your Clinic'}</h2>
                    <p className="text-center text-gray-500 mb-6">{isLoginView ? 'Sign in to manage your clinic' : 'to start your 30-day free trial'}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginView && (<Input label="Clinic Name" name="clinicName" type="text" value={formData.clinicName} onChange={handleChange} required />)}
                        <Input label="Your Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        
                        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                           <label htmlFor="captcha" className="text-gray-600 font-medium">
                                <ShieldCheck className="inline-block mr-2 text-green-500" size={20}/>
                                What is {captcha.num1} + {captcha.num2}?
                           </label>
                           <input id="captcha" type="number" value={captcha.answer} onChange={handleCaptchaChange} className="w-20 p-2 text-center border rounded-md focus:ring-2 focus:ring-blue-500" required />
                        </div>

                        <Button type="submit" className="w-full !mt-6" disabled={isSubmitting || !isCaptchaSolved}>
                            {isSubmitting ? 'Processing...' : (isLoginView ? <><LogIn className="mr-2"/> Sign In</> : <><UserPlus className="mr-2"/> Register Clinic</>)}
                        </Button>
                        {authError && <p className="text-red-500 text-sm mt-4 text-center">{authError}</p>}
                    </form>
                    <div className="mt-6 text-center text-sm">
                        {isLoginView ? (
                            <button onClick={onForgotPasswordClick} className="text-blue-600 hover:underline">Forgot Password?</button>
                        ) : null}
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); generateCaptcha(); }} className="text-sm text-blue-600 hover:underline">{isLoginView ? "Need to register a new clinic?" : "Already have an account? Sign In"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Application View (for logged-in users) ---
const MainApp = ({ user, auth, db }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [staff, setStaff] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);
    
    // UI State
    const [page, setPage] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // --- Data Fetching Logic ---
    useEffect(() => {
        if (!user || !db) return;

        const userProfileRef = doc(db, "users", user.uid);
        const unsubProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                const profileData = { id: docSnap.id, ...docSnap.data() };
                setUserProfile(profileData);
            } else {
                // Inconsistent state, log out
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
        
        setIsLoading(false);
        
        return () => unsubscribers.forEach(unsub => unsub());
    }, [userProfile, db]);

    // --- User Actions ---
    const handleLogout = () => signOut(auth);
    const handleInviteStaff = async ({ email, role }) => {
        if (!db || !userProfile || !clinic) return;
        try {
            await addDoc(collection(db, "invitations"), {
                clinicId: userProfile.clinicId, clinicName: clinic.name, invitedBy: user.uid, email: email.toLowerCase(), role: role, status: "pending", createdAt: serverTimestamp()
            });
            alert(`Invitation sent to ${email}!`);
            closeModal();
        } catch (e) {
            alert("Failed to send invitation.");
        }
    };
    const handleForgotPassword = async (email) => {
        if (!auth) throw new Error("Authentication service not ready.");
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw error;
        }
    };

    // --- Data Submission Handlers ---
    const getClinicId = () => userProfile?.clinicId;
    const handleAddPatient = async (patientData) => {
        const clinicId = getClinicId();
        if (!db || !clinicId) return;
        await addDoc(collection(db, `clinics/${clinicId}/patients`), { ...patientData, createdAt: serverTimestamp() });
        closeModal();
    };
    const handleAddAppointment = async (appointmentData) => {
        const clinicId = getClinicId();
        if (!db || !clinicId) return;
        const selectedPatient = patients.find(p => p.id === appointmentData.patientId);
        await addDoc(collection(db, `clinics/${clinicId}/appointments`), {
            ...appointmentData, patientName: selectedPatient?.name || 'Unknown', dateTime: new Date(appointmentData.dateTime), status: 'Scheduled', createdAt: serverTimestamp()
        });
        closeModal();
    };
    const handleAddPayment = async (paymentData) => {
        const clinicId = getClinicId();
        if (!db || !clinicId) return;
        const selectedPatient = patients.find(p => p.id === paymentData.patientId);
        await addDoc(collection(db, `clinics/${clinicId}/payments`), {
            ...paymentData, patientName: selectedPatient?.name || 'Unknown', amount: parseFloat(paymentData.amount), date: new Date(paymentData.date), status: 'Paid', createdAt: serverTimestamp()
        });
        closeModal();
    };
    const updateAppointmentStatus = async (id, status) => {
        const clinicId = getClinicId();
        if (!db || !clinicId) return;
        await setDoc(doc(db, `clinics/${clinicId}/appointments`, id), { status }, { merge: true });
    };

    // --- Modal and Page Rendering ---
    const openModal = (type) => { setIsModalOpen(true); setModalContent(type); };
    const closeModal = () => { setIsModalOpen(false); setModalContent(null); };

    if (isLoading) {
        return <div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
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
            case 'forgotPassword': return <ForgotPasswordModal onClose={closeModal} onSubmit={handleForgotPassword} />;
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
                    <div className="mt-8">
                        {renderPage()}
                    </div>
                </main>
            </div>
            {renderModal()}
            <BottomNav page={page} setPage={setPage} onLogout={handleLogout} />
        </div>
    );
};


// --- Top-Level App Component (Rebuilt) ---
const App = () => {
    const [appState, setAppState] = useState('initializing'); // 'initializing', 'authenticated', 'unauthenticated', 'error'
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            if (firebaseConfig.apiKey) {
                const app = initializeApp(firebaseConfig);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);
                setAuth(authInstance);
                setDb(dbInstance);

                const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
                    setAppState(authUser ? 'authenticated' : 'unauthenticated');
                    setUser(authUser);
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

    const handleLogin = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const handleSignUp = async (email, password, clinicName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const batch = writeBatch(db);
        const clinicRef = doc(collection(db, "clinics"));
        batch.set(clinicRef, { name: clinicName, ownerId: newUser.uid, createdAt: serverTimestamp(), subscription: { plan: 'free', status: 'active' } });
        const userProfileRef = doc(db, "users", newUser.uid);
        batch.set(userProfileRef, { email: newUser.email, clinicId: clinicRef.id, role: 'owner' });
        await batch.commit();
    };
    const handleForgotPassword = (email) => sendPasswordResetEmail(auth, email);

    if (appState === 'initializing') {
        return <div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    if (appState === 'error') {
        return <div className="h-screen w-screen flex justify-center items-center bg-gray-100"><p className="text-red-500">A critical error occurred. Could not load the application.</p></div>;
    }

    if (appState === 'authenticated') {
        return <MainApp user={user} auth={auth} db={db} />;
    }

    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} onForgotPasswordClick={() => alert("Forgot Password modal needs to be implemented in the new structure.")} />;
};


// --- Pages & Components (largely unchanged, just need to exist) ---
const SettingsPage = ({ clinic }) => ( <Card> <h3 className="text-xl font-bold mb-4">Clinic Settings</h3> <p className="text-gray-600">This is where you will be able to configure your clinic's profile, subscription, and payment settings.</p> {clinic && ( <div className="mt-6 p-4 bg-gray-50 rounded-lg"> <p><strong>Clinic Name:</strong> {clinic.name}</p> <p><strong>Clinic ID:</strong> {clinic.id}</p> <p><strong>Subscription Plan:</strong> {clinic.subscription?.plan || 'N/A'}</p> </div> )} </Card> );
const StaffPage = ({ staff, onInviteClick, userRole }) => ( <div> <div className="flex justify-end mb-4"> {userRole === 'owner' && ( <button onClick={onInviteClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"> <UserPlus size={20} /> <span>Invite New Member</span> </button> )} </div> <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Email</th> <th className="p-4">Role</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {staff.length > 0 ? staff.map(s => ( <tr key={s.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{s.email}</td> <td className="p-4 text-gray-500 capitalize">{s.role}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="3" className="text-center p-8 text-gray-500">No staff members found.</td></tr>} </tbody> </table> </div> </Card> </div> );
const DashboardPage = ({ patients, appointments, payments }) => { const upcomingAppointments = useMemo(() => appointments.filter(a => a.dateTime && a.dateTime > new Date()).sort((a, b) => a.dateTime - b.dateTime).slice(0, 5), [appointments]); const monthlyRevenue = useMemo(() => { const data = {}; payments.forEach(p => { if (p.date) { const month = p.date.toLocaleString('default', { month: 'short', year: '2-digit' }); if (!data[month]) data[month] = 0; data[month] += p.amount; } }); const sortedMonths = Object.keys(data).sort((a, b) => new Date(`1 ${a.replace(' ',' 20')}`) - new Date(`1 ${b.replace(' ',' 20')}`)); return sortedMonths.map(month => ({ name: month, revenue: data[month] })); }, [payments]); const stats = [ { title: "Total Patients", value: patients.length, icon: <Users className="w-8 h-8 text-blue-500" /> }, { title: "Upcoming Appointments", value: appointments.filter(a => a.dateTime && a.dateTime > new Date() && a.status === 'Scheduled').length, icon: <Calendar className="w-8 h-8 text-green-500" /> }, { title: "Revenue This Month", value: `Rp${payments.filter(p => p.date && p.date.getMonth() === new Date().getMonth()).reduce((acc, p) => acc + p.amount, 0).toLocaleString('id-ID')}`, icon: <DollarSign className="w-8 h-8 text-yellow-500" /> }, ]; return ( <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> {stats.map(stat => ( <div key={stat.title} className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"> <div><p className="text-sm text-gray-500">{stat.title}</p><p className="text-2xl font-bold">{stat.value}</p></div> <stat.icon /> </div> ))} <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md"> <h3 className="font-bold text-lg mb-4">Monthly Revenue</h3> <div style={{ width: '100%', height: 300 }}> <ResponsiveContainer> <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /> <XAxis dataKey="name" /> <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)} /> <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} /> <Legend /> <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (Rp)" /> </BarChart> </ResponsiveContainer> </div> </div> <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md"> <h3 className="font-bold text-lg mb-4">Upcoming Appointments</h3> <ul className="space-y-4"> {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => ( <li key={app.id} className="flex items-center justify-between"> <div><p className="font-semibold">{app.patientName}</p><p className="text-sm text-gray-500">{app.dateTime.toLocaleString('id-ID')}</p></div> <span className="text-sm font-medium text-green-500">{app.status}</span> </li> )) : <p className="text-gray-500">No upcoming appointments.</p>} </ul> </div> </div> ); };
const PatientsPage = ({ patients }) => ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Name</th> <th className="p-4 hidden md:table-cell">Email</th> <th className="p-4 hidden sm:table-cell">Phone</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {patients.length > 0 ? patients.map(p => ( <tr key={p.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{p.name}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{p.email}</td> <td className="p-4 text-gray-500 hidden sm:table-cell">{p.phone}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No patients found. Add one to get started.</td></tr>} </tbody> </table> </div> </Card> );
const AppointmentsPage = ({ appointments, updateStatus }) => { const sortedAppointments = useMemo(() => [...appointments].sort((a,b) => (b.dateTime || 0) - (a.dateTime || 0)), [appointments]); return ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Patient</th> <th className="p-4 hidden md:table-cell">Date & Time</th> <th className="p-4">Status</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {sortedAppointments.length > 0 ? sortedAppointments.map(a => ( <tr key={a.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{a.patientName}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{a.dateTime ? a.dateTime.toLocaleString('id-ID') : 'No Date'}</td> <td className="p-4"> <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className={`rounded-md px-2 py-1 text-sm font-semibold bg-transparent border ${ a.status === 'Completed' ? 'text-green-600 border-green-600' : a.status === 'Cancelled' ? 'text-red-600 border-red-600' : 'text-blue-600 border-blue-600' }`}> <option value="Scheduled">Scheduled</option> <option value="Completed">Completed</option> <option value="Cancelled">Cancelled</option> </select> </td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No appointments found.</td></tr>} </tbody> </table> </div> </Card> ); };
const PaymentsPage = ({ payments }) => { const sortedPayments = useMemo(() => [...payments].sort((a,b) => (b.date || 0) - (a.date || 0)), [payments]); return ( <Card> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead> <tr className="border-b"> <th className="p-4">Patient</th> <th className="p-4 hidden md:table-cell">Date</th> <th className="p-4 hidden sm:table-cell">Method</th> <th className="p-4">Amount</th> <th className="p-4">Actions</th> </tr> </thead> <tbody> {sortedPayments.length > 0 ? sortedPayments.map(p => ( <tr key={p.id} className="border-b hover:bg-gray-50"> <td className="p-4 font-medium">{p.patientName}</td> <td className="p-4 text-gray-500 hidden md:table-cell">{p.date ? p.date.toLocaleDateString('id-ID') : 'No Date'}</td> <td className="p-4 text-gray-500 hidden sm:table-cell">{p.method}</td> <td className="p-4 font-semibold text-green-600">Rp{p.amount.toLocaleString('id-ID')}</td> <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td> </tr> )) : <tr><td colSpan="5" className="text-center p-8 text-gray-500">No payments found.</td></tr>} </tbody> </table> </div> </Card> ); };
const Sidebar = ({ page, setPage, clinicName, onLogout }) => { const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'staff', label: 'Staff', icon: Briefcase }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'appointments', label: 'Appointments', icon: Calendar }, { id: 'payments', label: 'Payments', icon: DollarSign }, { id: 'settings', label: 'Settings', icon: SettingsIcon }, ]; return ( <aside className="hidden md:flex flex-col w-64 bg-white border-r fixed h-full"> <div className="px-8 py-6"><h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2"><Building />TherapySaaS</h1></div> <nav className="flex-1 px-4"> <div className="px-4 py-2 mb-2"> <p className="text-sm text-gray-500">CLINIC</p> <p className="font-semibold text-lg text-gray-800 truncate">{clinicName || 'Loading...'}</p> </div> {navItems.map(item => ( <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${ page === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}> <item.icon className="w-5 h-5 mr-3" /> <span className="font-medium">{item.label}</span> </button> ))} </nav> <div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center text-sm text-red-500 hover:text-red-700"><LogOut className="w-4 h-4 mr-2" />Logout</button></div> </aside> ); };
const BottomNav = ({ page, setPage, onLogout }) => { const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'staff', label: 'Staff', icon: Briefcase }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'settings', label: 'Settings', icon: SettingsIcon }, ]; return ( <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50"> {navItems.map(item => ( <button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/5 ${ page === item.id ? 'text-blue-600' : 'text-gray-500'}`}> <item.icon className="w-6 h-6" /> <span className="text-xs mt-1">{item.label}</span> </button> ))} <button onClick={onLogout} className="flex flex-col items-center p-2 rounded-lg text-red-500 w-1/5"><LogOut className="w-6 h-6" /><span className="text-xs mt-1">Logout</span></button> </nav> ); };
const Header = ({ page, onAddClick }) => { const title = page.charAt(0).toUpperCase() + page.slice(1); const canAdd = ['patients', 'appointments', 'payments'].includes(page); return ( <div className="flex justify-between items-center pb-4 mb-4 md:mb-0 border-b"> <h2 className="text-3xl font-bold">{title}</h2> {canAdd && ( <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"> <PlusCircle size={20} /> <span className="hidden sm:inline">Add New</span> </button> )} </div> ); };
const Card = ({ children }) => ( <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md"> {children} </div> );
const Modal = ({ children, onClose, title }) => ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}> <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}> <div className="flex justify-between items-center p-4 border-b"> <h3 className="text-xl font-semibold">{title}</h3> <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"> <X size={20} /> </button> </div> <div className="p-6"> {children} </div> </div> </div> );
const ForgotPasswordModal = ({ onClose, onSubmit }) => { const [email, setEmail] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); setError(''); setSuccess(false); try { await onSubmit(email); setSuccess(true); } catch (err) { setError(getFriendlyAuthError(err)); } finally { setIsSubmitting(false); } }; return ( <Modal onClose={onClose} title="Reset Your Password"> {success ? ( <div className="text-center"> <Mail className="mx-auto h-12 w-12 text-green-500" /> <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3> <p className="mt-2 text-sm text-gray-500">If an account exists for that email, we have sent instructions to reset your password.</p> <div className="mt-4"> <Button onClick={onClose} className="w-full">Close</Button> </div> </div> ) : ( <form onSubmit={handleSubmit} className="space-y-4"> <p className="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p> <Input label="Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <Button type="submit" className="w-full" disabled={isSubmitting}> {isSubmitting ? 'Sending...' : <><Send className="mr-2" />Send Reset Link</>} </Button> {error && <p className="text-red-500 text-sm text-center">{error}</p>} </form> )} </Modal> ); };
const InviteStaffModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ email: '', role: 'doctor' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Invite New Staff Member"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Select label="Role" name="role" value={formData.role} onChange={handleChange}> <option value="doctor">Doctor</option> <option value="admin">Admin</option> </Select> <Button type="submit" className="w-full"><Send className="mr-2" />Send Invitation</Button> </form> </Modal> ); };
const AddPatientModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ name: '', email: '', phone: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Add New Patient"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required /> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} /> <Button type="submit" className="w-full">Save Patient</Button> </form> </Modal> ); };
const AddAppointmentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', dateTime: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Schedule Appointment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Date and Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} required /> <Button type="submit" className="w-full">Schedule Appointment</Button> </form> </Modal> ); };
const AddPaymentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', amount: '', date: '', method: 'Card' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Record Payment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Amount (IDR)" name="amount" type="number" step="1000" value={formData.amount} onChange={handleChange} required /> <Input label="Payment Date" name="date" type="date" value={formData.date} onChange={handleChange} required /> <Select label="Payment Method" name="method" value={formData.method} onChange={handleChange} required> <option>Card</option> <option>Cash</option> <option>Bank Transfer</option> <option>GoPay</option> </Select> <Button type="submit" className="w-full">Record Payment</Button> </form> </Modal> ); };
const Input = ({ label, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <input {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> );
const Select = ({ label, children, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <select {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"> {children} </select> </div> );
const Button = ({ children, className = '', ...props }) => ( <button {...props} className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}> {children} </button> );

export default App;
