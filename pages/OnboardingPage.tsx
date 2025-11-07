
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { OnboardingData, IncomeSource, MonthlyIncome, CreditSituation, CreditGoal, CreditProfile, ActionPlanItem } from '../types';
import { Modal } from '../components/Modal';
import { getPersonalizedActionPlan } from '../services/geminiService';

export const OnboardingPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [formData, setFormData] = useState<Partial<OnboardingData>>({});
    const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [initialProfile, setInitialProfile] = useState<CreditProfile | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const handleChange = (field: keyof OnboardingData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof OnboardingData, string>> = {};
        if (!formData.age || formData.age < 18) {
            newErrors.age = 'Debes ser mayor de 18 años.';
        }
        if (!formData.incomeSource) newErrors.incomeSource = 'Selecciona una fuente de ingresos.';
        if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Selecciona un rango de ingresos.';
        if (formData.dependents === undefined || formData.dependents < 0) {
            newErrors.dependents = 'Introduce un número válido.';
        }
        if (!formData.creditSituation) newErrors.creditSituation = 'Selecciona tu situación crediticia.';
        if (!formData.creditGoal) newErrors.creditGoal = 'Selecciona tu objetivo principal.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateInitialProfile = (data: OnboardingData): CreditProfile => {
        let score = 500; // Base score for someone starting out

        // Age factor
        if (data.age > 25) score += (data.age - 25);
        if (data.age > 35) score += (data.age - 35);

        // Income factor
        switch (data.monthlyIncome) {
            case MonthlyIncome.MedioBajo: score += 20; break;
            case MonthlyIncome.MedioAlto: score += 40; break;
            case MonthlyIncome.Alto: score += 60; break;
            default: score += 5;
        }

        // Credit Situation factor (most impactful)
        switch (data.creditSituation) {
            case CreditSituation.AlDia: score += 100; break;
            case CreditSituation.SinHistorial: score += 10; break;
            case CreditSituation.Atrasado: score -= 100; break;
        }

        // Dependents factor
        score -= data.dependents * 5;

        // Clamp score between 300 and 850
        score = Math.max(300, Math.min(850, Math.round(score)));

        return {
            score,
            debt: data.creditSituation === CreditSituation.Atrasado ? 500 : 0, // Mock initial debt
            creditLines: data.creditSituation === CreditSituation.SinHistorial ? 0 : 1,
            paymentHistory: 'Regular',
            creditUtilization: 0,
        };
    };

    const getFeedbackMessage = (score: number): string => {
        if (score >= 700) {
            return "¡Excelente punto de partida! Tu perfil financiero es sólido. Usemos el simulador para fortalecerlo aún más.";
        } else if (score >= 600) {
            return "¡Tienes una buena base! Hay algunas áreas que podemos mejorar para que alcances tus metas. ¡Vamos a ello!";
        } else {
            return "Este es nuestro punto de partida. No te preocupes, juntos construiremos un historial crediticio fuerte. ¡El primer paso es el más importante!";
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const profile = calculateInitialProfile(formData as OnboardingData);
            const feedback = getFeedbackMessage(profile.score);
            setInitialProfile(profile);
            setFeedbackMessage(feedback);
            setIsResultModalOpen(true);
        }
    };

    const handleConfirmOnboarding = async () => {
        if (initialProfile && formData) {
            setIsGeneratingPlan(true);
            const planText = await getPersonalizedActionPlan(formData as OnboardingData);
            const actionPlan: ActionPlanItem[] = planText.map((text, index) => ({
                id: `ap_${index}`,
                text,
                completed: false
            }));

            dispatch({
                type: 'COMPLETE_ONBOARDING',
                payload: {
                    onboardingData: formData as OnboardingData,
                    creditProfile: initialProfile,
                    actionPlan: actionPlan
                }
            });
            // The app will now navigate to the tutorial page automatically
        }
    };


    return (
        <div className="font-poppins bg-fondo text-texto-oscuro">
            <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col p-6 justify-center">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-texto-oscuro">¡Un último paso, {state.user?.name}!</h1>
                    <p className="text-gray-600">Ayúdanos a personalizar tu experiencia.</p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg">
                    
                    {/* Form Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Edad</label>
                        <input type="number" value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`} />
                        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fuente de ingresos principal</label>
                        <select value={formData.incomeSource || ''} onChange={e => handleChange('incomeSource', e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.incomeSource ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}>
                            <option value="" disabled>Selecciona...</option>
                            {Object.values(IncomeSource).map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                        {errors.incomeSource && <p className="text-red-500 text-xs mt-1">{errors.incomeSource}</p>}
                    </div>
                    
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Ingresos mensuales (aprox.)</label>
                        <select value={formData.monthlyIncome || ''} onChange={e => handleChange('monthlyIncome', e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.monthlyIncome ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}>
                            <option value="" disabled>Selecciona...</option>
                            {Object.values(MonthlyIncome).map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                         {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">¿Tienes dependientes económicos?</label>
                        <input type="number" value={formData.dependents ?? ''} onChange={e => handleChange('dependents', parseInt(e.target.value))} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.dependents ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`} />
                        {errors.dependents && <p className="text-red-500 text-xs mt-1">{errors.dependents}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Situación crediticia actual</label>
                        <select value={formData.creditSituation || ''} onChange={e => handleChange('creditSituation', e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.creditSituation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}>
                            <option value="" disabled>Selecciona...</option>
                            {Object.values(CreditSituation).map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                         {errors.creditSituation && <p className="text-red-500 text-xs mt-1">{errors.creditSituation}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Objetivo financiero principal</label>
                        <select value={formData.creditGoal || ''} onChange={e => handleChange('creditGoal', e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.creditGoal ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}>
                            <option value="" disabled>Selecciona...</option>
                            {Object.values(CreditGoal).map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                         {errors.creditGoal && <p className="text-red-500 text-xs mt-1">{errors.creditGoal}</p>}
                    </div>


                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md">
                        Analizar mi Perfil
                    </button>
                </form>
            </div>

            <Modal isOpen={isResultModalOpen} onClose={() => {}} title="¡Análisis Completado!">
                <div className="text-center p-4">
                     {isGeneratingPlan ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                            <p className="text-gray-600">Creando tu plan de acción...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-2">Basado en tus respuestas, este es tu punto de partida:</p>
                            <p className="text-5xl font-bold text-primary mb-2">{initialProfile?.score}</p>
                            <p className="font-semibold text-gray-700 mb-4">{feedbackMessage}</p>
                            <button
                                onClick={handleConfirmOnboarding}
                                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                            >
                                Crear mi Plan y Continuar
                            </button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
