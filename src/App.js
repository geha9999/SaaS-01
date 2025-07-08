import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, query, where, serverTimestamp, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, LayoutDashboard, PlusCircle, MoreVertical, LogOut, X, UserPlus, LogIn, Building, Briefcase, Send, Mail, Settings as SettingsIcon, Trash2 } from 'lucide-react';

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
    if (!error || !error.code) return 'An unexpected error occurred. Please try again.';
    switch (error.code) {
        case 'auth/email-already-in-use': return 'This email address is already registered. Please try signing in instead.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/user-not-found': return 'No account found with this email. Please check the email or register a new clinic.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'The password is too weak. It must be at least 6 characters long.';
        default: return 'An unexpected error occurred. Please try again.';
    }
};

// --- UI Components ---
const Input = ({ label, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <input {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> );
const Button = ({ children, className = '', ...props }) => ( <button {...props} className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}> {children} </button> );
const Card = ({ children }) => ( <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md"> {children} </div> );
const Modal = ({ children, onClose, title }) => ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}> <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}> <div className="flex justify-between items-center p-4 border-b"> <h3 className="text-xl font-semibold">{title}</h3> <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"> <X size={20} /> </button> </div> <div className="p-6"> {children} </div> </div> </div> );
const Select = ({ label, children, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> <select {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"> {children} </select> </div> );
const LoadingSpinner = ({ message = "Loading..." }) => (<div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div><p className="mt-4 text-gray-600">{message}</p></div>);
const ErrorDisplay = ({ message }) => (<div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="text-center text-red-500 font-semibold p-4">{message}</div></div>);

// --- Auth Page Component ---
const AuthPage = ({ onLogin, onSignUp, onForgotPasswordClick }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', clinicName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError('');
        try {
            if (isLoginView) { await onLogin(formData.email, formData.password); } 
            else { await onSignUp(formData.email, formData.password, formData.clinicName); }
        } catch (error) {
            setAuthError(getFriendlyAuthError(error));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-4xl font-bold text-blue-600 text-center mb-8 flex items-center justify-center gap-2"><Building />TherapySaaS</h1>
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
    const [pendingInvitations, setPendingInvitations] = useState([]);
    
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

        unsubscribers.push(onSnapshot(doc(db, "clinics", clinicId), (snap) => setClinic(snap.exists() ? {id: snap.id, ...snap.data()} : null) ));
        unsubscribers.push(onSnapshot(query(collection(db, "users"), where("clinicId", "==", clinicId)), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))) ));
        unsubscribers.push(onSnapshot(query(collection(db, "invitations"), where("clinicId", "==", clinicId), where("status", "==", "pending")), (snap) => setPendingInvitations(snap.docs.map(d => ({ id: d.id, ...d.data() }))) ));
        
        return () => unsubscribers.forEach(unsub => unsub());
    }, [userProfile, db]);

    // --- Actions ---
    const handleLogout = () => signOut(auth);
    const openModal = (type) => { setIsModalOpen(true); setModalContent(type); };
    const closeModal = () => { setIsModalOpen(false); setModalContent(null); };

    const handleInviteStaff = async ({ email, role }) => {
        if (!db || !userProfile || !clinic) {
            alert("Error: Not logged in or clinic data missing.");
            return;
        }
        
        // Call the backend helper to send the email
        try {
            const response = await fetch('/api/send-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email, clinicName: clinic.name, role }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email.');
            }

            // If email sends successfully, create the invitation in the database
            await addDoc(collection(db, "invitations"), {
                clinicId: userProfile.clinicId,
                clinicName: clinic.name,
                invitedBy: user.uid,
                email: email.toLowerCase(),
                role: role,
                status: "pending",
                createdAt: serverTimestamp()
            });
            
            alert(`Invitation sent to ${email}!`);
            closeModal();
        } catch (e) {
            console.error("Error in invitation process: ", e);
            alert("Failed to send invitation. Please check the email address and try again.");
        }
    };

    const handleDeleteInvitation = async (invitationId) => {
        if (!db) return;
        if(window.confirm("Are you sure you want to delete this invitation?")) {
            await deleteDoc(doc(db, "invitations", invitationId));
        }
    };
    
    if (!userProfile || !clinic) {
        return <LoadingSpinner message="Loading Clinic Data..." />;
    }

    const renderPage = () => {
        switch (page) {
            case 'settings': return <SettingsPage onManageStaffClick={() => setPage('staff')} />;
            case 'staff': return <StaffPage staff={staff} pendingInvitations={pendingInvitations} onInviteClick={() => openModal('inviteStaff')} onDeleteInvitation={handleDeleteInvitation} userRole={userProfile.role}/>;
            default: return <DashboardPage />;
        }
    };

    const renderModal = () => {
        if (!isModalOpen) return null;
        switch (modalContent) {
            case 'inviteStaff': return <InviteStaffModal onClose={closeModal} onSubmit={handleInviteStaff} />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-100 text-gray-900 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row">
                <Sidebar page={page} setPage={setPage} clinicName={clinic?.name} onLogout={handleLogout} />
                <main className="flex-1 p-4 md:p-8 md:ml-64">
                    <Header page={page} />
                    <div className="mt-8">{renderPage()}</div>
                </main>
            </div>
            {renderModal()}
            <BottomNav page={page} setPage={setPage} onLogout={handleLogout} />
        </div>
    );
};


// --- Top-Level App Component (Rebuilt for Stability) ---
const App = () => {
    const [appState, setAppState] = useState('initializing');
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
        const invitationsRef = collection(db, "invitations");
        const q = query(invitationsRef, where("email", "==", email.toLowerCase()), where("status", "==", "pending"));
        const invitationSnapshot = await getDocs(q);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const batch = writeBatch(db);

        if (!invitationSnapshot.empty) {
            const invitationDoc = invitationSnapshot.docs[0];
            const invitationData = invitationDoc.data();
            const userProfileRef = doc(db, "users", newUser.uid);
            batch.set(userProfileRef, { email: newUser.email, clinicId: invitationData.clinicId, role: invitationData.role });
            batch.delete(invitationDoc.ref);
        } else {
            const clinicRef = doc(collection(db, "clinics"));
            batch.set(clinicRef, { name: clinicName, ownerId: newUser.uid, createdAt: serverTimestamp() });
            const userProfileRef = doc(db, "users", newUser.uid);
            batch.set(userProfileRef, { email: newUser.email, clinicId: clinicRef.id, role: 'owner' });
        }
        
        await batch.commit();
    };
    const handleForgotPassword = async (email) => sendPasswordResetEmail(auth, email);

    const openForgotPasswordModal = () => setIsModalOpen(true);
    const closeForgotPasswordModal = () => setIsModalOpen(false);

    if (appState === 'initializing') {
        return <LoadingSpinner message="Connecting to services..." />;
    }
    
    if (appState === 'error') {
        return <ErrorDisplay message="A critical error occurred. Could not load the application." />;
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
const SettingsPage = ({ onManageStaffClick }) => ( <Card> <h3 className="text-xl font-bold mb-4">Clinic Settings</h3> <p className="text-gray-600 mb-6">Manage your clinic profile, staff, and subscription here.</p> <Button onClick={onManageStaffClick}><Briefcase className="mr-2"/> Manage Staff</Button> </Card> );
const StaffPage = ({ staff, pendingInvitations, onInviteClick, onDeleteInvitation, userRole }) => (
    <div>
        {userRole === 'owner' && (
            <div className="flex justify-end mb-4">
                <button onClick={onInviteClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow">
                    <UserPlus size={20} /> <span>Invite New Member</span>
                </button>
            </div>
        )}
        <Card>
            <h3 className="text-lg font-semibold mb-4">Current Staff</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead> <tr className="border-b"> <th className="p-4">Email</th> <th className="p-4">Role</th> <th className="p-4">Actions</th> </tr> </thead>
                    <tbody>
                        {staff.length > 0 ? staff.map(s => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{s.email}</td>
                                <td className="p-4 text-gray-500 capitalize">{s.role}</td>
                                <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200"><MoreVertical size={18} /></button></td>
                            </tr>
                        )) : <tr><td colSpan="3" className="text-center p-8 text-gray-500">No staff members found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </Card>
        <div className="mt-8">
            <Card>
                <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead> <tr className="border-b"> <th className="p-4">Email</th> <th className="p-4">Role</th> <th className="p-4">Actions</th> </tr> </thead>
                        <tbody>
                            {pendingInvitations.length > 0 ? pendingInvitations.map(i => (
                                <tr key={i.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{i.email}</td>
                                    <td className="p-4 text-gray-500 capitalize">{i.role}</td>
                                    <td className="p-4">
                                        <button onClick={() => onDeleteInvitation(i.id)} className="p-2 text-red-500 rounded-full hover:bg-red-100"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="3" className="text-center p-8 text-gray-500">No pending invitations.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    </div>
);
const DashboardPage = ({ patients, appointments, payments }) => { const upcomingAppointments = useMemo(() => appointments.filter(a => a.dateTime && a.dateTime > new Date()).sort((a, b) => a.dateTime - b.dateTime).slice(0, 5), [appointments]); const monthlyRevenue = useMemo(() => { const data = {}; payments.forEach(p => { if (p.date) { const month = p.date.toLocaleString('default', { month: 'short', year: '2-digit' }); if (!data[month]) data[month] = 0; data[month] += p.amount; } }); const sortedMonths = Object.keys(data).sort((a, b) => new Date(`1 ${a.replace(' ',' 20')}`) - new Date(`1 ${b.replace(' ',' 20')}`)); return sortedMonths.map(month => ({ name: month, revenue: data[month] })); }, [payments]); const stats = [ { title: "Total Patients", value: patients.length, icon: Users }, { title: "Upcoming Appointments", value: upcomingAppointments.length, icon: Calendar }, { title: "Revenue This Month", value: `Rp${payments.filter(p => p.date && p.date.getMonth() === new Date().getMonth()).reduce((acc, p) => acc + p.amount, 0).toLocaleString('id-ID')}`, icon: DollarSign }, ]; return ( <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> {stats.map(stat => ( <div key={stat.title} className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"> <div><p className="text-sm text-gray-500">{stat.title}</p><p className="text-2xl font-bold">{stat.value}</p></div> {React.createElement(stat.icon, { className: "w-8 h-8 text-blue-500" })} </div> ))} </div> ); };
const PatientsPage = ({ patients }) => ( <Card> <h3 className="text-xl font-bold mb-4">Patients</h3> <p>{patients.length} patients.</p> </Card> );
const AppointmentsPage = ({ appointments }) => ( <Card> <h3 className="text-xl font-bold mb-4">Appointments</h3> <p>{appointments.length} appointments.</p> </Card> );
const PaymentsPage = ({ payments }) => ( <Card> <h3 className="text-xl font-bold mb-4">Payments</h3> <p>{payments.length} payments.</p> </Card> );
const Sidebar = ({ page, setPage, clinicName, onLogout }) => { const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'appointments', label: 'Appointments', icon: Calendar }, { id: 'payments', label: 'Payments', icon: DollarSign }, { id: 'settings', label: 'Settings', icon: SettingsIcon }, ]; return ( <aside className="hidden md:flex flex-col w-64 bg-white border-r fixed h-full"> <div className="px-8 py-6"><h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2"><Building />TherapySaaS</h1></div> <nav className="flex-1 px-4"> <div className="px-4 py-2 mb-2"> <p className="text-sm text-gray-500">CLINIC</p> <p className="font-semibold text-lg text-gray-800 truncate">{clinicName || 'Loading...'}</p> </div> {navItems.map(item => ( <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${ page === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}> {React.createElement(item.icon, { className: "w-5 h-5 mr-3" })} <span className="font-medium">{item.label}</span> </button> ))} </nav> <div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center text-sm text-red-500 hover:text-red-700"><LogOut className="w-4 h-4 mr-2" />Logout</button></div> </aside> ); };
const BottomNav = ({ page, setPage, onLogout }) => { const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'settings', label: 'Settings', icon: SettingsIcon }, ]; return ( <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50"> {navItems.map(item => ( <button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/3 ${ page === item.id ? 'text-blue-600' : 'text-gray-500'}`}> {React.createElement(item.icon, { className: "w-6 h-6" })} <span className="text-xs mt-1">{item.label}</span> </button>))} <button onClick={onLogout} className="flex flex-col items-center p-2 rounded-lg text-red-500 w-1/3"><LogOut className="w-6 h-6" /><span className="text-xs mt-1">Logout</span></button> </nav> ); };
const Header = ({ page }) => { const title = page.charAt(0).toUpperCase() + page.slice(1); return ( <div className="flex justify-between items-center pb-4 mb-4 md:mb-0 border-b"> <h2 className="text-3xl font-bold">{title}</h2> </div> ); };
const ForgotPasswordModal = ({ onClose, onSubmit }) => { const [email, setEmail] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); setError(''); setSuccess(false); try { await onSubmit(email); setSuccess(true); } catch (err) { setError(getFriendlyAuthError(err)); } finally { setIsSubmitting(false); } }; return ( <Modal onClose={onClose} title="Reset Your Password"> {success ? ( <div className="text-center"> <Mail className="mx-auto h-12 w-12 text-green-500" /> <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3> <p className="mt-2 text-sm text-gray-500">If an account exists for that email, we have sent instructions to reset your password.</p> <div className="mt-4"> <Button onClick={onClose} className="w-full">Close</Button> </div> </div> ) : ( <form onSubmit={handleSubmit} className="space-y-4"> <p className="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p> <Input label="Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <Button type="submit" className="w-full" disabled={isSubmitting}> {isSubmitting ? 'Sending...' : <><Send className="mr-2" />Send Reset Link</>} </Button> {error && <p className="text-red-500 text-sm text-center">{error}</p>} </form> )} </Modal> ); };
const InviteStaffModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ email: '', role: 'doctor' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Invite New Staff Member"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Select label="Role" name="role" value={formData.role} onChange={handleChange}> <option value="doctor">Doctor</option> <option value="admin">Admin</option> </Select> <Button type="submit" className="w-full"><Send className="mr-2" />Send Invitation</Button> </form> </Modal> ); };
const AddPatientModal = ({ onClose, onSubmit }) => { const [formData, setFormData] = useState({ name: '', email: '', phone: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Add New Patient"> <form onSubmit={handleSubmit} className="space-y-4"> <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required /> <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required /> <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} /> <Button type="submit" className="w-full">Save Patient</Button> </form> </Modal> ); };
const AddAppointmentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', dateTime: '' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Schedule Appointment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Date and Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} required /> <Button type="submit" className="w-full">Schedule Appointment</Button> </form> </Modal> ); };
const AddPaymentModal = ({ onClose, onSubmit, patients }) => { const [formData, setFormData] = useState({ patientId: '', amount: '', date: '', method: 'Card' }); const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value }); const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); }; return ( <Modal onClose={onClose} title="Record Payment"> <form onSubmit={handleSubmit} className="space-y-4"> <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required> <option value="" disabled>Select a patient</option> {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </Select> <Input label="Amount (IDR)" name="amount" type="number" step="1000" value={formData.amount} onChange={handleChange} required /> <Input label="Payment Date" name="date" type="date" value={formData.date} onChange={handleChange} required /> <Select label="Payment Method" name="method" value={formData.method} onChange={handleChange} required> <option>Card</option> <option>Cash</option> <option>Bank Transfer</option> <option>GoPay</option> </Select> <Button type="submit" className="w-full">Record Payment</Button> </form> </Modal> ); };

export default App;
