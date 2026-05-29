export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function showNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    // Use service worker for better mobile support
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: title, // prevents duplicate notifications with same title
      });
    } else {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
  } catch {
    try { new Notification(title, { body }); } catch { /* silently fail */ }
  }
}
