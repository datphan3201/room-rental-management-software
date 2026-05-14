import React from 'react';
import { Modal } from './Modal.jsx';

export function ActionButton({ onClick, label = 'Actions' }) {
  return (
    <button type="button" className="action-trigger" onClick={onClick} aria-label={label}>
      <span aria-hidden="true">...</span>
      <span>{label}</span>
    </button>
  );
}

export function ActionDialog({ open, title, description, actions = [], onClose }) {
  const visibleActions = actions.filter(Boolean);

  return (
    <Modal open={open} title={title} onClose={onClose} className="action-dialog">
      {description ? <p className="muted action-dialog-description">{description}</p> : null}
      <div className="action-dialog-list">
        {visibleActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`action-dialog-item ${action.variant === 'danger' ? 'danger' : ''}`}
            disabled={action.disabled}
            onClick={() => {
              onClose();
              action.onClick?.();
            }}
          >
            <span>{action.label}</span>
            {action.hint ? <small>{action.hint}</small> : null}
          </button>
        ))}
      </div>
    </Modal>
  );
}
