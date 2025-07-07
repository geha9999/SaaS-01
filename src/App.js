import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
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

// --- Simplified UI Components ---
const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const Button = ({ children, className = '', ...props }) => (
    <button {...props} className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

// --- Login/Sign-Up Page ---
const AuthPage = ({ onLogin, onSignUp }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', clinicName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            if (isLoginView) {
                await onLogin(formData.email, formData.password);
            } else {
                await onSignUp(formData.email, formData.password, formData.clinicName);
            }
        } catch (err) {
            setError(getFriendlyAuthError(err));
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
                        {!isLoginView && <Input label="Clinic Name" name="clinicName" type="text" value={formData.clinicName} onChange={handleChange} required />}
                        <Input label="Your Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <Button type="submit" className="w-full !mt-6" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : (isLoginView ? <><LogIn className="mr-2" /> Sign In</> : <><UserPlus className="mr-2" /> Register Clinic</>)}
                        </Button>
                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
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

// --- Simple Logged-In View ---
const LoggedInView = ({ user, onLogout }) => (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-2xl font-bold">Login Successful!</h1>
            <p className="mt-4">Welcome, <span className="font-mono text-green-600">{user.email}</span></p>
            <p className="mt-2 text-sm text-gray-500">The application foundation is now stable.</p>
            <Button onClick={onLogout} className="w-full mt-6">
                <LogOut className="mr-2" /> Logout
            </Button>
        </div>
    </div>
);


// --- Main App Component (Rebuilt for Stability) ---
const App = () => {
    const [isLoading, setIsLoading] = useState(true);
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
                setIsLoading(false);
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("CRITICAL: Firebase initialization failed.", e);
            setIsLoading(false); 
        }
    }, []);

    const handleLogin = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

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

    const handleLogout = () => {
        signOut(auth);
    };

    if (isLoading) {
        return <div className="h-screen w-screen flex justify-center items-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    
    if (user) {
        return <LoggedInView user={user} onLogout={handleLogout} />;
    }

    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
};

export default App;
