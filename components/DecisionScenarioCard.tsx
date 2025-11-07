import React from 'react';
import { Scenario } from '../types';

interface DecisionScenarioCardProps {
  scenario: Scenario;
  onAnswer: (optionIndex: number) => void;
}

export const DecisionScenarioCard: React.FC<DecisionScenarioCardProps> = ({ scenario, onAnswer }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 mb-6 border border-primary/20">
      <h3 className="text-lg font-bold text-primary mb-2">{scenario.title}</h3>
      <p className="text-texto-sutil dark:text-dark-texto-sutil mb-4">{scenario.description}</p>
      <div className="space-y-3">
        {scenario.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            className="w-full text-left bg-fondo dark:bg-dark-borde p-3 rounded-lg border-2 border-borde-sutil dark:border-dark-borde hover:border-primary dark:hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};
