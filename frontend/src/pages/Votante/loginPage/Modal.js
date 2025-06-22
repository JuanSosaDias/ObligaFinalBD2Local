import React from 'react';
import './Modal.css'; // Asegurate de importarlo

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose} title="Cerrar">×</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
