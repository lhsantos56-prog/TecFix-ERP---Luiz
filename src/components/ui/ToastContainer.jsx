import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

/**
 * Container de notificações toast
 */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notificações" aria-live="polite">
      {toasts.map(({ id, message, type }) => {
        const Icon = ICONS[type] || Info;
        return (
          <div
            key={id}
            className={`toast toast-${type}`}
            role="alert"
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{message}</span>
            <button
              onClick={() => onRemove(id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
                transition: 'opacity 150ms',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
