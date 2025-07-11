// src/components/auth/AuthPage.js
import React, { useState } from 'react';
import { Building, LogIn, UserPlus } from 'lucide-react';
import { getFriendlyAuthError } from '../../utils/authHelpers';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RegistrationSuccessScreen from './RegistrationSuccessScreen';

const AuthPage = ({ onLogin, onSignUp, onForgotPasswordClick }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', clinicName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear form when switching between login/signup
    const switchAuthMode = () => {
        setIsLoginView(!isLoginView);
        setFormData({ email: '', password: '', clinicName: '' }); // Clear form
        setAuthError(''); // Clear errors
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError('');
        
        try {
            if (isLoginView) { 
                await onLogin(formData.email, formData.password); 
            } else { 
                const result = await onSignUp(formData.email, formData.password, formData.clinicName);
                if (result && result.success) {
                    setRegisteredEmail(result.email);
                    setShowSuccessScreen(true);
                    // Clear form after successful signup
                    setFormData({ email: '', password: '', clinicName: '' });
                }
            }
        } catch (error) {
            setAuthError(getFriendlyAuthError(error));
        } finally {
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
                <h1 className="text-4xl font-bold text-blue-600 text-center mb-8 flex items-center justify-center gap-2">
                    <Building />CLINICQ
                </h1>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                        {isLoginView ? 'Clinic Portal Login' : 'Register Your Clinic'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        {!isLoginView && (
                            <Input 
                                label="Clinic Name" 
                                name="clinicName" 
                                type="text" 
                                value={formData.clinicName} 
                                onChange={handleChange} 
                                required 
                                placeholder="Enter your clinic name"
                            />
                        )}
                        
                        <Input 
                            label="Your Email Address" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="Enter your email"
                        />
                        
                        <Input 
                            label="Password" 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder={isLoginView ? "Enter your password" : "Create a password (6+ characters)"}
                        />
                        
                        <Button type="submit" className="w-full !mt-6" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    {isLoginView ? 'Signing In...' : 'Creating Account...'}
                                </div>
                            ) : (
                                isLoginView ? (
                                    <>
                                        <LogIn className="mr-2"/> Sign In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2"/> Register Clinic
                                    </>
                                )
                            )}
                        </Button>
                        
                        {authError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mt-4">
                                {authError}
                            </div>
                        )}
                    </form>
                    
                    <div className="mt-6 text-center text-sm">
                        {isLoginView && (
                            <button 
                                onClick={onForgotPasswordClick} 
                                className="text-blue-600 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-4 text-center">
                        <button 
                            onClick={switchAuthMode} 
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {isLoginView 
                                ? "Need to register a new clinic?" 
                                : "Already have an account? Sign In"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
