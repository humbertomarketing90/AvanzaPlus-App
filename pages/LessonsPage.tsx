import React, { useState } from 'react';
import { Lesson, LessonCategory, LessonStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import { LockClosedIcon, StarIcon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { AppActivePage } from '../App';

const getStatusColor = (status: LessonStatus) => {
    switch (status) {
        case LessonStatus.Completed:
            return 'border-l-4 border-primary'; // Green
        case LessonStatus.InProgress:
            return 'border-l-4 border-yellow-500'; // Yellow
        case LessonStatus.Failed:
            return 'border-l-4 border-red-500'; // Red
        default:
            return 'border-l-4 border-secondary'; // Blue for NotStarted
    }
};

const LessonCard: React.FC<{ lesson: Lesson; status: LessonStatus; onClick: () => void; isLocked: boolean }> = ({ lesson, status, onClick, isLocked }) => {
    const statusColorClass = getStatusColor(status);

    return (
        <div 
            className={`bg-white rounded-xl shadow-md p-4 flex items-center space-x-4 mb-4 transition-shadow ${isLocked ? 'opacity-75' : 'cursor-pointer hover:shadow-lg'} ${statusColorClass}`}
            onClick={onClick}
        >
            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-white text-3xl shrink-0">
                {isLocked ? <LockClosedIcon className="w-8 h-8"/> : '🎓'}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-texto-oscuro mb-1 pr-2">{lesson.title}</h4>
                    {lesson.isPremium && <span className="text-xs shrink-0 font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">PREMIUM</span>}
                </div>
                <p className="text-sm text-gray-600">{lesson.description}</p>
                <p className="text-xs text-gray-500 mt-2">{lesson.category} • {lesson.duration} min</p>
            </div>
        </div>
    );
}

interface LessonsPageProps {
    onSelectLesson: (lessonId: string) => void;
    setActivePage: (page: AppActivePage) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({ onSelectLesson, setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { lessons, lessonProgress, user } = state;
    const [activeCategory, setActiveCategory] = useState<LessonCategory | 'All'>('All');
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const isPremium = user?.subscriptionTier === 'premium';
    
    const categories = ['All', ...Object.values(LessonCategory)];

    const filteredLessons = activeCategory === 'All' 
        ? lessons 
        : lessons.filter(l => l.category === activeCategory);

    const handleLessonClick = (lesson: Lesson) => {
        if (lesson.isPremium && !isPremium) {
            setUpgradeModalOpen(true);
        } else {
            dispatch({ type: 'START_LESSON', payload: { lessonId: lesson.id } });
            onSelectLesson(lesson.id);
        }
    };

    return (
        <div className="p-6 pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-texto-oscuro">Lecciones de Crédito</h1>
                <p className="text-gray-600">Aprende y fortalece tu salud financiera.</p>
            </header>

            <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 -mx-6 px-6">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat as LessonCategory | 'All')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-texto-oscuro shadow-sm'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div>
                {filteredLessons.map(lesson => (
                    <LessonCard 
                        key={lesson.id} 
                        lesson={lesson} 
                        status={lessonProgress[lesson.id]?.status || LessonStatus.NotStarted}
                        isLocked={!!lesson.isPremium && !isPremium}
                        onClick={() => handleLessonClick(lesson)}
                    />
                ))}
            </div>

            <Modal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Función Premium">
                <div className="text-center p-4">
                    <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-texto-oscuro">Desbloquea Lecciones Premium</h3>
                    <p className="text-gray-600 my-4">
                        Accede a contenido exclusivo y avanzado con el plan Premium para acelerar tu aprendizaje financiero.
                    </p>
                    <button
                        onClick={() => {
                            setUpgradeModalOpen(false);
                            setActivePage('subscription');
                        }}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Mejorar a Premium
                    </button>
                </div>
            </Modal>
        </div>
    );
};