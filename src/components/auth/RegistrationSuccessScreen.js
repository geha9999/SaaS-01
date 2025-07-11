// src/components/auth/RegistrationSuccessScreen.js
import React from 'react';
import { CheckCircle, LogIn } from 'lucide-react';
import Button from '../ui/Button';

const RegistrationSuccessScreen = ({ email, onBackToLogin }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Registration Successful!</h2>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <p className="text-green-800 text-sm font-medium mb-2">✅ Account Created Successfully</p>
                        <p className="text-green-700 text-sm">
                            Your clinic account has been created for:
                        </p>
                        <p className="font-semibold text-green-800 mt-1 break-all">
                            {email}
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-blue-800 text-sm font-medium mb-2">📧 Next Steps:</p>
                        <ol className="text-blue-700 text-sm text-left space-y-1">
                            <li>1. Check your email inbox (and spam folder)</li>
                            <li>2. Find the CLINICQ verification email</li>
                            <li>3. Click the verification link</li>
                            <li>4. Return here and sign in</li>
                        </ol>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        <strong>Important:</strong> You must verify your email before you can access CLINICQ.
                    </p>

                    <Button onClick={onBackToLogin} className="w-full">
                        <LogIn className="mr-2" size={20} />
                        Back to Sign In
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-4">
                        Having trouble? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccessScreen;
