// src/utils/authHelpers.js

// Helper function for user-friendly error messages
export const getFriendlyAuthError = (error) => {
    console.log('Auth error details:', error);
    if (!error || !error.code) return 'An unexpected error occurred. Please try again.';
    
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
        case 'auth/invalid-credential': 
            return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/invalid-login-credentials': 
            return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/too-many-requests': 
            return 'Too many failed attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed': 
            return 'Network error. Please check your internet connection.';
        case 'auth/user-disabled': 
            return 'This account has been disabled. Please contact support.';
        default: 
            return `Authentication error: ${error.message || 'Please try again.'}`;
    }
};

// Define the SaaS owner email
export const SAAS_OWNER_EMAIL = 'alteaworld.io@gmail.com';
