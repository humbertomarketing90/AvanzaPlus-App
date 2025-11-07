import { User, Badge, LessonStatus } from "../types";

// --- LEVELS ---
export const LEVELS = [
  { name: 'Novato Financiero', minPoints: 0 },
  { name: 'Aprendiz Financiero', minPoints: 50 },
  { name: 'Planificador Consciente', minPoints: 120 },
  { name: 'Estratega del Ahorro', minPoints: 250 },
  { name: 'Maestro del Crédito', minPoints: 500 },
];

export const calculateLevel = (points: number): string => {
  let currentLevel = LEVELS[0].name;
  for (const level of LEVELS) {
    if (points >= level.minPoints) {
      currentLevel = level.name;
    } else {
      break;
    }
  }
  return currentLevel;
};

// --- BADGES ---
export const BADGES: Badge[] = [
    { id: 'b_first_lesson', name: 'Primera Lección', description: 'Completaste tu primera lección.', icon: 'BookOpenIcon' },
    { id: 'b_five_lessons', name: 'Estudiante Dedicado', description: 'Completaste 5 lecciones.', icon: 'LessonsIcon' },
    { id: 'b_perfect_quiz', name: 'Conocimiento Perfecto', description: 'Obtuviste 100% en un quiz.', icon: 'LessonsIcon' },
    { id: 'b_first_goal', name: 'Soñador Activo', description: 'Creaste tu primera meta de ahorro.', icon: 'GoalsIcon' },
    { id: 'b_ten_scenarios', name: 'Decisor Experto', description: 'Completaste 10 escenarios.', icon: 'HistoryIcon' },
    { id: 'b_positive_score', name: 'En la Cima', description: 'Alcanzaste un puntaje de 750.', icon: 'StarIcon' },
    { id: 'b_seven_day_streak', name: 'Racha de 7 días', description: 'Mantuviste tu racha por 7 días.', icon: 'LinkIcon' },
];

export const checkForNewBadges = (user: User, state: any): string[] => {
    const newBadges: string[] = [];
    const earnedBadges = user.badges;

    // Badge: First Lesson
    if (!earnedBadges.includes('b_first_lesson')) {
        const completedLessons = Object.values(state.lessonProgress).filter((p: any) => p.status === LessonStatus.Completed).length;
        if (completedLessons > 0) {
            newBadges.push('b_first_lesson');
        }
    }
    // Badge: Five Lessons
    if (!earnedBadges.includes('b_five_lessons')) {
        const completedLessons = Object.values(state.lessonProgress).filter((p: any) => p.status === LessonStatus.Completed).length;
        if (completedLessons >= 5) {
            newBadges.push('b_five_lessons');
        }
    }
    // Badge: Perfect Quiz
    if (!earnedBadges.includes('b_perfect_quiz')) {
        const hasPerfectQuiz = Object.values(state.lessonProgress).some((p: any) => p.score === 100);
        if (hasPerfectQuiz) {
            newBadges.push('b_perfect_quiz');
        }
    }
    // Badge: First Goal
    if (!earnedBadges.includes('b_first_goal')) {
        if (state.goals.length > 0) {
            newBadges.push('b_first_goal');
        }
    }
    // Badge: Ten Scenarios
    if (!earnedBadges.includes('b_ten_scenarios')) {
        if (state.creditHistory.length >= 10) {
            newBadges.push('b_ten_scenarios');
        }
    }
    // Badge: Positive Score
    if (!earnedBadges.includes('b_positive_score')) {
        if (user.creditProfile.score >= 750) {
            newBadges.push('b_positive_score');
        }
    }
    // Badge: Seven Day Streak
    if (!earnedBadges.includes('b_seven_day_streak')) {
        if (user.dailyStreak >= 7) {
            newBadges.push('b_seven_day_streak');
        }
    }
    
    return newBadges;
}