import React, { useState } from 'react';
import { AppActivePage } from '../App';
import { useAppContext } from '../context/AppContext';
import { CalculatorHistoryEntry } from '../types';
import { TrashIcon } from '../components/Icons';
import { useTranslation } from '../hooks/useTranslation';
import { Modal } from '../components/Modal';

interface CalculatorHistoryPageProps {
  setActivePage: (page: AppActivePage) => void;
}

const HistoryItem: React.FC<{ item: CalculatorHistoryEntry, onDelete: () => void }> = ({ item, onDelete }) => {
    const { t, currentLang } = useTranslation();
    const date = new Date(item.date);
    const formattedDate = new Intl.DateTimeFormat(currentLang, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    
    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-gray-500 dark:text-dark-texto-sutil">{t('calculatorHistorySavedOn')} {formattedDate}</p>
                    <h4 className="font-bold text-texto-oscuro dark:text-dark-texto">{item.calculatorTitle}</h4>
                </div>
                 <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1" aria-label={t('calculatorHistoryDelete')}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
             <div className="mt-3 pt-3 border-t border-borde-sutil dark:border-dark-borde space-y-2 text-sm">
                <div>
                    <p className="font-semibold text-gray-600 dark:text-dark-texto-sutil">Entradas:</p>
                    {Object.entries(item.inputs).map(([key, value]) => (
                        <p key={key} className="text-gray-800 dark:text-dark-texto"> • {key}: {value}</p>
                    ))}
                </div>
                <div>
                     <p className="font-semibold text-gray-600 dark:text-dark-texto-sutil">Resultados:</p>
                     {Object.entries(item.results).map(([key, value]) => (
                        <p key={key} className="text-primary font-medium"> • {key}: {value}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const CalculatorHistoryPage: React.FC<CalculatorHistoryPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { calculatorHistory } = state;
    const { t } = useTranslation();
    const [itemToDelete, setItemToDelete] = useState<CalculatorHistoryEntry | null>(null);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            dispatch({ type: 'DELETE_CALCULATION', payload: { id: itemToDelete.id } });
            setItemToDelete(null);
        }
    };

    return (
        <div className="p-6 pb-24">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-texto-oscuro dark:text-dark-texto">{t('calculatorHistoryTitle')}</h1>
                    <p className="text-gray-600 dark:text-dark-texto-sutil">{t('calculatorHistorySubtitle')}</p>
                </div>
                <button 
                    onClick={() => setActivePage('finanzas')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    {t('calculatorHistoryGoBack')}
                </button>
            </header>

            <div>
                {calculatorHistory.length > 0 ? (
                    calculatorHistory.map(item => <HistoryItem key={item.id} item={item} onDelete={() => setItemToDelete(item)} />)
                ) : (
                    <div className="text-center py-10 px-6 bg-white dark:bg-dark-surface rounded-xl shadow-md">
                        <p className="font-semibold text-texto-oscuro dark:text-dark-texto">{t('calculatorHistoryEmpty')}</p>
                        <p className="text-gray-600 dark:text-dark-texto-sutil mt-2">Usa las calculadoras y guarda las simulaciones para verlas aquí.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title={t('calculatorHistoryConfirmDeleteTitle')}>
                 <div>
                    <p className="text-gray-700 dark:text-dark-texto-sutil mb-6">{t('calculatorHistoryConfirmDeleteMessage')}</p>
                    <div className="flex justify-end space-x-4">
                        <button 
                            onClick={() => setItemToDelete(null)} 
                            className="px-4 py-2 bg-gray-200 dark:bg-dark-borde text-texto-oscuro dark:text-dark-texto font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('calculatorHistoryCancel')}
                        </button>
                        <button 
                            onClick={handleConfirmDelete} 
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('calculatorHistoryDelete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};