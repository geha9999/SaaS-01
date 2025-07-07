import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

// --- Main Diagnostic App Component ---
const App = () => {
    const [appState, setAppState] = useState('Initializing...');
    const [userEmail, setUserEmail] = useState('None');
    const [errorMessage, setErrorMessage] = useState('');
    const [authService, setAuth] = useState(null);

    useEffect(() => {
        try {
            if (!firebaseConfig || !firebaseConfig.apiKey) {
                setAppState('Error: Firebase config is missing!');
                return;
            }
            
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            setAuth(auth);
            setAppState('Firebase Initialized. Waiting for Auth...');

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserEmail(user.email);
                    setAppState('Authenticated. User is present.');
                } else {
                    setUserEmail('None');
                    setAppState('Unauthenticated. No user is signed in.');
                }
            });

            return () => unsubscribe();
        } catch (e) {
            console.error(e);
            setAppState('CRITICAL ERROR during initialization.');
            setErrorMessage(e.message);
        }
    }, []);

    const handleTestLogin = async () => {
        if (!authService) {
            setErrorMessage("Auth service not available.");
            return;
        }
        setErrorMessage('');
        setAppState('Attempting test login...');
        try {
            // NOTE: Use the credentials for the account you already created
            await signInWithEmailAndPassword(authService, 'your-test-email@example.com', 'your-test-password');
            // onAuthStateChanged will handle the state change if successful
        } catch (error) {
            setAppState('Test Login Failed.');
            setErrorMessage(error.code + ": " + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SaaS App Diagnostic Mode</h1>
            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p><strong>Current App State:</strong> <span style={{ color: 'blue' }}>{appState}</span></p>
                <p><strong>Authenticated User:</strong> <span style={{ color: 'green' }}>{userEmail}</span></p>
                {errorMessage && (
                    <p style={{ marginTop: '10px' }}>
                        <strong>Error Message:</strong> <span style={{ color: 'red' }}>{errorMessage}</span>
                    </p>
                )}
            </div>
            <div style={{marginTop: '20px'}}>
                <p>This is a temporary page to diagnose the problem. Please copy all the text you see here and send it back to me.</p>
                <button 
                    onClick={handleTestLogin} 
                    style={{ marginTop: '10px', padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Run Test Login (Optional)
                </button>
                <p style={{fontSize: '12px', marginTop: '5px'}}>Note: You must edit the email/password in the code to use the test button.</p>
            </div>
        </div>
    );
};

export default App;
