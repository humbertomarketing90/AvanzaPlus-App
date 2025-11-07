import React, { useState } from 'react';
import { BellIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../context/AppContext';
import { NotificationsPanel } from './NotificationsPanel';

interface HeaderProps {
    onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChat }) => {
    const { state } = useAppContext();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    const hasUnreadNotifications = state.notifications.some(n => !n.read);

    return (
        <header className="sticky top-0 bg-fondo/80 dark:bg-dark-fondo/80 backdrop-blur-sm z-40 p-4 flex justify-between items-center border-b border-borde-sutil dark:border-dark-borde">
            <h1 className="text-xl font-bold text-primary">AVANZAPLUS</h1>
            <div className="flex items-center space-x-2">
                <button onClick={onOpenChat} className="p-2 rounded-full hover:bg-borde-sutil dark:hover:bg-dark-borde relative" aria-label="Abrir AP Coach">
                    <SparklesIcon className="w-6 h-6 text-texto-sutil dark:text-dark-texto-sutil" />
                     {state.user?.subscriptionTier === 'premium' && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-secondary border-2 border-fondo dark:border-dark-fondo"></span>
                    )}
                </button>
                <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-borde-sutil dark:hover:bg-dark-borde" aria-label="Abrir notificaciones">
                        <BellIcon className="w-6 h-6 text-texto-sutil dark:text-dark-texto-sutil" />
                        {hasUnreadNotifications && (
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger border-2 border-fondo dark:border-dark-fondo"></span>
                        )}
                    </button>
                    {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
                </div>
            </div>
        </header>
    );
};