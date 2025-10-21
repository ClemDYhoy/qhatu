// C:\qhatu\frontend\src\components\ui\Button\Button.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Asegúrate de que esté instalado con `npm install prop-types`
import './Button.css';

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) => {
  const handleClick = (e) => {
    if (disabled || !onClick) return;
    onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`button ${className}`.trim()}
      aria-disabled={disabled}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Button.defaultProps = {
  type: 'button',
  onClick: undefined,
  disabled: false,
  className: '',
};

export default Button; // Exportación por defecto explícita