// src/components/ui/Input.js
import React from 'react';

const Input = ({ label, ...props }) => ( 
    <div> 
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label> 
        <input 
            {...props} 
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
        /> 
    </div> 
);

export default Input;
