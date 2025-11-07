import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useAppContext();
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1);

  const cancellationReasons = [
    "Es muy caro para mí",
    "No uso las funciones Premium",
    "Encontré otra alternativa",
    "Solo quería probarlo",
    "Otro motivo",
  ];

  const handleConfirm = () => {
    dispatch({ type: 'DOWNGRADE_TO_FREE' });
    setStep(2); // Move to success step
  };
  
  const handleFinalClose = () => {
    setStep(1);
    setReason('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleFinalClose} title={step === 1 ? "Cancelar Suscripción" : "Suscripción Cancelada"}>
        {step === 1 ? (
             <div className="p-4">
                <p className="text-gray-700 dark:text-dark-texto-sutil mb-4">Lamentamos que te vayas. ¿Podrías decirnos por qué quieres cancelar?</p>
                <div className="space-y-2 mb-6">
                    {cancellationReasons.map(r => (
                        <label key={r} className="flex items-center p-3 bg-borde-sutil dark:bg-dark-borde rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="cancellation-reason"
                                value={r}
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-3 text-sm font-medium text-texto-oscuro dark:text-dark-texto">{r}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-texto-oscuro font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                        Volver
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason}
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                    >
                        Confirmar Cancelación
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-center p-4">
                <h3 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto mb-2">¡Listo!</h3>
                <p className="text-gray-600 dark:text-dark-texto-sutil mb-6">Tu plan ha sido cambiado a Gratuito. ¡Esperamos verte de vuelta pronto!</p>
                <button
                    onClick={handleFinalClose}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                    Entendido
                </button>
            </div>
        )}
       
    </Modal>
  );
};