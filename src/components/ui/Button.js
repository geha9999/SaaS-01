// src/components/ui/Button.js
import React from 'react';

const Button = ({ children, className = '', ...props }) => ( 
    <button 
        {...props} 
        className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    > 
        {children} 
    </button> 
);

export default Button;
