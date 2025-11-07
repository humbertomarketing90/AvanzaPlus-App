import React, { useState, useRef } from 'react';
import { Badge } from '../types';
import { PencilIcon, LogoutIcon, HistoryIcon, StarIcon, QuestionMarkCircleIcon, MoonIcon, CogIcon, CreditCardIcon, BookOpenIcon, LinkIcon, ChevronRightIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { AppActivePage } from '../App';
import { BADGES } from '../utils/gamification';
import { useTranslation } from '../hooks/useTranslation';

interface ProfilePageProps {
    setActivePage: (page: AppActivePage) => void;
}

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    BookOpenIcon: BookOpenIcon,
    LinkIcon: LinkIcon,
};


const BadgeDisplay: React.FC<{ badge: Badge }> = ({ badge }) => {
    const MinimalistIcon = iconMap[badge.icon] || StarIcon;

    return (
        <div className="bg-primary/10 dark:bg-dark-borde p-3 rounded-xl text-left flex items-center space-x-3">
             <div className="w-10 h-10 bg-white dark:bg-dark-surface text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <MinimalistIcon className="w-6 h-6" />
            </div>
            <div>
                <p className="font-semibold text-sm text-texto-oscuro dark:text-dark-texto leading-tight">{badge.name}</p>
                <p className="text-xs text-gray-500 dark:text-dark-texto-sutil mt-1 line-clamp-1">{badge.description}</p>
            </div>
        </div>
    );
};


const ThemeToggle: React.FC = () => {
    const { state, dispatch } = useAppContext();
    return (
        <button 
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="text-texto-sutil dark:text-dark-texto-sutil"
            aria-label="Cambiar tema"
        >
            <MoonIcon className="w-6 h-6"/>
        </button>
    );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { t } = useTranslation();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    if (!user) return null;
    
    const isPremium = user.subscriptionTier === 'premium';
    const userBadges = BADGES.filter(b => user.badges.includes(b.id));

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    dispatch({ type: 'UPDATE_USER_PROFILE', payload: { avatar: event.target.result as string }});
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const profileLinks = [
        { labelKey: "profileSettingsLink", icon: CogIcon, action: () => setActivePage('settings') },
        { labelKey: "profileSubscriptionLink", icon: CreditCardIcon, action: () => setActivePage('subscription') },
        { labelKey: "profileHistoryLink", icon: HistoryIcon, action: () => setActivePage('history') },
        { labelKey: "profileHelpLink", icon: QuestionMarkCircleIcon, action: () => setActivePage('faq') },
    ];

    return (
        <div className="p-4 pb-24">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-4 flex items-center space-x-4">
                <div className="relative group">
                    <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-borde-sutil dark:border-dark-borde" />
                     <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity"
                        aria-label={t('profileEditAvatar')}
                    >
                        <PencilIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden"/>
                </div>
                <div>
                     <h1 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto">{user.name}</h1>
                     <p className="text-sm text-gray-500 dark:text-dark-texto-sutil">{user.email}</p>
                     <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full mt-1 inline-block">{user.level}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4">
                     <p className="text-sm text-texto-sutil dark:text-dark-texto-sutil">Tema de la Aplicación</p>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-sm font-medium">Cambia entre modo claro y oscuro</p>
                        <ThemeToggle />
                     </div>
                </div>
                 <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4">
                    <div className="flex items-center space-x-2">
                        <StarIcon className={`w-5 h-5 ${isPremium ? 'text-yellow-500' : 'text-texto-sutil'}`}/>
                        <p className="text-sm text-texto-sutil dark:text-dark-texto-sutil">{isPremium ? t('profilePremiumPlan') : t('profileFreePlan')}</p>
                    </div>
                    <p className="text-sm font-medium mt-1">{isPremium ? t('profilePremiumDescription') : t('profileFreeDescription')}</p>
                    <button
                        onClick={() => setActivePage('subscription')}
                        className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg mt-2 ${isPremium ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                        {isPremium ? t('profileManageButton') : t('profileUpgradeButton')}
                    </button>
                 </div>
            </div>

            <div className="mb-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-texto-oscuro dark:text-dark-texto mb-3 text-left">{t('profileMyBadges')}</h3>
                {userBadges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {userBadges.map(badge => <BadgeDisplay key={badge.id} badge={badge} />)}
                    </div>
                ) : (
                    <p className="text-center text-sm text-gray-600 dark:text-dark-texto-sutil py-4">{t('profileNoBadges')}</p>
                )}
            </div>

             <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 space-y-2">
                {profileLinks.map(link => (
                    <button key={link.labelKey} onClick={link.action} className="w-full flex items-center p-2 hover:bg-borde-sutil/50 dark:hover:bg-dark-borde/50 rounded-lg transition-colors">
                        <link.icon className="w-6 h-6 text-texto-sutil dark:text-dark-texto-sutil"/>
                        <span className="ml-3 font-semibold text-texto-oscuro dark:text-dark-texto">{t(link.labelKey as any)}</span>
                        <ChevronRightIcon className="w-5 h-5 text-texto-sutil dark:text-dark-texto-sutil ml-auto"/>
                    </button>
                ))}
             </div>

             <div className="mt-4">
                 <button 
                    onClick={() => dispatch({ type: 'LOGOUT' })} 
                    className="w-full flex items-center p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                    <LogoutIcon className="w-6 h-6 text-danger"/>
                    <span className="ml-3 font-semibold text-danger">{t('profileLogout')}</span>
                </button>
            </div>
        </div>
    );
};