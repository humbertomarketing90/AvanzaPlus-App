import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface CircularProgressProps {
  score?: number; // 300 to 850
  progress?: number;
  size?: number;
  strokeWidth?: number;
}

const getScoreColor = (score: number): string => {
    if (score < 580) return 'text-red-500'; // Malo
    if (score < 670) return 'text-yellow-500'; // Regular
    if (score < 740) return 'text-blue-500'; // Bueno
    if (score < 800) return 'text-primary'; // Muy Bueno
    return 'text-green-600'; // Excelente
};

type ScoreTierKey = 'scoreTierBad' | 'scoreTierRegular' | 'scoreTierGood' | 'scoreTierVeryGood' | 'scoreTierExcellent';
const getScoreTierKey = (score: number): ScoreTierKey => {
    if (score < 580) return 'scoreTierBad';
    if (score < 670) return 'scoreTierRegular';
    if (score < 740) return 'scoreTierGood';
    if (score < 800) return 'scoreTierVeryGood';
    return 'scoreTierExcellent';
};

const getProgressColor = (progress: number): string => {
  if (progress < 40) return 'text-red-500';
  if (progress < 70) return 'text-yellow-500';
  if (progress < 90) return 'text-blue-500';
  return 'text-primary';
};

export const CircularProgress: React.FC<CircularProgressProps> = ({ score, progress: progressProp, size = 180, strokeWidth = 12 }) => {
  const { t } = useTranslation();
  const minScore = 300;
  const maxScore = 850;
  
  const progress = score !== undefined ? ((score - minScore) / (maxScore - minScore)) * 100 : progressProp ?? 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  const colorClass = score !== undefined ? getScoreColor(score) : getProgressColor(progress);
  const tierKey = score !== undefined ? getScoreTierKey(score) : null;
  const tier = tierKey ? t(tierKey) : null;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-borde-sutil dark:text-dark-borde"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={colorClass}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, color 0.5s' }}
        />
      </svg>
      {score !== undefined && tier && (
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-texto-oscuro dark:text-dark-texto">{score}</span>
          <span className={`text-lg font-semibold ${colorClass}`}>{tier}</span>
        </div>
      )}
    </div>
  );
};