// C:\qhatu\frontend\src\components\ui\card\Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`.trim()}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`.trim()}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`.trim()}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`.trim()}>
    {children}
  </h3>
);

Card.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardContent.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardHeader.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardTitle.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };

export { Card, CardContent, CardHeader, CardTitle };