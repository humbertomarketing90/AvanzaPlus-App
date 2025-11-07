import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Confetti } from '../components/Confetti';
import { Modal } from '../components/Modal';
import { Goal, TransactionType } from '../types';

const steps = [
  {
    icon: '🎯',
    titleKey: 'guidedSetupStep1Title',
    descriptionKey: 'guidedSetupStep1Desc',
    actionKey: 'guidedSetupStep1Action',
    isInteractive: true,
  },
  {
    icon: '📈',
    titleKey: 'guidedSetupStep2Title',
    descriptionKey: 'guidedSetupStep2Desc',
    actionKey: 'guidedSetupStep2Action',
    isInteractive: true,
  },
  {
    icon: '💰',
    titleKey: 'guidedSetupStep3Title',
    descriptionKey: 'guidedSetupStep3Desc',
    actionKey: 'guidedSetupStep3Action',
    isInteractive: true,
  },
  {
    icon: '📄',
    titleKey: 'guidedSetupStep4Title',
    descriptionKey: 'guidedSetupStep4Desc',
    isInteractive: false,
  },
  {
    icon: '💳',
    titleKey: 'guidedSetupStep5Title',
    descriptionKey: 'guidedSetupStep5Desc',
    isInteractive: false,
  },
  {
    icon: '📊',
    titleKey: 'guidedSetupStep6Title',
    descriptionKey: 'guidedSetupStep6Desc',
    isInteractive: false,
  },
  {
    icon: '🚀',
    titleKey: 'guidedSetupStep7Title',
    descriptionKey: 'guidedSetupStep7Desc',
    isInteractive: false,
  }
];

const GoalModal: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { state, dispatch } = useAppContext();
    const [name, setName] = useState('Mi Primer Ahorro');
    const [target, setTarget] = useState('500');
    
    const handleSave = () => {
        const amount = parseFloat(target);
        if(name && !isNaN(amount) && amount > 0) {
            dispatch({ type: 'ADD_GOAL', payload: { name, targetAmount: amount }});
            onClose();
        }
    }
    
    return (
         <div className="space-y-4">
            <p className="text-sm text-center text-gray-600">¡Empecemos con una meta! Esto te ayudará a enfocarte.</p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la meta</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Monto Objetivo</label>
                <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">Guardar Meta</button>
        </div>
    )
}

const DecisionModal: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { state, dispatch } = useAppContext();
    const scenario = state.scenarios[state.currentScenarioIndex];

    const handleAnswer = (optionIndex: number) => {
        dispatch({ type: 'ANSWER_SCENARIO', payload: { scenario, optionIndex }});
        onClose();
    }
    
    return (
        <div className="space-y-3">
             <p className="font-semibold text-center text-gray-700">{scenario.title}</p>
             <p className="text-sm text-center text-gray-600 mb-4">{scenario.description}</p>
             {scenario.options.map((opt, i) => (
                 <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left bg-fondo p-3 rounded-lg border-2 border-borde-sutil hover:border-primary transition-colors">
                     {opt.text}
                 </button>
             ))}
        </div>
    )
}

const WalletModal: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { dispatch } = useAppContext();
    const [amount, setAmount] = useState('100');

    const handleSave = () => {
        const numAmount = parseFloat(amount);
        if(!isNaN(numAmount) && numAmount > 0) {
             dispatch({ type: 'ADD_TRANSACTION', payload: { amount: numAmount, type: TransactionType.Aporte, description: "Aporte inicial" } });
             onClose();
        }
    }
    
    return (
        <div className="space-y-4">
             <p className="text-sm text-center text-gray-600">Hagamos tu primer aporte a tu Wallet para que te familiarices.</p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Monto del Aporte</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">Confirmar Aporte</button>
        </div>
    )
}


export const GuidedSetupPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    } else {
      finishSetup();
    }
  };
  
  const finishSetup = () => {
    setShowConfetti(true);
    setTimeout(() => {
         dispatch({ type: 'COMPLETE_GUIDED_SETUP' });
    }, 1000); // Allow confetti to be seen
  };

  const currentStepData = steps[currentStep];

  const renderModalContent = () => {
      switch(currentStep) {
          case 0: return <GoalModal onClose={() => { setIsModalOpen(false); handleNextStep(); }} />;
          case 1: return <DecisionModal onClose={() => { setIsModalOpen(false); handleNextStep(); }} />;
          case 2: return <WalletModal onClose={() => { setIsModalOpen(false); handleNextStep(); }} />;
          default: return null;
      }
  }

  return (
    <div className="font-poppins bg-fondo text-texto-oscuro min-h-screen">
      {showConfetti && <Confetti />}
      <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500" style={{opacity: showConfetti ? 0 : 1}}>
        <div
          className={`transform transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'}`}
        >
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-6xl">{currentStepData.icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-texto-oscuro mb-3">{t(currentStepData.titleKey)}</h1>
          <p className="text-gray-700 leading-relaxed mb-8">{t(currentStepData.descriptionKey)}</p>

          <div className="space-y-3">
             {currentStepData.isInteractive ? (
                <>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md"
                    >
                      {t(currentStepData.actionKey!)}
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                    >
                      {t('guidedSetupOmitButton')}
                    </button>
                </>
             ) : (
                <button
                  onClick={handleNextStep}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md"
                >
                  {t('guidedSetupNextButton')}
                </button>
             )}
          </div>
        </div>
        
         <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
            {steps.map((_, index) => (
                <div key={index} className={`h-2 rounded-full transition-all duration-300 ${currentStep === index ? 'bg-primary w-6' : 'bg-borde-sutil w-2'}`} />
            ))}
        </div>
      </div>
       <Modal isOpen={isModalOpen && currentStepData.isInteractive} onClose={() => setIsModalOpen(false)} title={t(currentStepData.titleKey)}>
           {renderModalContent()}
       </Modal>
    </div>
  );
};