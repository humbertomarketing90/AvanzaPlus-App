import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const tutorialSteps = [
  {
    icon: '📈',
    title: 'Aprende Tomando Decisiones',
    text: 'Enfrenta escenarios financieros del día a día. Cada decisión que tomes afectará tu puntaje de crédito virtual, enseñándote el impacto de tus acciones sin riesgo.',
  },
  {
    icon: '🎯',
    title: 'Controla tus Finanzas',
    text: 'Usa nuestra Wallet Familiar para gestionar tu dinero, crea metas de ahorro personalizadas y utiliza nuestras calculadoras para planificar tu futuro financiero.',
  },
  {
    icon: '🎓',
    title: 'Edúcate y Crece',
    text: 'Accede a lecciones interactivas para fortalecer tu conocimiento. Con el plan Premium, nuestro AP Coach con IA responderá todas tus dudas sobre crédito y finanzas.',
  },
];

export const TutorialPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { dispatch } = useAppContext();

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  };

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const currentStepData = tutorialSteps[activeStep];

  return (
    <div className="font-poppins bg-fondo text-texto-oscuro">
        <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col justify-between p-8">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-end">
                <button 
                    onClick={handleComplete} 
                    className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                    Omitir
                </button>
            </header>
            
            <main className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <span className="text-7xl">{currentStepData.icon}</span>
                </div>
                <h1 className="text-2xl font-bold text-texto-oscuro mb-4">{currentStepData.title}</h1>
                <p className="text-gray-700 leading-relaxed">{currentStepData.text}</p>
            </main>

            <footer className="w-full">
                <div className="flex justify-center space-x-2 mb-8">
                    {tutorialSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeStep === index ? 'bg-primary w-6' : 'bg-borde-sutil'}`}
                        />
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    {activeStep > 0 && (
                        <button 
                            onClick={handlePrev} 
                            className="font-bold text-gray-600 px-6 py-3 rounded-xl"
                        >
                            Anterior
                        </button>
                    )}
                    {activeStep < tutorialSteps.length - 1 ? (
                        <button 
                            onClick={handleNext} 
                            className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md"
                        >
                            Siguiente
                        </button>
                    ) : (
                         <button 
                            onClick={handleComplete} 
                            className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md"
                        >
                            Comenzar
                        </button>
                    )}
                </div>
            </footer>
        </div>
    </div>
  );
};
