import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

interface NotificationsPanelProps {
  onClose: () => void;
}

const timeSince = (date: Date, lang: 'es' | 'en') => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return lang === 'es' ? `${Math.floor(interval)} años` : `${Math.floor(interval)} years`;
  interval = seconds / 2592000;
  if (interval > 1) return lang === 'es' ? `${Math.floor(interval)} meses` : `${Math.floor(interval)} months`;
  interval = seconds / 86400;
  if (interval > 1) return lang === 'es' ? `${Math.floor(interval)} días` : `${Math.floor(interval)} days`;
  interval = seconds / 3600;
  if (interval > 1) return lang === 'es' ? `${Math.floor(interval)} horas` : `${Math.floor(interval)} hours`;
  interval = seconds / 60;
  if (interval > 1) return lang === 'es' ? `${Math.floor(interval)} minutos` : `${Math.floor(interval)} minutes`;
  return lang === 'es' ? 'justo ahora' : 'just now';
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { state, dispatch } = useAppContext();
  const { notifications } = state;
  const { t, currentLang } = useTranslation();
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="absolute top-14 right-0 w-80 max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-borde-sutil dark:border-dark-borde z-50">
      <div className="p-4 border-b border-borde-sutil dark:border-dark-borde flex justify-between items-center">
        <h3 className="font-bold text-texto-oscuro dark:text-dark-texto">{t('notificationsTitle')}</h3>
        {hasUnread && (
            <button
                onClick={() => dispatch({ type: 'MARK_NOTIFICATIONS_AS_READ' })}
                className="text-xs font-semibold text-secondary hover:underline"
            >
                {t('notificationsMarkAsRead')}
            </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className={`p-4 border-b border-borde-sutil dark:border-dark-borde ${!notification.read ? 'bg-blue-50 dark:bg-secondary/10' : ''}`}>
              <p className="text-sm text-texto-oscuro dark:text-dark-texto">{notification.text}</p>
              <p className="text-xs text-gray-500 dark:text-dark-texto-sutil mt-1">{timeSince(new Date(notification.date), currentLang)}</p>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-gray-600 dark:text-dark-texto-sutil">{t('notificationsEmpty')}</p>
        )}
      </div>
    </div>
  );
};