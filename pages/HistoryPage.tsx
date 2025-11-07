import React, { useState } from 'react';
import { CreditHistoryEntry, ScenarioOption } from '../types';
import { useAppContext } from '../context/AppContext';
import { AppActivePage } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import { DecisionScenarioCard } from '../components/DecisionScenarioCard';
import { DecisionResultModal } from '../components/DecisionResultModal';
import { getPersonalizedCreditAdvice } from '../services/geminiService';

interface HistoryPageProps {
    setActivePage: (page: AppActivePage) => void;
}

const HistoryItem: React.FC<{ item: CreditHistoryEntry }> = ({ item }) => {
    const isPositive = item.impact >= 0;
    const impactColor = isPositive ? 'text-primary' : 'text-danger';
    const impactText = isPositive ? `+${item.impact}` : `${item.impact}`;

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4 mb-3 opacity-90">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil">{item.date.toLocaleDateString()}</p>
                    <h4 className="font-semibold text-sm text-texto-oscuro dark:text-dark-texto">{item.scenarioTitle}</h4>
                    <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil mt-1">Decidiste: "<em>{item.decision}</em>"</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-lg font-bold ${impactColor}`}>{impactText}</p>
                    <p className="text-xs text-texto-sutil dark:text-dark-texto-sutil">puntos</p>
                </div>
            </div>
        </div>
    );
}


export const HistoryPage: React.FC<HistoryPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { creditHistory, scenarios, currentScenarioIndex, user } = state;
    const { t } = useTranslation();

    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultData, setResultData] = useState<{ oldScore: number; newScore: number; decision: ScenarioOption; aiAdvice: string } | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    
    const currentScenario = scenarios[currentScenarioIndex];

    const handleAnswer = async (optionIndex: number) => {
        if (!user) return;
        
        const decision = currentScenario.options[optionIndex];
        const oldScore = user.creditProfile.score;
        const newScore = Math.max(300, Math.min(850, oldScore + decision.impact));
        
        // Show modal immediately with loading state for advice
        setIsResultModalOpen(true);
        setIsLoadingAdvice(true);
        setResultData({
            oldScore,
            newScore,
            decision,
            aiAdvice: "Generando consejo personalizado..."
        });

        const advice = await getPersonalizedCreditAdvice(user, decision);
        
        // Update modal with advice once it arrives
        setResultData(prev => prev ? { ...prev, aiAdvice: advice } : null);
        setIsLoadingAdvice(false);
        
        // Dispatch the state change
        dispatch({ type: 'ANSWER_SCENARIO', payload: { scenario: currentScenario, optionIndex } });
    };

    const handleCloseModal = () => {
        setIsResultModalOpen(false);
        setResultData(null);
    };

    return (
        <div className="p-4 pb-24">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-texto-oscuro dark:text-dark-texto">{t('decisionCenterTitle')}</h1>
                    <p className="text-gray-600 dark:text-dark-texto-sutil">{t('decisionCenterSubtitle')}</p>
                </div>
                <button 
                    onClick={() => setActivePage('profile')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    {t('decisionCenterGoBack')}
                </button>
            </header>

            <DecisionScenarioCard scenario={currentScenario} onAnswer={handleAnswer} />

            <div>
                 <h2 className="text-lg font-bold text-texto-oscuro dark:text-dark-texto mb-3">{t('decisionCenterHistoryTitle')}</h2>
                {creditHistory.length > 0 ? (
                    creditHistory.slice(0, 5).map(item => <HistoryItem key={item.id} item={item} />)
                ) : (
                    <div className="text-center py-6 px-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm">
                        <p className="font-semibold text-texto-oscuro dark:text-dark-texto">{t('decisionCenterHistoryEmpty')}</p>
                        <p className="text-gray-600 dark:text-dark-texto-sutil mt-1 text-sm">{t('decisionCenterHistoryEmptySubtitle')}</p>
                    </div>
                )}
            </div>

            {resultData && (
                 <DecisionResultModal
                    isOpen={isResultModalOpen}
                    onClose={handleCloseModal}
                    oldScore={resultData.oldScore}
                    newScore={resultData.newScore}
                    decision={resultData.decision}
                    aiAdvice={resultData.aiAdvice}
                 />
            )}
        </div>
    );
};
