import React from 'react';

const Toast = ({ toasts }) => (
  <div style={{ position: 'relative', zIndex: 100 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        margin: '8px 20px 0',
        background: 'var(--surface)',
        border: `1px solid var(--border2)`,
        borderLeft: `3px solid ${t.color}`,
        borderRadius: 'var(--radius-sm)',
        padding: '9px 13px',
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        animation: 'fadeIn .2s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>
          {t.color === '#ff6b6b' ? '⚠️' : '✓'}
        </span>
        <span style={{ color: 'var(--text2)' }}>{t.msg}</span>
      </div>
    ))}
  </div>
);

export default Toast;