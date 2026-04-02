import { useState, useEffect } from 'react';

const LS_KEY = 'pwa_installed';

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Si ya está instalada como standalone, no hacer nada
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem(LS_KEY) === 'true'
    ) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(LS_KEY, 'true');
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        localStorage.setItem(LS_KEY, 'true');
      }
      setDeferredPrompt(null);
    });
  };

  // Solo true cuando el browser realmente tiene el prompt listo
  const showInstallButton = !!deferredPrompt;

  return { install, showInstallButton };
}