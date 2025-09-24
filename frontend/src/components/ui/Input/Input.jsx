import React from 'react';
import './Input.css'; // O incluir en AuthModals.css

function Input({ label, type, value, onChange, required, className = '', placeholder, ...props }) {
return (
    <div className={`input-group ${className}`}>
    <label className="form-label">{label}</label>
    <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-input ${className}`}
        placeholder={placeholder}
        {...props}
    />
    </div>
);
}

export default Input;