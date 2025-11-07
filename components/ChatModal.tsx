import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { SendIcon, SparklesIcon } from './Icons';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { state } = useAppContext();
  const { user } = state;
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPremium = user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      setMessages([{ sender: 'ai', text: `¡Hola, ${user.name.split(' ')[0]}! Soy AP Coach. ¿Qué duda sobre crédito tienes hoy?` }]);
    }
  }, [isOpen, user, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await getChatResponse(input, user);
    
    const aiMessage: ChatMessage = { sender: 'ai', text: responseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('chatModalTitle')}>
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'ai' ? '' : 'justify-end'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5" />
                </div>
              )}
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'ai' ? 'bg-borde-sutil dark:bg-dark-borde text-texto-oscuro dark:text-dark-texto rounded-tl-none' : 'bg-primary text-white rounded-br-none'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                 <SparklesIcon className="w-5 h-5" />
              </div>
              <div className="max-w-xs px-4 py-3 rounded-2xl bg-borde-sutil dark:bg-dark-borde rounded-tl-none">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-borde-sutil dark:border-dark-borde">
          {isPremium ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('chatModalPlaceholder')}
                className="flex-1 w-full px-4 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-primary text-white p-3 rounded-full disabled:bg-primary-dark/50 transition-colors">
                <SendIcon className="w-5 h-5"/>
              </button>
            </div>
          ) : (
            <div className="text-center text-sm p-4 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 rounded-lg">
              Esta es una función Premium. Mejora tu plan para chatear con AP Coach.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};