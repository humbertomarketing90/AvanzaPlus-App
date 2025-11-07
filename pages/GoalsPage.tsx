
import React, { useState } from 'react';
import { Goal, formatCurrency } from '../types';
import { CircularProgress } from '../components/CircularProgress';
import { Modal } from '../components/Modal';
import { PlusIcon, TrashIcon, StarIcon } from '../components/Icons';
import { recommendGoals } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { AppActivePage } from '../App';


const GoalListItem: React.FC<{ goal: Goal, onDelete: (goalId: string) => void, onManage: (goal: Goal) => void }> = ({ goal, onDelete, onManage }) => {
    const { state } = useAppContext();
    const { user } = state;
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl shadow-md flex items-center mb-4 transition-shadow hover:shadow-lg">
            <div 
                className="p-4 flex items-center space-x-4 flex-1 cursor-pointer"
                onClick={() => onManage(goal)}
            >
                <CircularProgress progress={progress} size={70} strokeWidth={7}/>
                <div className="flex-1">
                    <h4 className="font-bold text-texto-oscuro">{goal.name}</h4>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(goal.currentAmount, user.currency)} / <span className="text-gray-500">{formatCurrency(goal.targetAmount, user.currency)}</span>
                    </p>
                    <div className="w-full bg-borde-sutil rounded-full h-1.5 mt-2">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(goal.id);
                }}
                className="p-2 mr-2 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label={`Eliminar meta ${goal.name}`}
            >
                <TrashIcon className="w-6 h-6" />
            </button>
        </div>
    );
}

const ManageGoalModal: React.FC<{
    goal: Goal;
    onClose: () => void;
}> = ({ goal, onClose }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAction = (type: 'allocate' | 'withdraw') => {
        setError(null);
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Por favor, introduce un monto válido.');
            return;
        }

        if (type === 'allocate') {
            if (numAmount > (user?.walletBalance ?? 0)) {
                setError('No tienes suficientes fondos en tu wallet.');
                return;
            }
            dispatch({ type: 'ALLOCATE_FUNDS_TO_GOAL', payload: { goalId: goal.id, amount: numAmount } });
        } else { // withdraw
            if (numAmount > goal.currentAmount) {
                setError('No puedes retirar más de lo que has aportado a esta meta.');
                return;
            }
            dispatch({ type: 'WITHDRAW_FUNDS_FROM_GOAL', payload: { goalId: goal.id, amount: numAmount } });
        }

        setAmount('');
        onClose();
    }

    if (!user) return null;

    return (
        <Modal isOpen={!!goal} onClose={onClose} title={`Gestionar "${goal.name}"`}>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-600 sm:text-sm">{user.currency.symbol}</span>
                        </div>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                if(error) setError(null);
                            }}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            className={`block w-full rounded-md border-0 py-2 pl-7 pr-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                 </div>
                 <div className="flex space-x-3">
                     <button onClick={() => handleAction('allocate')} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">
                        Aportar a Meta
                    </button>
                     <button onClick={() => handleAction('withdraw')} className="w-full bg-gray-200 text-texto-oscuro font-bold py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors">
                        Retirar a Wallet
                    </button>
                 </div>
                 <div className="text-center text-sm text-gray-600 pt-2">
                     Tu wallet tiene: <strong>{formatCurrency(user.walletBalance, user.currency)}</strong>
                 </div>
            </div>
        </Modal>
    );
}


interface GoalsPageProps {
    setActivePage: (page: AppActivePage) => void;
}


export const GoalsPage: React.FC<GoalsPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { goals, user } = state;
    const isPremium = user?.subscriptionTier === 'premium';

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isSuggestModalOpen, setSuggestModalOpen] = useState(false);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
    const [managedGoal, setManagedGoal] = useState<Goal | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [errors, setErrors] = useState<{ goalName?: string; targetAmount?: string }>({});

    const handleSuggestGoals = async () => {
        if (!user) return;
        if (!isPremium) {
            setUpgradeModalOpen(true);
            return;
        }
        setSuggestModalOpen(true);
        setIsLoading(true);
        try {
            const result = await recommendGoals(user);
            setSuggestions(result.split('\n').filter(s => s.length > 0));
        } catch (error) {
            setSuggestions(['Hubo un error al generar sugerencias.']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const nameMatch = suggestion.match(/^(.*?)(?:\s*de\s*|$)/);
        const amountMatch = suggestion.match(/[0-9,.]+/);

        const extractedName = nameMatch ? nameMatch[1].trim() : suggestion;
        const extractedAmount = amountMatch ? amountMatch[0].replace(/,/g, '') : '';
        
        setGoalName(extractedName);
        setTargetAmount(extractedAmount);
        
        setErrors({});
        setSuggestModalOpen(false);
        setCreateModalOpen(true);
    };

    const handleCreateGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { goalName?: string; targetAmount?: string } = {};

        if (!goalName.trim()) {
            newErrors.goalName = 'El nombre de la meta no puede estar vacío.';
        }

        const amount = parseFloat(targetAmount);
        if (isNaN(amount) || amount <= 0) {
            newErrors.targetAmount = 'El monto objetivo debe ser un número mayor que 0.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        dispatch({ type: 'ADD_GOAL', payload: { name: goalName, targetAmount: amount } });
        
        resetCreateForm();
    };
    
    const resetCreateForm = () => {
        setCreateModalOpen(false);
        setGoalName('');
        setTargetAmount('');
        setErrors({});
    };

    const handleDeleteRequest = (goalId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            setGoalToDelete(goal);
        }
    };

    const handleConfirmDelete = () => {
        if (goalToDelete) {
            dispatch({ type: 'REMOVE_GOAL', payload: { goalId: goalToDelete.id } });
            setGoalToDelete(null);
        }
    };
    
    if (!user) return null;

    return (
        <div className="p-6 pb-24">
            <header className="flex items-center justify-between mb-6 relative">
                 <button 
                    onClick={() => setActivePage('finanzas')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    &larr; Volver
                </button>
                <h1 className="text-2xl font-bold text-texto-oscuro absolute left-1/2 -translate-x-1/2">Nuestras Metas</h1>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-green-700 transition-colors"
                    aria-label="Crear nueva meta">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="mb-6">
                <button 
                    onClick={handleSuggestGoals}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-600 transition-colors">
                    <StarIcon className="w-5 h-5" /> Sugerir Metas con IA
                </button>
            </div>

            <div>
                {goals.map(goal => <GoalListItem key={goal.id} goal={goal} onDelete={handleDeleteRequest} onManage={setManagedGoal} />)}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={resetCreateForm} title="Crear Nueva Meta">
                <form onSubmit={handleCreateGoal}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre de la meta</label>
                        <input 
                            type="text"
                            value={goalName}
                            onChange={(e) => {
                                setGoalName(e.target.value);
                                if (errors.goalName) setErrors(prev => ({ ...prev, goalName: undefined }));
                            }}
                            className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.goalName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`} 
                        />
                         {errors.goalName && <p className="text-red-500 text-xs mt-1">{errors.goalName}</p>}
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Monto Objetivo</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-600 sm:text-sm">{user.currency.symbol}</span>
                            </div>
                            <input 
                                type="number"
                                value={targetAmount}
                                onChange={(e) => {
                                    setTargetAmount(e.target.value);
                                    if (errors.targetAmount) setErrors(prev => ({ ...prev, targetAmount: undefined }));
                                }}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                className={`block w-full rounded-md border-0 py-2 pl-7 pr-2 bg-white border ${errors.targetAmount ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                            />
                        </div>
                        {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">
                        Guardar Meta 🎯
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isSuggestModalOpen} onClose={() => setSuggestModalOpen(false)} title="Metas Sugeridas por IA">
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {suggestions.map((suggestion, i) => (
                           <button 
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left bg-fondo p-3 rounded-lg border-2 border-borde-sutil hover:border-secondary transition-colors"
                            >
                                {suggestion.replace(/^\d+\.\s*/, '')}
                            </button>
                        ))}
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!goalToDelete} onClose={() => setGoalToDelete(null)} title="Confirmar Eliminación">
                <div>
                    <p className="text-gray-700 mb-6">
                        ¿Estás seguro de que quieres eliminar la meta "<strong>{goalToDelete?.name}</strong>"? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button 
                            onClick={() => setGoalToDelete(null)} 
                            className="px-4 py-2 bg-gray-200 text-texto-oscuro font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmDelete} 
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Función Premium">
                <div className="text-center p-4">
                    <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-texto-oscuro">Sugerencias con IA</h3>
                    <p className="text-gray-600 my-4">
                        Obtén recomendaciones de metas de ahorro personalizadas por nuestra IA para alcanzar tus objetivos más rápido.
                    </p>
                    <button
                        onClick={() => {
                            setUpgradeModalOpen(false);
                            setActivePage('subscription');
                        }}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Mejorar a Premium
                    </button>
                </div>
            </Modal>

            {managedGoal && <ManageGoalModal goal={managedGoal} onClose={() => setManagedGoal(null)} />}
        </div>
    );
};
