
import React, { useState, useEffect } from 'react';
import { isNotificationSupported, requestNotificationPermission, sendAppNotification, sendMotivationalNotification } from '../../utils/notifications';

export const NotificationButton: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (isNotificationSupported()) {
            setPermission(Notification.permission);
        } else {
            setIsSupported(false);
        }
    }, []);

    const handleClick = async () => {
        if (!isSupported) {
            alert('Sorry, your browser does not support notifications.');
            return;
        }

        if (permission === 'granted') {
            sendMotivationalNotification();
            return;
        }

        if (permission === 'denied') {
            alert('Notifications are blocked. Please enable them in your browser settings to receive daily motivation.');
            return;
        }
        
        // If permission is 'default', request it.
        try {
            const newPermission = await requestNotificationPermission();
            setPermission(newPermission); // Update state with the user's choice.

            if (newPermission === 'granted') {
                sendAppNotification('Welcome to MedHealth Notifications!', 'You will now receive motivational quotes and alerts.');
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            alert("There was an issue enabling notifications.");
        }
    };

    const getIcon = () => {
        if (!isSupported) return '🔕';
        switch (permission) {
            case 'granted':
                return '🔔'; // Bell
            case 'denied':
                return '🔕'; // Bell with slash
            default:
                return '🔔'; // Bell (indicates can be enabled)
        }
    };
    
    const getTooltip = () => {
        if (!isSupported) return 'Notifications not supported';
         switch (permission) {
            case 'granted':
                return 'Get a motivational quote!';
            case 'denied':
                return 'Notifications are disabled';
            default:
                return 'Click to enable notifications';
        }
    };

    return (
        <button 
            onClick={handleClick}
            title={getTooltip()}
            className="text-2xl p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
            {getIcon()}
        </button>
    );
};