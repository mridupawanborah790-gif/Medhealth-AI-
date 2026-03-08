import { getRandomQuote } from './quotes';

/**
 * Checks if the browser supports the Notification API.
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Requests permission from the user to send notifications.
 * @returns A promise that resolves to the user's permission choice ('granted', 'denied', or 'default').
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported.');
        return 'denied';
    }
    
    // If permission is not 'default', it has already been set.
    if (Notification.permission !== 'default') {
        return Notification.permission;
    }

    // Request permission.
    const permission = await Notification.requestPermission();
    return permission;
};


/**
 * Sends a notification IF permission has already been granted.
 * It does not request permission.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @returns true if the notification was sent, false otherwise.
 */
export const sendAppNotification = (title: string, body: string): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }
  
  new Notification(title, {
    body: body,
    icon: '/vite.svg',
  });
  return true;
};


/**
 * Sends a motivational notification.
 */
export const sendMotivationalNotification = () => {
    const quote = getRandomQuote();
    return sendAppNotification('MedHealth AI Motivation', quote);
}