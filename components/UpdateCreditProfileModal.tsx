import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { CreditProfile } from '../types';

interface UpdateCreditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateCreditProfileModal: React.FC<UpdateCreditProfileModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const { t } = useTranslation();
  
  const [profileData, setProfileData] = useState<Partial<CreditProfile>>({
    debt: user?.creditProfile.debt || 0,
    creditLines: user?.creditProfile.creditLines || 0,
    creditUtilization: user?.creditProfile.creditUtilization || 0,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        debt: user.creditProfile.debt,
        creditLines: user.creditProfile.creditLines,
        creditUtilization: user.creditProfile.creditUtilization,
      });
    }
  }, [user, isOpen]);

  const handleChange = (field: keyof CreditProfile, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setProfileData(prev => ({ ...prev, [field]: numValue }));
    } else if (value === '') {
      setProfileData(prev => ({ ...prev, [field]: 0 }));
    }
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CREDIT_PROFILE', payload: profileData });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('updateCreditModalTitle')}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-dark-texto-sutil">{t('updateCreditModalDescription')}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">{t('updateCreditModalDebtLabel')}</label>
          <input
            type="number"
            value={profileData.debt}
            onChange={(e) => handleChange('debt', e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">{t('updateCreditModalLinesLabel')}</label>
          <input
            type="number"
            value={profileData.creditLines}
            onChange={(e) => handleChange('creditLines', e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">{t('updateCreditModalUtilizationLabel')}</label>
          <input
            type="number"
            value={profileData.creditUtilization}
            onChange={(e) => handleChange('creditUtilization', e.target.value)}
            max="100"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-primary-dark transition-colors"
        >
          {t('updateCreditModalSaveButton')}
        </button>
      </div>
    </Modal>
  );
};