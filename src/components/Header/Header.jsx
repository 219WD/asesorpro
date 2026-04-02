import React from 'react';
import usePWAInstall from '../../hooks/usePWAInstall';

const Header = ({ currentMonth }) => {
  const { install, showInstallButton, hasNativePrompt } = usePWAInstall();

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
            background: hasNativePrompt
              ? 'rgba(6,214,160,0.15)'       // verde = puede instalar de verdad
              : 'rgba(124,111,255,0.15)',     // violeta = muestra instrucciones
            border: `1px solid ${hasNativePrompt
              ? 'rgba(6,214,160,0.35)'
              : 'rgba(124,111,255,0.35)'}`,
            borderRadius: 8,
            color: hasNativePrompt ? 'var(--accent3)' : 'var(--accent)',
            fontSize: 11,
            fontFamily: 'var(--sans)',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            letterSpacing: 0.3,
            transition: 'all 0.15s',
          }}
          title={hasNativePrompt ? 'Instalar app' : 'Cómo instalar la app'}
        >
          <span style={{ fontSize: 14 }}>📲</span>
          {hasNativePrompt ? 'Instalar' : 'Instalar app'}
        </button>
      )}
    </header>
  );
};

export default Header;