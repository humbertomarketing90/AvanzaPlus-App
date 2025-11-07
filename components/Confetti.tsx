import React from 'react';

const CONFETTI_COLORS = ['#2BB673', '#3AA0FF', '#FBC531', '#E84377'];
const CONFETTI_COUNT = 150;

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={style}
    className="absolute top-0 w-2 h-2 rounded-full"
  />
);

export const Confetti: React.FC = () => {
  const confettiStyles = Array.from({ length: CONFETTI_COUNT }).map(() => ({
    backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    animation: `fall ${2 + Math.random() * 3}s ${Math.random() * 2}s linear forwards`,
    transform: `rotate(${Math.random() * 360}deg)`,
  }));

  return (
    <>
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none z-[100]">
        {confettiStyles.map((style, index) => (
          <ConfettiPiece key={index} style={style} />
        ))}
      </div>
    </>
  );
};
