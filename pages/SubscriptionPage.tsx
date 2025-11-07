import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { AppActivePage } from '../App';
import { StarIcon, CheckCircleIcon } from '../components/Icons';
import { formatCurrency } from '../types';
import { Modal } from '../components/Modal';
import { CancellationModal } from '../components/CancellationModal';
import { useTranslation } from '../hooks/useTranslation';

interface SubscriptionPageProps {
  setActivePage: (page: AppActivePage) => void;
}

const premiumFeatures = [
    "Lecciones exclusivas y avanzadas",
    "Más preguntas en los quizzes de lecciones",
    "CrediCoach IA Ilimitado",
    "Sugerencias de Metas con IA",
    "Análisis detallado de decisiones",
    "Calculadoras avanzadas (próximamente)",
    "Soporte prioritario",
];

const freeFeatures = [
    "Simulador de crédito",
    "Lecciones de educación financiera",
    "Calculadoras básicas",
    "Gestión de metas de ahorro",
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { t } = useTranslation();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    
    useEffect(() => {
        if (paymentStatus === 'processing') {
            const timer = setTimeout(() => {
                dispatch({ type: 'UPGRADE_TO_PREMIUM' });
                setPaymentStatus('success');
            }, 3000); // Simulate 3-second payment processing time

            return () => clearTimeout(timer);
        }
    }, [paymentStatus, dispatch]);

    if (!user) return null;
    
    const isPremium = user.subscriptionTier === 'premium';
    
    const handleUpgrade = () => {
        setIsPaymentModalOpen(true);
        setPaymentStatus('processing');
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentStatus('idle');
    };

    const renderPaymentModalContent = () => {
        if (paymentStatus === 'processing') {
            return (
                <div className="text-center p-8 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <h3 className="text-xl font-bold text-texto-oscuro">Procesando tu pago</h3>
                    <p className="text-gray-600 mt-2">Estamos conectando de forma segura con la pasarela de pago. Por favor, espera un momento.</p>
                </div>
            );
        }

        if (paymentStatus === 'success') {
            return (
                 <div className="text-center p-8 flex flex-col items-center">
                    <CheckCircleIcon className="w-16 h-16 text-primary mb-4" />
                    <h3 className="text-2xl font-bold text-texto-oscuro">¡Pago Exitoso!</h3>
                    <p className="text-gray-600 my-4">
                        Bienvenido/a a AVANZAPLUS Premium. Has desbloqueado todo nuestro potencial para acelerar tu éxito financiero.
                    </p>
                    <button
                        onClick={closePaymentModal}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Empezar a usar Premium
                    </button>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="p-6 pb-24">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-texto-oscuro">Planes AVANZAPLUS</h1>
                    <p className="text-gray-600">Elige el plan que se ajusta a ti.</p>
                </div>
                <button 
                    onClick={() => setActivePage('profile')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    Volver
                </button>
            </header>

            <div className="space-y-6">
                {/* Free Plan Card */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 border-2 border-borde-sutil dark:border-dark-borde">
                    <h2 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto">Plan Gratuito</h2>
                    <p className="text-3xl font-bold my-2">S/ 0.00</p>
                    <p className="text-sm text-gray-600 dark:text-dark-texto-sutil mb-4">Ideal para empezar a construir tu futuro financiero.</p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-dark-texto">
                       {freeFeatures.map(feat => (
                           <li key={feat} className="flex items-center">
                               <span className="text-primary mr-3">✔️</span> {feat}
                           </li>
                       ))}
                    </ul>
                </div>

                {/* Premium Plan Card */}
                 <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border-2 border-primary relative">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Más Popular</div>
                    <h2 className="text-xl font-bold text-primary flex items-center"><StarIcon className="w-5 h-5 mr-2 text-yellow-400 fill-current" /> Plan Premium</h2>
                    <p className="text-3xl font-bold my-2">{formatCurrency(19.90, user.currency)} <span className="text-base font-normal text-gray-600 dark:text-dark-texto-sutil">/ mes</span></p>
                    <p className="text-sm text-gray-600 dark:text-dark-texto-sutil mb-4">Desbloquea todo el potencial de AVANZAPLUS con IA.</p>
                     <ul className="space-y-2 text-sm text-texto-oscuro dark:text-dark-texto">
                       {premiumFeatures.map(feat => (
                           <li key={feat} className="flex items-center">
                               <span className="text-primary mr-3">✔️</span> {feat}
                           </li>
                       ))}
                    </ul>
                    <div className="mt-6">
                        {isPremium ? (
                            <div className="text-center space-y-3">
                                <p className="font-semibold text-primary p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">¡Ya eres Premium! Gracias por tu confianza.</p>
                                <button
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
                                >
                                   {t('subscriptionCancelButton')}
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleUpgrade} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md">
                                Actualizar a Premium
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isPaymentModalOpen} onClose={closePaymentModal} title="">
                {renderPaymentModalContent()}
            </Modal>

            <CancellationModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} />
        </div>
    );
};