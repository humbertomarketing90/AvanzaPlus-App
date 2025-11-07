
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { QuizOption } from '../types';
import { StarIcon } from '../components/Icons';

interface LessonDetailPageProps {
  lessonId: string;
  onBack: () => void;
}

enum ViewState {
  Steps,
  Quiz,
  Results,
}

export const LessonDetailPage: React.FC<LessonDetailPageProps> = ({ lessonId, onBack }) => {
  const { state, dispatch } = useAppContext();
  const lessonFromState = useMemo(() => state.lessons.find(l => l.id === lessonId), [lessonId, state.lessons]);
  const isPremium = useMemo(() => state.user?.subscriptionTier === 'premium', [state.user]);

  if (lessonFromState?.isPremium && !isPremium) {
    return (
        <div className="p-6 text-center flex flex-col items-center justify-center h-full">
            <StarIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-texto-oscuro">Contenido Premium</h2>
            <p className="text-gray-600 my-4 max-w-sm">
                Esta lección es exclusiva para nuestros miembros Premium. ¡Actualiza tu plan para acceder a este y mucho más contenido!
            </p>
            <button onClick={onBack} className="mt-4 w-full max-w-xs bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                Volver a Lecciones
            </button>
        </div>
    );
  }

  const lesson = useMemo(() => {
    if (!lessonFromState) return null;
    // For free users, only show 1 question, unless there is only one question anyway
    if (isPremium || lessonFromState.quiz.length <= 1) {
      return lessonFromState;
    }
    return {
      ...lessonFromState,
      quiz: lessonFromState.quiz.slice(0, 1)
    };
  }, [lessonFromState, isPremium]);

  const [viewState, setViewState] = useState<ViewState>(ViewState.Steps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  if (!lesson) {
    return (
      <div className="p-6 text-center">
        <p>Lección no encontrada.</p>
        <button onClick={onBack} className="mt-4 text-secondary font-semibold">Volver a Lecciones</button>
      </div>
    );
  }
  
  const totalSteps = lesson.steps.length;
  const currentStep = lesson.steps[currentStepIndex];
  
  const totalQuestions = lesson.quiz.length;
  const currentQuestion = lesson.quiz[currentQuestionIndex];
  
  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setViewState(ViewState.Quiz);
    }
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    setAnswers(prev => [...prev, selectedOption]);
    setSelectedOption(null);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate score and show results
      const finalAnswers = [...answers, selectedOption];
      let correctCount = 0;
      finalAnswers.forEach((answerIndex, questionIndex) => {
        if (lesson.quiz[questionIndex].options[answerIndex].isCorrect) {
          correctCount++;
        }
      });
      setQuizScore({ correct: correctCount, total: totalQuestions });
      dispatch({ type: 'SUBMIT_QUIZ', payload: { lessonId: lesson.id, correctAnswers: correctCount, totalQuestions } });
      setViewState(ViewState.Results);
    }
  };

  const renderContent = () => {
    switch(viewState) {
        case ViewState.Steps:
            return (
                <div>
                    <div className="mb-6 p-4 bg-borde-sutil rounded-lg">
                        <h2 className="text-xl font-bold text-texto-oscuro">{currentStep.title}</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-8">{currentStep.content}</p>
                    <button onClick={handleNextStep} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors">
                        {currentStepIndex < totalSteps - 1 ? 'Siguiente Paso' : 'Comenzar Quiz'}
                    </button>
                </div>
            );
        
        case ViewState.Quiz:
            return (
                <div>
                    <h3 className="text-xl font-bold text-texto-oscuro mb-4">{currentQuestion.question}</h3>
                    <div className="space-y-3 mb-8">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(index)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedOption === index ? 'bg-secondary text-white border-blue-600' : 'bg-fondo border-borde-sutil hover:border-secondary'}`}
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                     <button onClick={handleAnswer} disabled={selectedOption === null} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300">
                        {currentQuestionIndex < totalQuestions - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
                    </button>
                </div>
            );
            
        case ViewState.Results:
            const scorePercentage = (quizScore.correct / quizScore.total) * 100;
            const didPass = scorePercentage >= 70;
            const pointsEarned = didPass ? 10 : 0;
            return (
                 <div className="text-center">
                    <h2 className={`text-3xl font-bold mb-2 ${didPass ? 'text-primary' : 'text-red-500'}`}>
                        {didPass ? '¡Felicidades!' : '¡Sigue Intentando!'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {didPass ? 'Has aprobado la lección.' : 'No has alcanzado el puntaje mínimo.'}
                    </p>
                    <p className="text-5xl font-bold text-texto-oscuro mb-2">{scorePercentage.toFixed(0)}%</p>
                    <p className="text-gray-500 mb-6">({quizScore.correct} de {quizScore.total} correctas)</p>
                    
                    {didPass && (
                         <div className="bg-yellow-100 text-yellow-800 font-semibold p-3 rounded-lg mb-6">
                            ✨ ¡Has ganado {pointsEarned} puntos de conocimiento! ✨
                        </div>
                    )}
                    
                    {!isPremium && lessonFromState && lessonFromState.quiz.length > 1 && (
                        <div className="mt-6 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                            <StarIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800">
                                ¡Mejora a <strong>Premium</strong> para desbloquear el quiz completo y probar tu conocimiento al máximo!
                            </p>
                        </div>
                    )}

                    <button onClick={onBack} className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                        Volver a Lecciones
                    </button>
                    {!didPass && (
                        <button onClick={() => {
                            setViewState(ViewState.Quiz);
                            setCurrentQuestionIndex(0);
                            setAnswers([]);
                        }} className="w-full mt-3 bg-transparent text-secondary font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors">
                            Reintentar Quiz
                        </button>
                    )}
                </div>
            )
    }
  }

  return (
    <div className="p-6 flex flex-col h-full bg-white">
      <header className="mb-6 shrink-0">
        <button onClick={onBack} className="text-sm font-semibold text-secondary hover:underline mb-2">
          &larr; Volver a Lecciones
        </button>
        <h1 className="text-2xl font-bold text-texto-oscuro">{lesson.title}</h1>
         <div className="w-full bg-borde-sutil rounded-full h-1.5 mt-4">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${ (currentStepIndex + 1) / totalSteps * 100}%` }}></div>
        </div>
      </header>
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};
