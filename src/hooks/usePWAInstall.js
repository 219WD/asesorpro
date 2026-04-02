import { useState, useEffect } from 'react';

const LS_KEY = 'pwa_installed';

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled]       = useState(false);

  useEffect(() => {
    // ¿Ya está corriendo como app instalada (standalone)?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      localStorage.setItem(LS_KEY, 'true');
      setIsInstalled(true);
      return;
    }

    // ¿El usuario ya la instaló antes?
    if (localStorage.getItem(LS_KEY) === 'true') {
      setIsInstalled(true);
      return;
    }

    // Capturar el prompt nativo si el browser lo ofrece
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      localStorage.setItem(LS_KEY, 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      // Flujo nativo: Chrome Android / Edge desktop
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(LS_KEY, 'true');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: instrucciones para instalar manualmente
      alert(
        '📲 Para instalar en Chrome desktop:\n\n' +
        '1. Fijate en la barra de direcciones si aparece un ícono ⊕\n' +
        '2. O hacé clic en los tres puntitos (⋮) → "Instalar Asesor Financiero Pro"\n\n' +
        '💡 En localhost Chrome es muy restrictivo. ' +
        'El botón nativo funciona automático una vez que deployes en HTTPS (Vercel, Netlify, etc.).'
      );
    }
  };

  return {
    install,
    showInstallButton: !isInstalled,
    hasNativePrompt: !!deferredPrompt,
  };
}