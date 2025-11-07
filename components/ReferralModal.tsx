import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { GiftIcon, SendIcon } from './Icons';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useAppContext();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError(t('referralInvalidEmailError'));
      return;
    }
    
    // Simulate sending invite and getting points
    console.log(`Simulating invite to: ${email}`);
    dispatch({ type: 'ADD_REFERRAL_POINTS', payload: { points: 50 } });
    
    setIsSuccess(true);
    setError('');
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    onClose();
  }

  const handleInviteAnother = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('referralModalTitle')}>
      <div className="p-4 text-center">
        <GiftIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        
        {!isSuccess ? (
          <>
            <p className="text-gray-600 dark:text-dark-texto-sutil mb-6">{t('referralModalDescription')}</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label htmlFor="referral-email" className="sr-only">{t('referralModalEmailLabel')}</label>
                <input
                  id="referral-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={t('referralModalEmailPlaceholder')}
                  className={`w-full px-4 py-3 bg-white dark:bg-dark-borde border ${error ? 'border-red-500' : 'border-gray-300 dark:border-dark-borde'} rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-texto-oscuro dark:text-dark-texto`}
                />
                {error && <p className="text-red-500 text-xs mt-1 text-left">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <SendIcon className="w-5 h-5" />
                {t('referralModalSendButton')}
              </button>
            </form>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto mb-2">¡Invitación Enviada!</h3>
            <p className="text-gray-600 dark:text-dark-texto-sutil mb-6">{t('referralSendSuccessMessage', { email })}</p>
             <button
                onClick={handleInviteAnother}
                className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors shadow-md mb-3"
              >
                {t('referralInviteAnotherButton')}
              </button>
            <button
              onClick={handleClose}
              className="text-sm font-semibold text-gray-600 dark:text-dark-texto-sutil"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};