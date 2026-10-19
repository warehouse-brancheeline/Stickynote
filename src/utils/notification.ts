export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showDesktopNotification(title: string, body: string, onClick?: () => void) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: 'https://api.iconify.design/lucide:alarm-clock.svg?color=%230078d4',
        badge: 'https://api.iconify.design/lucide:bell.svg?color=%230078d4',
        silent: false,
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }
    } catch (err) {
      console.warn('Desktop notification could not be shown:', err);
    }
  }
}
