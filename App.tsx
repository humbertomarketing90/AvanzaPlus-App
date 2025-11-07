import React, { useState, useEffect } from 'react';
import { BottomNav, Page as BottomNavPage } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { GoalsPage } from './pages/GoalsPage';
import { WalletPage } from './pages/WalletPage';
import { LessonsPage } from './pages/LessonsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppProvider, useAppContext } from './context/AppContext';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TutorialPage } from './pages/TutorialPage';
import { FaqPage } from './pages/FaqPage';
import { useTranslation } from './hooks/useTranslation';
import { CalculatorHistoryPage } from './pages/CalculatorHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { Header } from './components/Header';
import { ChatModal } from './components/ChatModal';
import { ChecklistPage } from './pages/ChecklistPage';
import { GuidedSetupPage } from './pages/GuidedSetupPage';

export type AppActivePage = BottomNavPage | 'history' | 'wallet' | 'subscription' | 'marketplace' | 'faq' | 'calculatorHistory' | 'settings' | 'checklist' | 'goalsPage' | 'walletPage';
type AuthPage = 'welcome' | 'login' | 'register';

const AuthFlow: React.FC = () => {
  const [authPage, setAuthPage] = useState<AuthPage>('welcome');
  
  switch (authPage) {
    case 'login':
      return <LoginPage setAuthPage={setAuthPage} />;
    case 'register':
      return <RegisterPage setAuthPage={setAuthPage} />;
    default:
      return <WelcomePage setAuthPage={setAuthPage} />;
  }
};


const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<AppActivePage>('home');
  const [viewingLessonId, setViewingLessonId] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { state } = useAppContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (state.user) {
        document.documentElement.lang = state.user.language;
        if (state.user.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
  }, [state.user?.theme, state.user?.language]);

  if (!state.isAuthenticated) {
    return <AuthFlow />;
  }

  if (!state.user) {
    return <div className="text-center p-8">{t('loadingUser')}</div>;
  }
  
  if (!state.user.hasCompletedOnboarding) {
      return <OnboardingPage />;
  }
  if (!state.user.hasCompletedTutorial) {
      return <TutorialPage />;
  }
  if (!state.user.hasCompletedGuidedSetup) {
      return <GuidedSetupPage />;
  }


  const handleSelectLesson = (lessonId: string) => {
    setViewingLessonId(lessonId);
  };

  const handleExitLesson = () => {
    setViewingLessonId(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'goals':
        return <GoalsPage setActivePage={setActivePage} />;
      case 'finanzas':
        return <CalculatorsPage setActivePage={setActivePage} />;
      case 'lessons':
        return <LessonsPage onSelectLesson={handleSelectLesson} setActivePage={setActivePage} />;
      case 'profile':
        return <ProfilePage setActivePage={setActivePage} />;
      case 'walletPage':
        return <WalletPage setActivePage={setActivePage}/>;
       case 'history':
        return <HistoryPage setActivePage={setActivePage} />;
       case 'subscription':
        return <SubscriptionPage setActivePage={setActivePage} />;
       case 'marketplace':
        return <MarketplacePage setActivePage={setActivePage} />;
       case 'faq':
        return <FaqPage setActivePage={setActivePage} />;
       case 'calculatorHistory':
        return <CalculatorHistoryPage setActivePage={setActivePage} />;
       case 'settings':
        return <SettingsPage setActivePage={setActivePage} />;
       case 'checklist':
        return <ChecklistPage setActivePage={setActivePage} />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  const getActiveNavTab = (): BottomNavPage => {
    // This function helps keep the nav tab highlighted correctly even when on a sub-page
    if (['walletPage', 'marketplace', 'calculatorHistory', 'checklist'].includes(activePage)) return 'finanzas';
    if (['history', 'subscription', 'faq', 'settings'].includes(activePage)) return 'profile';
    if (['home', 'goals', 'finanzas', 'lessons', 'profile'].includes(activePage)) {
      return activePage as BottomNavPage;
    }
    return 'home';
  }

  const isNavVisible = !viewingLessonId;
  const isHeaderVisible = isNavVisible && ['home', 'goals', 'finanzas', 'lessons', 'profile'].includes(activePage);

  return (
    <div className="font-poppins bg-fondo dark:bg-dark-fondo text-texto-oscuro dark:text-dark-texto">
      <div className="relative max-w-lg mx-auto bg-fondo dark:bg-dark-fondo min-h-screen shadow-2xl flex flex-col">
        {isHeaderVisible && <Header onOpenChat={() => setIsChatModalOpen(true)}/>}
        <main className="flex-grow">
          {viewingLessonId ? (
             <LessonDetailPage lessonId={viewingLessonId} onBack={handleExitLesson} />
          ) : (
            renderPage()
          )}
        </main>
        {isNavVisible && (
            <BottomNav activePage={getActiveNavTab()} setActivePage={setActivePage as (page: BottomNavPage) => void} />
        )}
      </div>
      <ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;