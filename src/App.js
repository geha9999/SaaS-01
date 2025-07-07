import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { LogIn, UserPlus, Building, LogOut } from 'lucide-react';

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
const LoadingSpinner = ({ message = "Loading..." }) => (<div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div><p className="mt-4 text-gray-600">{message}</p></div>);
const ErrorDisplay = ({ message }) => (<div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="text-center text-red-500 font-semibold p-4">{message}</div></div>);

// --- Auth Page Component ---
const AuthPage = ({ onLogin, onSignUp }) => {
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
                    <div className="mt-6 text-center">
                        <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-600 hover:underline">
                            {isLoginView ? "Need to register a new clinic?" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Diagnostic View for Logged-In Users ---
const DiagnosticView = ({ user, auth, db }) => {
    const [status, setStatus] = useState('Authenticated. Fetching user profile...');
    const [userProfile, setUserProfile] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !db) return;

        const userProfileRef = doc(db, "users", user.uid);
        const unsubProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                const profileData = { id: docSnap.id, ...docSnap.data() };
                setUserProfile(profileData);
                setStatus('User profile loaded. Fetching clinic data...');

                const clinicRef = doc(db, "clinics", profileData.clinicId);
                const unsubClinic = onSnapshot(clinicRef, (clinicDoc) => {
                    if (clinicDoc.exists()) {
                        setClinic({ id: clinicDoc.id, ...clinicDoc.data() });
                        setStatus('All data loaded successfully. Ready to render dashboard.');
                    } else {
                        setStatus('Error: Clinic data not found for this user.');
                        setError(`Clinic document with ID ${profileData.clinicId} does not exist.`);
                    }
                });
                return () => unsubClinic();
            } else {
                setStatus('Error: User profile document not found in database.');
                setError(`User document with ID ${user.uid} does not exist.`);
                signOut(auth);
            }
        }, (err) => {
            setStatus('Error fetching user profile.');
            setError(err.message);
        });

        return () => unsubProfile();
    }, [user, db, auth]);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SaaS App Diagnostic Mode</h1>
            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
                <p><strong>Auth User:</strong> <span style={{ color: 'green' }}>{user.email}</span></p>
                <p><strong>Status:</strong> <span style={{ color: 'blue' }}>{status}</span></p>
                <div style={{marginTop: '10px'}}>
                    <strong>User Profile Data:</strong>
                    <pre style={{backgroundColor: '#eee', padding: '5px', borderRadius: '4px'}}>{JSON.stringify(userProfile, null, 2)}</pre>
                </div>
                <div style={{marginTop: '10px'}}>
                    <strong>Clinic Data:</strong>
                    <pre style={{backgroundColor: '#eee', padding: '5px', borderRadius: '4px'}}>{JSON.stringify(clinic, null, 2)}</pre>
                </div>
                {error && (
                    <p style={{ marginTop: '10px' }}>
                        <strong>Error Message:</strong> <span style={{ color: 'red' }}>{error}</span>
                    </p>
                )}
            </div>
            <p style={{marginTop: '20px'}}>Please copy all the text from the box above and send it back.</p>
            <Button onClick={() => signOut(auth)} className="mt-4"><LogOut className="mr-2" />Logout</Button>
        </div>
    );
};

// --- Top-Level App Component ---
const App = () => {
    const [appState, setAppState] = useState('initializing');
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
                setUser(authUser);
                setAppState(authUser ? 'authenticated' : 'unauthenticated');
            });
            return () => unsubscribe();
        } catch (e) {
            setAppState('error');
        }
    }, []);

    const handleLogin = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const handleSignUp = async (email, password, clinicName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const batch = writeBatch(db);
        const clinicRef = doc(collection(db, "clinics"));
        batch.set(clinicRef, { name: clinicName, ownerId: newUser.uid, createdAt: serverTimestamp() });
        const userProfileRef = doc(db, "users", newUser.uid);
        batch.set(userProfileRef, { email: newUser.email, clinicId: clinicRef.id, role: 'owner' });
        await batch.commit();
    };

    if (appState === 'initializing') {
        return <LoadingSpinner />;
    }
    
    if (appState === 'error') {
        return <ErrorDisplay message="A critical error occurred. Could not load the application." />;
    }

    if (appState === 'authenticated') {
        return <DiagnosticView user={user} auth={auth} db={db} />;
    }

    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
};

export default App;
