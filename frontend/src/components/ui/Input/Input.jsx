import React from 'react';
import './Input.css';

function Input({ type, label, value, onChange, required, name }) {
return (
    <div className="input-container">
    {label && <label>{label}</label>}
    <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        name={name}
        className="input"
    />
    </div>
);
}

export default Input;