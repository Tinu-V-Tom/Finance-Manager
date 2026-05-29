import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function UpdateBanner() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      setReg(registration);

      // New SW waiting means update is ready
      if (registration.waiting) {
        setNeedsUpdate(true);
        return;
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedsUpdate(true);
          }
        });
      });
    });

    // When SW takes control, reload to activate new version
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  function handleUpdate() {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setNeedsUpdate(false);
  }

  if (!needsUpdate) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] px-4 pt-3">
      <div className="bg-blue-700 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-blue-900/30">
        <RefreshCw size={18} className="shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Update available</p>
          <p className="text-xs text-blue-200">New version ready to install</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-white text-blue-700 rounded-xl text-xs font-bold active:scale-95 transition-transform"
        >
          Update now
        </button>
      </div>
    </div>
  );
}
