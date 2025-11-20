// components/Modal.jsx
import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', // 'small' | 'medium' | 'large'
  footer 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer (opcional) */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

/* 
CSS ESPECIFICACIONES (Modal.css):
- .modal-overlay: position fixed, top 0, left 0, right 0, bottom 0, background rgba(0,0,0,0.5), display flex, align-items center, justify-content center, z-index 1000
- .modal-content: background white, border-radius 12px, box-shadow 0 10px 40px rgba(0,0,0,0.2), max-height 90vh, overflow-y auto
- .modal-small: width 400px
- .modal-medium: width 600px
- .modal-large: width 800px
- .modal-header: display flex, justify-content space-between, align-items center, padding 20px, border-bottom 1px solid #ecf0f1
- .modal-title: margin 0, font-size 20px, font-weight 600, color #2c3e50
- .modal-close: background none, border none, font-size 24px, color #7f8c8d, cursor pointer, padding 0, width 30px, height 30px
- .modal-close:hover: color #e74c3c
- .modal-body: padding 20px
- .modal-footer: padding 20px, border-top 1px solid #ecf0f1, display flex, justify-content flex-end, gap 10px
*/