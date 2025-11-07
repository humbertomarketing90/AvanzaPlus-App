import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ActionPlanItem, formatCurrency } from '../types';
import { FireIcon, LinkIcon, DocumentTextIcon, CollectionIcon, ChartPieIcon, ChecklistIcon } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';
import { AppActivePage } from '../App';
import { UpdateCreditProfileModal } from '../components/UpdateCreditProfileModal';
import { getNewActionPlan } from '../services/geminiService';

const ActionPlan: React.FC<{ plan: ActionPlanItem[] }> = ({ plan }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { t } = useTranslation();

    if (user?.needsNewActionPlan) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm font-semibold text-texto-sutil dark:text-dark-texto-sutil">Analizando tu progreso y generando nuevos pasos...</p>
            </div>
        );
    }
    
    const completedCount = plan.filter(item => item.completed).length;
    const progress = (completedCount / plan.length) * 100;

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-texto-oscuro dark:text-dark-texto">{t('homeActionPlanTitle')}</h2>
                 <span className="text-sm font-semibold text-gray-500 dark:text-dark-texto-sutil">{completedCount}/{plan.length}</span>
            </div>
             <div className="w-full bg-borde-sutil rounded-full h-1.5 mb-4">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <ul className="space-y-3">
                {plan.map(item => (
                    <li key={item.id} className="flex items-center">
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_ACTION_PLAN_ITEM', payload: { itemId: item.id } })}
                            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-borde-sutil/50 dark:hover:bg-dark-borde"
                        >
                           <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-primary border-primary' : 'border-2 border-gray-300 dark:border-dark-borde'}`}>
                                {item.completed && <span className="text-white text-xs font-bold">✔</span>}
                           </div>
                           <span className={`text-left text-sm ${item.completed ? 'text-gray-500 dark:text-dark-texto-sutil line-through' : 'text-texto-oscuro dark:text-dark-texto'}`}>{item.text}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const StatCard: React.FC<{icon: React.ReactNode, title: string, value: string | number, onClick?: () => void}> = ({icon, title, value, onClick}) => (
    <button onClick={onClick} className="bg-white dark:bg-dark-surface p-3 rounded-xl shadow-sm flex flex-col justify-center items-start text-left w-full transition-shadow hover:shadow-md disabled:opacity-70 disabled:hover:shadow-sm" disabled={!onClick}>
        <div className="text-primary mb-2">
            {icon}
        </div>
        <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil mb-1">{title}</p>
        <p className="font-bold text-texto-oscuro dark:text-dark-texto text-lg">{value}</p>
    </button>
);


export const HomePage: React.FC<{ setActivePage: (page: AppActivePage) => void }> = ({ setActivePage }) => {
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const { t } = useTranslation();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  useEffect(() => {
    const generateNewPlan = async () => {
        if (user && user.needsNewActionPlan) {
            const planTexts = await getNewActionPlan(user);
            const newPlan: ActionPlanItem[] = planTexts.map((text, i) => ({
                id: `ap2_${i}_${Date.now()}`,
                text,
                completed: false,
            }));
            dispatch({ type: 'SET_NEW_ACTION_PLAN', payload: newPlan });
        }
    };
    generateNewPlan();
  }, [user?.needsNewActionPlan, user, dispatch]);
  
  if (!user) {
    return <div className="p-6 text-center">{t('homeSimulatorLoading')}</div>;
  }
  
  const scoreProgress = ((user.creditProfile.score - 300) / (850 - 300)) * 100;

  return (
    <div className="p-4 pb-24">
      {/* This header is now managed globally by App.tsx, so we can remove the local one */}
      
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2 bg-danger text-white p-3 rounded-xl shadow-lg flex items-center space-x-3">
            <FireIcon className="w-8 h-8"/>
            <div>
                <p className="font-bold text-xl">{user.dailyStreak}</p>
                <p className="text-xs opacity-90">días de racha</p>
            </div>
        </div>
        <div className="w-1/2 bg-primary text-white p-3 rounded-xl shadow-lg flex items-center space-x-3">
            <LinkIcon className="w-7 h-7"/>
             <div>
                <p className="font-bold text-xl">{user.points}</p>
                <p className="text-xs opacity-90">puntos ganados</p>
            </div>
        </div>
      </div>

       <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-texto-oscuro dark:text-dark-texto">Puntaje de Crédito</h2>
                <span className="font-semibold text-sm text-primary">{t(user.creditProfile.paymentHistory as any)}</span>
            </div>
            <p className="font-bold text-3xl text-texto-oscuro dark:text-dark-texto">{user.creditProfile.score} <span className="text-lg text-texto-sutil dark:text-dark-texto-sutil">/ 850</span></p>
            <div className="w-full bg-borde-sutil rounded-full h-2 my-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${scoreProgress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-texto-sutil dark:text-dark-texto-sutil">
                <span>Bajo (300)</span>
                <span>Alto (850)</span>
            </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-4 flex justify-between items-center">
            <div>
                <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil">Mi Nivel</p>
                <p className="font-bold text-texto-oscuro dark:text-dark-texto">{user.level}</p>
            </div>
             <div className="text-right">
                <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil">Wallet</p>
                <p className="font-bold text-texto-oscuro dark:text-dark-texto">{formatCurrency(user.walletBalance, user.currency)}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard icon={<DocumentTextIcon className="w-6 h-6"/>} title="Deuda Total" value={formatCurrency(user.creditProfile.debt, user.currency)} onClick={() => setIsUpdateModalOpen(true)} />
            <StatCard icon={<CollectionIcon className="w-6 h-6"/>} title="Líneas de Crédito" value={user.creditProfile.creditLines} onClick={() => setIsUpdateModalOpen(true)}/>
            <StatCard icon={<ChartPieIcon className="w-6 h-6"/>} title="Utilización" value={`${user.creditProfile.creditUtilization}%`} onClick={() => setIsUpdateModalOpen(true)}/>
            <StatCard icon={<ChecklistIcon className="w-6 h-6"/>} title="Historial" value={t(user.creditProfile.paymentHistory as any)} onClick={() => setActivePage('history')} />
        </div>
      
      {user.actionPlan && <ActionPlan plan={user.actionPlan} />}
      
       <UpdateCreditProfileModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        />
    </div>
  );
};