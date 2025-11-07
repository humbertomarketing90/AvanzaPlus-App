import React from 'react';
import { Modal } from './Modal';
import { ScenarioOption } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface DecisionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldScore: number;
  newScore: number;
  decision: ScenarioOption;
  aiAdvice: string;
}

export const DecisionResultModal: React.FC<DecisionResultModalProps> = ({ isOpen, onClose, oldScore, newScore, decision, aiAdvice }) => {
    const { t } = useTranslation();
    const impact = newScore - oldScore;
    const isPositive = impact >= 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('scenarioModalTitle')}>
            <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto mb-2">{t('scenarioResultTitle')}</h3>
                <div className="flex justify-around items-center my-6">
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-texto-sutil dark:text-dark-texto-sutil">{t('scenarioBefore')}</span>
                        <span className="text-4xl font-bold text-texto-sutil dark:text-dark-texto-sutil line-through">{oldScore}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">→</div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-primary font-semibold">{t('scenarioAfter')}</span>
                        <span className={`text-5xl font-bold ${isPositive ? 'text-primary' : 'text-danger'}`}>{newScore}</span>
                    </div>
                </div>

                <div className="text-left bg-borde-sutil dark:bg-dark-borde p-4 rounded-lg mb-4">
                    <p className="font-semibold text-texto-oscuro dark:text-dark-texto">{t('scenarioWhy')}</p>
                    <p className="text-sm text-texto-sutil dark:text-dark-texto-sutil">{decision.explanation}</p>
                </div>
                
                <div className="text-left bg-primary/10 dark:bg-primary/20 p-4 rounded-lg mb-6">
                    <p className="font-semibold text-primary">{t('scenarioCoachSays')}</p>
                    <p className="text-sm text-texto-sutil dark:text-dark-texto">{aiAdvice}</p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors"
                >
                    {t('scenarioNextButton')}
                </button>
            </div>
        </Modal>
    );
};
