import React from 'react';
import { HomeIcon, ProfileIcon, TargetIcon, WalletIcon, BookOpenIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

export type Page = 'home' | 'goals' | 'finanzas' | 'lessons' | 'profile';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useTranslation();

  const navItems: { page: Page; labelKey: 'navHome' | 'navGoals' | 'navFinance' | 'navLessons' | 'navProfile'; icon: React.FC<{ className?: string }> }[] = [
    { page: 'home', labelKey: 'navHome', icon: HomeIcon },
    { page: 'goals', labelKey: 'navGoals', icon: TargetIcon },
    { page: 'finanzas', labelKey: 'navFinance', icon: WalletIcon },
    { page: 'lessons', labelKey: 'navLessons', icon: BookOpenIcon },
    { page: 'profile', labelKey: 'navProfile', icon: ProfileIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-dark-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-none dark:border-t dark:border-dark-borde flex justify-around items-start pt-3">
      {navItems.map((item) => {
        const isActive = activePage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className="flex flex-col items-center justify-center w-1/5 transition-colors duration-200 space-y-1"
            aria-label={t(item.labelKey)}
          >
            <item.icon className={`w-7 h-7 ${isActive ? 'text-primary' : 'text-texto-sutil/60 dark:text-dark-texto-sutil'}`} />
            <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-texto-sutil/80 dark:text-dark-texto-sutil'}`}>
              {t(item.labelKey)}
            </span>
            {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
          </button>
        );
      })}
    </nav>
  );
};