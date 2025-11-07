import React, { useState, useEffect } from 'react';
import { AppActivePage } from '../App';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language, Currency, SUPPORTED_CURRENCIES, NotificationPreferences } from '../types';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { StarIcon } from '../components/Icons';

interface SettingsPageProps {
  setActivePage: (page: AppActivePage) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { t } = useTranslation();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [language, setLanguage] = useState(user?.language || 'es');
    const [currency, setCurrency] = useState(user?.currency || SUPPORTED_CURRENCIES[0]);
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(user?.notificationPreferences || { dailyStreak: true, newLessons: true, goalMilestones: true });
    
    useEffect(() => {
        if(user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setLanguage(user.language);
            setCurrency(user.currency);
            setNotificationPrefs(user.notificationPreferences);
        }
    }, [user]);

    if (!user) {
        return <div>{t('loadingUser')}</div>;
    }
    
    const handleSave = () => {
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                currency,
                language,
                notificationPreferences: notificationPrefs,
            }
        });
        setActivePage('profile');
    };
    
    const handleReonboarding = () => {
        dispatch({ type: 'START_REONBOARDING' });
    }

    const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
        setNotificationPrefs(prev => ({...prev, [key]: value}));
    }

    return (
        <div className="p-4 pb-24">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-texto-oscuro dark:text-dark-texto">{t('settingsTitle')}</h1>
                    <p className="text-gray-600 dark:text-dark-texto-sutil">{t('settingsSubtitle')}</p>
                </div>
                <button 
                    onClick={() => setActivePage('profile')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    {t('settingsGoBack')}
                </button>
            </header>
            
            <div className="space-y-6">
                {/* Personal Info */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-texto-oscuro dark:text-dark-texto mb-4">{t('settingsPersonalInfoTitle')}</h2>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="name-input" className="block text-xs font-medium text-gray-500 dark:text-dark-texto-sutil">{t('settingsNameLabel')}</label>
                            <input id="name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                        </div>
                        <div>
                            <label htmlFor="email-input" className="block text-xs font-medium text-gray-500 dark:text-dark-texto-sutil">{t('settingsEmailLabel')}</label>
                            <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                        </div>
                        <div>
                            <label htmlFor="phone-input" className="block text-xs font-medium text-gray-500 dark:text-dark-texto-sutil">{t('settingsPhoneLabel')}</label>
                            <input id="phone-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                        </div>
                    </div>
                </div>

                {/* App Preferences */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-texto-oscuro dark:text-dark-texto mb-4">{t('settingsAppPreferencesTitle')}</h2>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="currency-select" className="block text-xs font-medium text-gray-500 dark:text-dark-texto-sutil">{t('settingsCurrencyLabel')}</label>
                            <select id="currency-select" value={currency.code} onChange={(e) => setCurrency(SUPPORTED_CURRENCIES.find(c => c.code === e.target.value) || currency)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="lang-select" className="block text-xs font-medium text-gray-500 dark:text-dark-texto-sutil">{t('settingsLanguageLabel')}</label>
                            <select id="lang-select" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                 {/* Notifications */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-texto-oscuro dark:text-dark-texto mb-2">{t('settingsNotificationsTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-dark-texto-sutil mb-4">{t('settingsNotificationsDesc')}</p>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="font-medium text-sm text-texto-oscuro dark:text-dark-texto">{t('settingsNotificationStreak')}</span>
                           <ToggleSwitch id="notif-streak" checked={notificationPrefs.dailyStreak} onChange={(v) => handleNotificationChange('dailyStreak', v)} />
                       </div>
                        <div className="flex justify-between items-center">
                           <span className="font-medium text-sm text-texto-oscuro dark:text-dark-texto">{t('settingsNotificationLessons')}</span>
                           <ToggleSwitch id="notif-lessons" checked={notificationPrefs.newLessons} onChange={(v) => handleNotificationChange('newLessons', v)} />
                       </div>
                        <div className="flex justify-between items-center">
                           <span className="font-medium text-sm text-texto-oscuro dark:text-dark-texto">{t('settingsNotificationGoals')}</span>
                           <ToggleSwitch id="notif-goals" checked={notificationPrefs.goalMilestones} onChange={(v) => handleNotificationChange('goalMilestones', v)} />
                       </div>
                    </div>
                </div>

                {/* Financial Profile */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-texto-oscuro dark:text-dark-texto mb-2">{t('settingsFinancialProfileTitle')}</h2>
                    <p className="text-sm text-gray-600 dark:text-dark-texto-sutil mb-4">{t('settingsFinancialProfileDesc')}</p>
                    <button onClick={handleReonboarding} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-secondary/80 transition-colors">
                        {t('settingsReonboardingButton')}
                    </button>
                </div>
                
                 {/* Rewards */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-texto-oscuro dark:text-dark-texto mb-2">{t('settingsRewardsTitle')}</h2>
                     <div className="flex justify-between items-center bg-borde-sutil dark:bg-dark-borde p-3 rounded-lg mb-4">
                        <span className="font-medium text-sm text-texto-oscuro dark:text-dark-texto">{t('settingsCurrentPoints')}</span>
                        <div className="flex items-center gap-1 font-bold text-primary">
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current"/>
                            {user.points}
                        </div>
                    </div>
                    <button disabled className="w-full bg-gray-300 dark:bg-dark-borde text-gray-500 dark:text-dark-texto-sutil font-bold py-2 px-4 rounded-xl cursor-not-allowed">
                        {t('settingsRedeemButton')}
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors shadow-md mt-4"
                >
                    {t('settingsSaveButton')}
                </button>
            </div>
        </div>
    );
};