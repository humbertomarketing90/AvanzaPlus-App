export interface OnboardingData {
  age: number;
  incomeSource: IncomeSource;
  monthlyIncome: MonthlyIncome;
  dependents: number;
  creditSituation: CreditSituation;
  creditGoal: CreditGoal;
}

export enum IncomeSource {
  Empleado = 'Empleado/a',
  Autonomo = 'Autónomo/a',
  Estudiante = 'Estudiante',
  Otro = 'Otro',
}

export enum MonthlyIncome {
  Bajo = 'Menos de 500',
  MedioBajo = '500 - 1,500',
  MedioAlto = '1,500 - 3,000',
  Alto = 'Más de 3,000',
}

export enum CreditSituation {
  SinHistorial = 'No tengo historial crediticio',
  AlDia = 'Tengo créditos y estoy al día',
  Atrasado = 'Tengo algunas deudas atrasadas',
}

export enum CreditGoal {
  ObtenerCredito = 'Conseguir mi primer crédito',
  MejorarPuntaje = 'Mejorar mi puntaje actual',
  ReducirDeudas = 'Reducir mis deudas',
  CompraGrande = 'Ahorrar para una compra grande',
}

export interface Currency {
  code: string;
  symbol: string;
  name:string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN)', locale: 'es-PE' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano (USD)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano (MXN)', locale: 'es-MX' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano (COP)', locale: 'es-CO' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS)', locale: 'es-AR' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP)', locale: 'es-CL' },
];

export const formatCurrency = (value: number, currency: Currency) => {
  return new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code }).format(value);
}

export interface ActionPlanItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // The name of the icon component
}

export type CreditType = 'negocio' | 'consumo' | 'hipotecario';

export type UploadedFileState = {
    name: string;
    status: 'analyzing' | 'analyzed_ok' | 'analyzed_fail';
    analysisResult: string | null;
};

export type Theme = 'light' | 'dark';
export type Language = 'es' | 'en';

export interface Notification {
  id: string;
  text: string;
  date: string;
  read: boolean;
}

export type CalculatorId = 'budget' | 'savingsGoal' | 'emergencyFund' | 'personalLoan' | 'compoundInterest' | 'inflation' | 'debtCapacity' | null;

export interface CalculatorHistoryEntry {
  id: string;
  date: string;
  calculatorId: CalculatorId;
  calculatorTitle: string;
  inputs: Record<string, string | number>;
  results: Record<string, string | number>;
}

export interface NotificationPreferences {
    dailyStreak: boolean;
    newLessons: boolean;
    goalMilestones: boolean;
}

export interface User {
  name: string;
  email: string;
  phone: string | null;
  avatar: string;
  creditProfile: CreditProfile;
  walletBalance: number;
  hasCompletedOnboarding: boolean;
  hasCompletedTutorial: boolean;
  hasCompletedGuidedSetup: boolean; // New property
  onboardingData?: OnboardingData;
  points: number;
  currency: Currency;
  subscriptionTier: 'free' | 'premium';
  // Gamification & Engagement
  level: string;
  badges: Badge['id'][];
  lastActivityDate: string | null;
  dailyStreak: number;
  actionPlan: ActionPlanItem[] | null;
  // FIX: Make needsNewActionPlan required to fix type errors in the reducer.
  needsNewActionPlan: boolean; // New property for dynamic action plan
  // Personalization
  theme: Theme;
  language: Language;
  notificationPreferences: NotificationPreferences;
}

export interface CreditProfile {
  score: number; // 300-850
  debt: number;
  creditLines: number;
  paymentHistory: 'Excelente' | 'Bueno' | 'Regular' | 'Malo';
  creditUtilization: number; // 0-100
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  options: ScenarioOption[];
}

export interface ScenarioOption {
  text: string;
  impact: number; // Positive or negative impact on credit score
  explanation: string;
}

export interface CreditHistoryEntry {
  id: string;
  date: Date;
  scenarioTitle: string;
  decision: string;
  impact: number;
  explanation: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
}

export enum TransactionType {
  Aporte = 'Aporte a Wallet',
  Gasto = 'Gasto de Wallet',
  AsignacionMeta = 'Aporte a Meta',
  RetiroMeta = 'Retiro de Meta',
}

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  amount: number;
  relatedGoal?: string;
  description?: string;
}


// --- Educational Content ---

export enum LessonCategory {
  CreditBasics = 'Conceptos Básicos',
  ManagingDebt = 'Manejo de Deudas',
  BuildingCredit = 'Construyendo Crédito',
  CreditReports = 'Reportes de Crédito',
}

export enum LessonStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface LessonProgress {
  status: LessonStatus;
  score?: number; // Score from 0 to 100
}

export interface LessonStep {
  title: string;
  content: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  duration: number; // in minutes
  steps: LessonStep[];
  quiz: QuizQuestion[];
  isPremium?: boolean;
}

// --- MOCK DATA ---

export const MOCK_SCENARIOS: Scenario[] = [
    {
        id: '1',
        title: 'Oferta de Tarjeta de Crédito',
        description: 'Recibes una oferta para una nueva tarjeta de crédito de una tienda departamental con un límite de 1,000. ¿La aceptas?',
        options: [
            { text: 'Sí, la acepto', impact: -5, explanation: 'Abrir una nueva línea de crédito reduce la edad promedio de tus cuentas, lo que puede bajar tu puntaje a corto plazo.' },
            { text: 'No, la rechazo', impact: 0, explanation: 'Rechazar la oferta no tiene impacto en tu puntaje. Es una decisión neutral.' },
        ]
    },
    {
        id: '2',
        title: 'Pago de la Tarjeta',
        description: 'Llega el estado de cuenta de tu tarjeta. Debes 200. Tienes el dinero para pagar el total.',
        options: [
            { text: 'Pagar el total (200)', impact: 10, explanation: 'Pagar el total a tiempo es una de las mejores acciones para tu crédito. Demuestra responsabilidad.' },
            { text: 'Pagar solo el mínimo (20)', impact: -10, explanation: 'Pagar solo el mínimo aumenta tu utilización de crédito y genera intereses, lo cual es negativo.' },
        ]
    },
    {
        id: '3',
        title: 'Compra Grande',
        description: 'Quieres comprar una nueva TV de 800. Tu límite de crédito total es de 1,000.',
        options: [
            { text: 'Comprarla con la tarjeta', impact: -20, explanation: 'Esto elevaría tu utilización de crédito al 80%, una señal de alerta para los prestamistas.' },
            { text: 'Ahorrar y comprarla después', impact: 5, explanation: 'Evitar deudas innecesarias y mantener baja la utilización de crédito es clave para un buen puntaje.' },
        ]
    },
     {
        id: '4',
        title: 'Revisar Reporte de Crédito',
        description: 'Has escuchado que es bueno revisar tu reporte de crédito. ¿Lo haces?',
        options: [
            { text: 'Sí, lo reviso', impact: 2, explanation: 'Revisar tu propio reporte (soft inquiry) no daña tu puntaje y te ayuda a detectar errores.' },
            { text: 'No, me da miedo que baje', impact: 0, explanation: 'No revisarlo no tiene impacto, pero pierdes la oportunidad de corregir posibles errores.' },
        ]
    },
];

export const MOCK_LESSONS_DATA: Lesson[] = [
    { 
        id: '1', 
        title: 'Entendiendo tu Puntaje', 
        description: 'Descubre qué factores componen tu puntaje de crédito.', 
        category: LessonCategory.CreditBasics, 
        duration: 5,
        isPremium: false,
        steps: [
            { title: '¿Qué es el Puntaje?', content: 'Tu puntaje de crédito es un número entre 300 y 850 que representa tu confiabilidad para pagar deudas. Un número más alto significa menor riesgo para los prestamistas.' },
            { title: 'Factores Clave', content: 'Los factores más importantes son: historial de pagos (35%), monto de la deuda (30%), duración del historial (15%), nuevos créditos (10%) y tipos de crédito (10%).' },
        ],
        quiz: [
            { 
                question: '¿Cuál es el factor más importante para tu puntaje de crédito?',
                options: [
                    { text: 'La cantidad de tarjetas que tienes', isCorrect: false },
                    { text: 'Tu historial de pagos a tiempo', isCorrect: true },
                    { text: 'Tu edad', isCorrect: false },
                ],
                explanation: 'El historial de pagos es el componente más pesado (35%), demostrando tu consistencia y fiabilidad.'
            },
            { 
                question: 'Un puntaje de crédito más alto generalmente significa...',
                options: [
                    { text: 'Mayor riesgo para los prestamistas', isCorrect: false },
                    { text: 'Menor riesgo y mejores tasas de interés', isCorrect: true },
                    { text: 'Que tienes muchas deudas', isCorrect: false },
                ],
                explanation: 'Un puntaje alto te califica como un prestatario de bajo riesgo, lo que te da acceso a mejores condiciones y tasas de interés más bajas.'
            },
            { 
                question: '¿Qué es la "utilización de crédito"?',
                options: [
                    { text: 'El total de dinero que has gastado en tu vida', isCorrect: false },
                    { text: 'El porcentaje de tu crédito disponible que estás usando', isCorrect: true },
                    { text: 'La cantidad de tiempo que llevas usando crédito', isCorrect: false },
                ],
                explanation: 'Mantener una utilización baja (idealmente menos del 30%) es crucial, ya que una alta utilización sugiere riesgo financiero a los prestamistas.'
            }
        ]
    },
    { 
        id: '2', 
        title: 'El Peligro del Pago Mínimo', 
        description: 'Por qué pagar solo el mínimo puede ser una trampa de deuda.', 
        category: LessonCategory.ManagingDebt, 
        duration: 7,
        isPremium: false,
        steps: [
            { title: '¿Qué es el Pago Mínimo?', content: 'Es la cantidad más pequeña que el banco te exige pagar para mantener tu cuenta al día. Generalmente es un pequeño porcentaje de tu deuda total.' },
            { title: 'La Trampa de Intereses', content: 'Al pagar solo el mínimo, el resto de tu deuda acumula intereses. Esto puede hacer que tardes años en pagar una compra pequeña y termines pagando mucho más de su valor original.' },
        ],
        quiz: [
            {
                question: '¿Qué sucede si solo realizas el pago mínimo de tu tarjeta de crédito cada mes?',
                options: [
                    { text: 'Tu deuda se paga rápidamente', isCorrect: false },
                    { text: 'Tu puntaje de crédito mejora mucho', isCorrect: false },
                    { text: 'La deuda crece por los intereses y tardas más en pagarla', isCorrect: true },
                ],
                explanation: 'Pagar solo el mínimo hace que la mayor parte de tu pago se vaya a intereses, no al capital, alargando la deuda.'
            },
            {
                question: 'Pagar más del mínimo en tu tarjeta de crédito...',
                options: [
                    { text: 'No tiene ningún efecto en tu puntaje.', isCorrect: false },
                    { text: 'Puede ayudar a reducir tu deuda más rápido y mejorar tu utilización.', isCorrect: true },
                    { text: 'Es penalizado por los bancos.', isCorrect: false },
                ],
                explanation: 'Pagar más del mínimo reduce el capital de tu deuda, lo que disminuye los intereses futuros y mejora tu ratio de utilización de crédito.'
            },
            {
                question: 'Si tienes una deuda de 1000 con un interés del 20% anual y solo pagas el mínimo, ¿cuánto podrías terminar pagando?',
                options: [
                    { text: 'Exactamente 1000.', isCorrect: false },
                    { text: 'Un poco más de 1000.', isCorrect: false },
                    { text: 'Mucho más de 1000, posiblemente el doble o más.', isCorrect: true },
                ],
                explanation: 'Debido al interés compuesto, pagar solo el mínimo puede hacer que termines pagando una cantidad significativamente mayor al monto original de la deuda a lo largo del tiempo.'
            }
        ]
    },
    { 
        id: '3', 
        title: 'Inversiones para Principiantes', 
        description: 'Conceptos básicos para empezar a invertir tu dinero.', 
        category: LessonCategory.BuildingCredit, 
        duration: 12,
        isPremium: true,
        steps: [
            { title: '¿Por qué Invertir?', content: 'Invertir es poner tu dinero a trabajar para que genere más dinero. Ayuda a combatir la inflación y a alcanzar metas financieras a largo plazo como la jubilación.' },
            { title: 'Tipos de Inversión', content: 'Existen diferentes opciones como acciones, bonos, fondos mutuos y bienes raíces. Cada uno tiene un nivel de riesgo y rendimiento distinto. Es clave diversificar.' },
            { title: 'Empezando con Poco', content: 'No necesitas ser millonario para invertir. Puedes empezar con pequeñas cantidades en aplicaciones de micro-inversión o fondos de bajo costo.' },
        ],
        quiz: [
             {
                question: '¿Cuál es el principal objetivo de invertir?',
                options: [
                    { text: 'Gastar dinero rápidamente', isCorrect: false },
                    { text: 'Hacer que tu dinero crezca con el tiempo', isCorrect: true },
                    { text: 'Guardar dinero bajo el colchón', isCorrect: false },
                ],
                explanation: 'Invertir busca generar rendimientos a lo largo del tiempo, superando la inflación y aumentando tu patrimonio.'
            }
        ]
    },
];