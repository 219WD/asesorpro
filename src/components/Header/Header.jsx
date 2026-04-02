import React from 'react';
import usePWAInstall from '../../hooks/usePWAInstall';

const Header = ({ currentMonth }) => {
  const { install, showInstallButton } = usePWAInstall();

  return (
    <header className="hdr">
      <div className="hdr-icon">💎</div>
      <div style={{ flex: 1 }}>
        <h1>Asesor Financiero Pro</h1>
        <p>método 50/30/20 · personalizable · inteligente</p>
      </div>

      {showInstallButton && (
        <button
          onClick={install}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            background: 'rgba(6,214,160,0.15)',
            border: '1px solid rgba(6,214,160,0.35)',
            borderRadius: 8,
            color: 'var(--accent3)',
            fontSize: 11,
            fontFamily: 'var(--sans)',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            letterSpacing: 0.3,
          }}
        >
          <span style={{ fontSize: 14 }}>📲</span>
          Instalar app
        </button>
      )}
    </header>
  );
};

export default Header;