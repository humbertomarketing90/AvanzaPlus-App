import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, CreditProfile, Scenario, CreditHistoryEntry, Lesson, Goal, Transaction, TransactionType, OnboardingData, MOCK_SCENARIOS, MOCK_LESSONS_DATA, LessonProgress, LessonStatus, Currency, SUPPORTED_CURRENCIES, ActionPlanItem, Badge, UploadedFileState, CreditType, Notification, CalculatorHistoryEntry, NotificationPreferences, Language } from '../types';
import { BADGES, calculateLevel, checkForNewBadges } from '../utils/gamification';

const MOCK_INITIAL_USER: Omit<User, 'name' | 'currency' | 'email' | 'avatar'> = {
  phone: null,
  creditProfile: {
    score: 650,
    debt: 500,
    creditLines: 1,
    paymentHistory: 'Bueno',
    creditUtilization: 30,
  },
  walletBalance: 0,
  hasCompletedOnboarding: false,
  hasCompletedTutorial: false,
  hasCompletedGuidedSetup: false, // Start with guided setup incomplete
  points: 0,
  subscriptionTier: 'free',
  level: 'Novato Financiero',
  badges: [],
  lastActivityDate: null,
  dailyStreak: 0,
  actionPlan: null,
  needsNewActionPlan: false,
  theme: 'light',
  language: 'es',
  notificationPreferences: {
    dailyStreak: true,
    newLessons: true,
    goalMilestones: true,
  },
};

interface AppState {
    isAuthenticated: boolean;
    user: User | null;
    scenarios: Scenario[];
    currentScenarioIndex: number;
    creditHistory: CreditHistoryEntry[];
    lessons: Lesson[];
    goals: Goal[];
    transactions: Transaction[];
    lessonProgress: Record<string, LessonProgress>;
    uploadedFiles: Record<string, UploadedFileState>;
    completedChecklists: Partial<Record<CreditType, boolean>>;
    notifications: Notification[];
    calculatorHistory: CalculatorHistoryEntry[];
}

type Action = 
    | { type: 'LOGIN' }
    | { type: 'REGISTER'; payload: { name: string; email: string; password: string; currency: Currency } }
    | { type: 'LOGOUT' }
    | { type: 'COMPLETE_ONBOARDING'; payload: { onboardingData: OnboardingData; creditProfile: CreditProfile; actionPlan: ActionPlanItem[] } }
    | { type: 'START_REONBOARDING' }
    | { type: 'COMPLETE_TUTORIAL' }
    | { type: 'COMPLETE_GUIDED_SETUP' } // New action
    | { type: 'UPDATE_USER_PROFILE'; payload: { name?: string; avatar?: string } }
    | { type: 'UPDATE_SETTINGS'; payload: { name: string; email: string; phone: string | null; currency: Currency; language: Language; notificationPreferences: NotificationPreferences } }
    | { type: 'UPDATE_CREDIT_PROFILE'; payload: Partial<CreditProfile> }
    | { type: 'ANSWER_SCENARIO'; payload: { scenario: Scenario; optionIndex: number } }
    | { type: 'ADD_GOAL'; payload: { name: string; targetAmount: number } }
    | { type: 'REMOVE_GOAL'; payload: { goalId: string } }
    | { type: 'ADD_TRANSACTION'; payload: { amount: number; type: TransactionType.Aporte | TransactionType.Gasto; description?: string } }
    | { type: 'ALLOCATE_FUNDS_TO_GOAL'; payload: { goalId: string; amount: number } }
    | { type: 'WITHDRAW_FUNDS_FROM_GOAL'; payload: { goalId: string; amount: number } }
    | { type: 'START_LESSON'; payload: { lessonId: string } }
    | { type: 'SUBMIT_QUIZ'; payload: { lessonId: string; correctAnswers: number; totalQuestions: number } }
    | { type: 'UPGRADE_TO_PREMIUM' }
    | { type: 'DOWNGRADE_TO_FREE' }
    | { type: 'TOGGLE_ACTION_PLAN_ITEM'; payload: { itemId: string } }
    | { type: 'SET_NEW_ACTION_PLAN'; payload: ActionPlanItem[] }
    | { type: 'UPDATE_STREAK' }
    | { type: 'UPLOAD_FILE'; payload: { itemId: string, fileState: UploadedFileState } }
    | { type: 'REMOVE_FILE'; payload: { itemId: string } }
    | { type: 'SET_CHECKLIST_COMPLETED'; payload: { checklistType: CreditType } }
    | { type: 'TOGGLE_THEME' }
    | { type: 'ADD_NOTIFICATION', payload: { text: string } }
    | { type: 'MARK_NOTIFICATIONS_AS_READ' }
    | { type: 'SAVE_CALCULATION'; payload: Omit<CalculatorHistoryEntry, 'id' | 'date'> }
    | { type: 'DELETE_CALCULATION'; payload: { id: string } }
    | { type: 'ADD_REFERRAL_POINTS'; payload: { points: number } };


interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOGGED_OUT_STATE: AppState = {
    isAuthenticated: false,
    user: null,
    scenarios: MOCK_SCENARIOS,
    currentScenarioIndex: 0,
    creditHistory: [],
    lessons: MOCK_LESSONS_DATA,
    goals: [],
    transactions: [],
    lessonProgress: {},
    uploadedFiles: {},
    completedChecklists: {},
    notifications: [],
    calculatorHistory: [],
};

const getInitialState = (): AppState => {
    // Always start with a logged out state to force login/register flow.
    return LOGGED_OUT_STATE;
};

const addNotification = (state: AppState, text: string): AppState => {
  const newNotification: Notification = {
    id: `notif_${Date.now()}`,
    text,
    date: new Date().toISOString(),
    read: false,
  };
  return { ...state, notifications: [newNotification, ...state.notifications] };
}

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'REGISTER': {
            const { name, email, currency } = action.payload;
            const newUser: User = {
                ...MOCK_INITIAL_USER,
                name,
                email,
                currency,
                avatar: `https://i.pravatar.cc/150?u=${email}`,
            };
            return {
                ...LOGGED_OUT_STATE,
                isAuthenticated: true,
                user: newUser,
            };
        }
        case 'LOGIN': {
            // Admin user "Carlos Carrazco" starts fresh with onboarding.
            const adminUser: User = {
                 ...MOCK_INITIAL_USER,
                name: 'Carlos Carrazco',
                email: 'admin@avanzaplus.com',
                currency: SUPPORTED_CURRENCIES[0], // PEN
                avatar: `https://i.pravatar.cc/150?u=carlos.carrazco`,
            };
             return {
                ...LOGGED_OUT_STATE,
                isAuthenticated: true,
                user: adminUser,
            };
        }
        case 'LOGOUT': {
            return LOGGED_OUT_STATE;
        }
        case 'COMPLETE_ONBOARDING': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    onboardingData: action.payload.onboardingData,
                    creditProfile: action.payload.creditProfile,
                    actionPlan: action.payload.actionPlan,
                    hasCompletedOnboarding: true,
                }
            };
        }
        case 'START_REONBOARDING': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    hasCompletedOnboarding: false,
                }
            };
        }
        case 'COMPLETE_TUTORIAL': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    hasCompletedTutorial: true,
                }
            };
        }
        case 'COMPLETE_GUIDED_SETUP': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    hasCompletedGuidedSetup: true,
                }
            };
        }
        case 'UPDATE_USER_PROFILE': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload,
                },
            };
        }
        case 'UPDATE_SETTINGS': {
            if (!state.user) return state;
            let newState = {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload,
                },
            };
            newState = addNotification(newState, "Tu configuración ha sido guardada.");
            return newState;
        }
        case 'UPDATE_CREDIT_PROFILE': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    creditProfile: {
                        ...state.user.creditProfile,
                        ...action.payload,
                    }
                }
            }
        }
        case 'UPGRADE_TO_PREMIUM': {
            if (!state.user) return state;
            let newState: AppState = {
                ...state,
                user: {
                    ...state.user,
                    subscriptionTier: 'premium',
                },
            };
            newState = addNotification(newState, "¡Felicidades! 🎉 Has mejorado a Premium.");
            return newState;
        }
        case 'DOWNGRADE_TO_FREE': {
            if (!state.user) return state;
            let newState: AppState = {
                ...state,
                user: {
                    ...state.user,
                    subscriptionTier: 'free',
                },
            };
            newState = addNotification(newState, "Tu suscripción Premium ha sido cancelada.");
            return newState;
        }
        case 'ANSWER_SCENARIO': {
            if (!state.user) return state;
            const { scenario, optionIndex } = action.payload;
            const decision = scenario.options[optionIndex];
            
            const newScore = Math.max(300, Math.min(850, state.user.creditProfile.score + decision.impact));
            const pointsToAdd = decision.impact > 0 ? 2 : 0; // Add points for good decisions
            const newTotalPoints = state.user.points + pointsToAdd;

            const newHistoryEntry: CreditHistoryEntry = {
                id: `hist_${Date.now()}`,
                date: new Date(),
                scenarioTitle: scenario.title,
                decision: decision.text,
                impact: decision.impact,
                explanation: decision.explanation
            };

            const updatedProfile: CreditProfile = {
                ...state.user.creditProfile,
                score: newScore,
            };

            const potentialNewBadges = checkForNewBadges({ ...state.user, points: newTotalPoints }, state);
            
            let newState = {
                ...state,
                user: {
                    ...state.user,
                    creditProfile: updatedProfile,
                    points: newTotalPoints,
                    level: calculateLevel(newTotalPoints),
                    badges: [...new Set([...state.user.badges, ...potentialNewBadges])],
                },
                creditHistory: [newHistoryEntry, ...state.creditHistory],
                currentScenarioIndex: (state.currentScenarioIndex + 1) % state.scenarios.length,
            };

            if (pointsToAdd > 0) {
                newState = addNotification(newState, `¡Ganaste ${pointsToAdd} puntos por una buena decisión!`);
            }
            if (potentialNewBadges.length > 0) {
                const badge = BADGES.find(b => b.id === potentialNewBadges[0]);
                newState = addNotification(newState, `¡Nueva medalla desbloqueada: ${badge?.name}! 🏅`);
            }

            return newState;
        }
        case 'ADD_GOAL': {
            if (!state.user) return state;
            const newGoal: Goal = {
                id: `goal_${Date.now()}`,
                name: action.payload.name,
                targetAmount: action.payload.targetAmount,
                currentAmount: 0,
            };
             let newState = {
                ...state,
                goals: [newGoal, ...state.goals],
            };
            newState = addNotification(newState, `🎯 Nueva meta creada: "${action.payload.name}".`);
            return newState;
        }
        case 'REMOVE_GOAL': {
            return {
                ...state,
                goals: state.goals.filter(g => g.id !== action.payload.goalId),
            };
        }
        case 'ADD_TRANSACTION': {
            if (!state.user) return state;
            const { amount, type, description } = action.payload;

            const newTransaction: Transaction = {
                id: `tx_${Date.now()}`,
                date: new Date(),
                amount,
                type,
                description,
            };

            let newBalance = state.user.walletBalance;
            if (type === TransactionType.Aporte) {
                newBalance += amount;
            } else { // Gasto
                newBalance -= amount;
            }

            return {
                ...state,
                user: {
                    ...state.user,
                    walletBalance: newBalance,
                },
                transactions: [newTransaction, ...state.transactions],
            };
        }
        case 'ALLOCATE_FUNDS_TO_GOAL': {
            if (!state.user || action.payload.amount > state.user.walletBalance) return state;
            const { goalId, amount } = action.payload;

            const newTransaction: Transaction = {
                id: `tx_${Date.now()}`,
                date: new Date(),
                amount,
                type: TransactionType.AsignacionMeta,
                relatedGoal: goalId,
            };

            return {
                ...state,
                user: {
                    ...state.user,
                    walletBalance: state.user.walletBalance - amount,
                },
                goals: state.goals.map(g => 
                    g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
                ),
                transactions: [newTransaction, ...state.transactions],
            }
        }
        case 'WITHDRAW_FUNDS_FROM_GOAL': {
             if (!state.user) return state;
            const { goalId, amount } = action.payload;
            const goal = state.goals.find(g => g.id === goalId);
            if (!goal || amount > goal.currentAmount) return state;
            
             const newTransaction: Transaction = {
                id: `tx_${Date.now()}`,
                date: new Date(),
                amount,
                type: TransactionType.RetiroMeta,
                relatedGoal: goalId,
            };

            return {
                ...state,
                user: {
                    ...state.user,
                    walletBalance: state.user.walletBalance + amount,
                },
                goals: state.goals.map(g => 
                    g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g
                ),
                transactions: [newTransaction, ...state.transactions],
            }
        }
        case 'START_LESSON': {
            const { lessonId } = action.payload;
            const currentProgress = state.lessonProgress[lessonId];
            if (!currentProgress || currentProgress.status === LessonStatus.NotStarted || currentProgress.status === LessonStatus.Failed) {
                 return {
                    ...state,
                    lessonProgress: {
                        ...state.lessonProgress,
                        [lessonId]: { status: LessonStatus.InProgress }
                    }
                };
            }
            return state;
        }
        case 'SUBMIT_QUIZ': {
            if (!state.user) return state;
            const { lessonId, correctAnswers, totalQuestions } = action.payload;
            const score = (correctAnswers / totalQuestions) * 100;
            const passingScore = 70;
            const didPass = score >= passingScore;
            
            const currentProgress = state.lessonProgress[lessonId];
            const pointsToAdd = didPass && currentProgress?.status !== LessonStatus.Completed ? 10 : 0;
            const newTotalPoints = state.user.points + pointsToAdd;

            const potentialNewBadges = checkForNewBadges({ ...state.user, points: newTotalPoints }, state);

            let newState = {
                ...state,
                user: {
                    ...state.user,
                    points: newTotalPoints,
                    level: calculateLevel(newTotalPoints),
                    badges: [...new Set([...state.user.badges, ...potentialNewBadges])],
                },
                lessonProgress: {
                    ...state.lessonProgress,
                    [lessonId]: {
                        status: didPass ? LessonStatus.Completed : LessonStatus.Failed,
                        score: score
                    }
                }
            };

            if(pointsToAdd > 0) {
              newState = addNotification(newState, `🎓 ¡Lección completada! Ganaste ${pointsToAdd} puntos.`);
            }
             if (potentialNewBadges.length > 0) {
                const badge = BADGES.find(b => b.id === potentialNewBadges[0]);
                newState = addNotification(newState, `¡Nueva medalla desbloqueada: ${badge?.name}! 🏅`);
            }

            return newState;
        }
        case 'TOGGLE_ACTION_PLAN_ITEM': {
            if (!state.user || !state.user.actionPlan) return state;
            
            let pointsToAdd = 0;
            const newActionPlan = state.user.actionPlan.map(item => {
                if (item.id === action.payload.itemId) {
                    if(!item.completed) pointsToAdd = 5; // Give points only when completing
                    return { ...item, completed: !item.completed };
                }
                return item;
            });
            const newTotalPoints = state.user.points + pointsToAdd;
            const isPlanComplete = newActionPlan.every(item => item.completed);

            let newState = {
                ...state,
                user: {
                    ...state.user,
                    actionPlan: newActionPlan,
                    points: newTotalPoints,
                    level: calculateLevel(newTotalPoints),
                    needsNewActionPlan: isPlanComplete,
                }
            };
            
            if(pointsToAdd > 0) {
              newState = addNotification(newState, `✅ ¡Tarea completada! Ganaste ${pointsToAdd} puntos.`);
            }
            if (isPlanComplete) {
              newState = addNotification(newState, "🚀 ¡Plan completado! Generando tus próximos pasos...");
            }

            return newState;
        }
        case 'SET_NEW_ACTION_PLAN': {
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    actionPlan: action.payload,
                    needsNewActionPlan: false,
                }
            };
        }
        case 'ADD_REFERRAL_POINTS': {
            if (!state.user) return state;
            const { points } = action.payload;
            const newTotalPoints = state.user.points + points;

            const potentialNewBadges = checkForNewBadges({ ...state.user, points: newTotalPoints }, state);

            let newState = {
                ...state,
                user: {
                    ...state.user,
                    points: newTotalPoints,
                    level: calculateLevel(newTotalPoints),
                    badges: [...new Set([...state.user.badges, ...potentialNewBadges])],
                },
            };

            newState = addNotification(newState, `🎁 ¡Ganaste ${points} puntos por invitar a un amigo!`);
            
            if (potentialNewBadges.length > 0) {
                const badge = BADGES.find(b => b.id === potentialNewBadges[0]);
                newState = addNotification(newState, `¡Nueva medalla desbloqueada: ${badge?.name}! 🏅`);
            }

            return newState;
        }
        case 'UPDATE_STREAK': {
            if (!state.user) return state;
            const today = new Date().toISOString().split('T')[0];
            if (state.user.lastActivityDate === today) return state; // Already active today

            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            const newStreak = state.user.lastActivityDate === yesterday ? state.user.dailyStreak + 1 : 1;
            
            let newState = {
                ...state,
                user: {
                    ...state.user,
                    dailyStreak: newStreak,
                    lastActivityDate: today,
                }
            };
            if(newStreak > 1) {
              newState = addNotification(newState, `🔥 ¡Racha de ${newStreak} días! Sigue así.`);
            }
            return newState;
        }
        case 'UPLOAD_FILE':
            return {
                ...state,
                uploadedFiles: {
                    ...state.uploadedFiles,
                    [action.payload.itemId]: action.payload.fileState,
                },
            };
        case 'REMOVE_FILE': {
            const newFiles = { ...state.uploadedFiles };
            delete newFiles[action.payload.itemId];
            return {
                ...state,
                uploadedFiles: newFiles,
            };
        }
        case 'SET_CHECKLIST_COMPLETED':
             return {
                ...state,
                completedChecklists: {
                    ...state.completedChecklists,
                    [action.payload.checklistType]: true,
                }
            };
        case 'TOGGLE_THEME':
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    theme: state.user.theme === 'light' ? 'dark' : 'light',
                },
            };
        case 'ADD_NOTIFICATION':
            return addNotification(state, action.payload.text);
        case 'MARK_NOTIFICATIONS_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n => ({ ...n, read: true })),
            };
        case 'SAVE_CALCULATION': {
            const newEntry: CalculatorHistoryEntry = {
                ...action.payload,
                id: `calc_${Date.now()}`,
                date: new Date().toISOString(),
            };
            return {
                ...state,
                calculatorHistory: [newEntry, ...state.calculatorHistory],
            };
        }
        case 'DELETE_CALCULATION': {
            return {
                ...state,
                calculatorHistory: state.calculatorHistory.filter(c => c.id !== action.payload.id),
            };
        }
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState());

    useEffect(() => {
        if (state.isAuthenticated) {
            // This will run on load if authenticated to correctly set today's activity
            dispatch({ type: 'UPDATE_STREAK' });
        }
    }, [state.isAuthenticated]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};