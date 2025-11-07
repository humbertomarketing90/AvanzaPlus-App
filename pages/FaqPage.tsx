import React, { useState } from 'react';
import { AppActivePage } from '../App';
import { useTranslation } from '../hooks/useTranslation';

const FaqItem: React.FC<{ q: string; a: string; isOpen: boolean; onClick: () => void }> = ({ q, a, isOpen, onClick }) => {
    return (
        <div className="border-b border-borde-sutil dark:border-dark-borde">
            <button onClick={onClick} className="w-full flex justify-between items-center text-left py-4 px-2">
                <h3 className="font-semibold text-texto-oscuro dark:text-dark-texto">{q}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-dark-texto-sutil" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="p-2 pb-4 text-gray-700 dark:text-dark-texto-sutil">{a}</p>
            </div>
        </div>
    );
};

export const FaqPage: React.FC<{ setActivePage: (page: AppActivePage) => void }> = ({ setActivePage }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { t } = useTranslation();

    const faqs = Array.from({ length: 10 }, (_, i) => ({
        q: t(`faqQ${i + 1}` as any),
        a: t(`faqA${i + 1}` as any),
    }));

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="p-6 pb-24">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-texto-oscuro dark:text-dark-texto">{t('faqTitle')}</h1>
                    <p className="text-gray-600 dark:text-dark-texto-sutil">{t('faqSubtitle')}</p>
                </div>
                <button 
                    onClick={() => setActivePage('profile')}
                    className="text-sm font-semibold text-secondary hover:underline"
                >
                    {t('faqGoBack')}
                </button>
            </header>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4">
                {faqs.map((faq, index) => (
                    <FaqItem
                        key={index}
                        q={faq.q}
                        a={faq.a}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
    );
};