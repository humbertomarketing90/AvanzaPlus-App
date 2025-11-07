import React from 'react';
import { CloseIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg w-11/12 max-w-md mx-auto p-6 relative transform transition-all duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-dark-texto-sutil hover:text-gray-700 dark:hover:text-dark-texto" aria-label="Cerrar modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};