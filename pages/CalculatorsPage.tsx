import React, { useState, useMemo } from 'react';
import { Modal } from '../components/Modal';
import { WalletIcon, GoalsIcon, HistoryIcon, StoreIcon, StarIcon, ChartBarIcon, DocumentTextIcon } from '../components/Icons';
import { AppActivePage } from '../App';
import { useAppContext } from '../context/AppContext';
import { Currency, TransactionType, formatCurrency as formatCurrencyUtil, CalculatorId, CalculatorHistoryEntry } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const calculators = [
    { 
        id: 'budget', 
        title: 'Calculadora de presupuesto mensual',
        description: 'Muestra cuánto puedes ahorrar según tus ingresos y gastos.',
        category: 'Finanzas Personales',
        implemented: true,
        isPremium: false,
    },
    { 
        id: 'savingsGoal', 
        title: 'Calculadora de ahorro objetivo',
        description: 'Estima cuánto ahorrar cada mes para alcanzar una meta.',
        category: 'Finanzas Personales',
        implemented: true,
        isPremium: false,
    },
     { 
        id: 'emergencyFund', 
        title: 'Calculadora de fondo de emergencia',
        description: 'Determina cuánto deberías tener ahorrado para imprevistos.',
        category: 'Finanzas Personales',
        implemented: true,
        isPremium: false,
    },
     { 
        id: 'compoundInterest', 
        title: 'Calculadora de inversión compuesta',
        description: 'Proyecta el crecimiento de tu dinero con el tiempo.',
        category: 'Inversión y Crecimiento',
        implemented: true,
        isPremium: false,
    },
    { 
        id: 'inflation', 
        title: 'Calculadora de inflación',
        description: 'Calcula cómo pierde valor el dinero con el tiempo.',
        category: 'Inversión y Crecimiento',
        implemented: true,
        isPremium: true,
    },
    { 
        id: 'personalLoan', 
        title: 'Calculadora de crédito personal',
        description: 'Permite simular cuotas, intereses y total a pagar.',
        category: 'Crédito y Deuda',
        implemented: true,
        isPremium: false,
    },
     { 
        id: 'debtCapacity', 
        title: 'Capacidad de endeudamiento',
        description: 'Evalúa cuánto puedes pedir prestado sin sobreendeudarte.',
        category: 'Crédito y Deuda',
        implemented: true,
        isPremium: true,
    },
];

const calculatorsByCategory = calculators.reduce((acc, calc) => {
    (acc[calc.category] = acc[calc.category] || []).push(calc);
    return acc;
}, {} as Record<string, typeof calculators>);


// --- Calculator Components ---

interface CalculatorProps {
    currency: Currency;
    onSave: (entry: Omit<CalculatorHistoryEntry, 'id' | 'date'>) => void;
    calculatorId: CalculatorId;
    calculatorTitle: string;
}

const KpiModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { state } = useAppContext();
    const { transactions, goals, user, calculatorHistory } = state;
    const { t } = useTranslation();

    const kpis = useMemo(() => {
        if (!transactions) return { totalIncome: 0, totalExpenses: 0, totalAllocatedToGoals: 0, netSavings: 0 };

        const totalIncome = transactions
            .filter(t => t.type === TransactionType.Aporte || t.type === TransactionType.RetiroMeta)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === TransactionType.Gasto)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalAllocatedToGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        
        const netSavings = totalIncome - totalExpenses;
        
        const budgetSimulations = calculatorHistory.filter(c => c.calculatorId === 'budget');
        const avgSavingsCapacity = budgetSimulations.length > 0
            ? budgetSimulations.reduce((sum, sim) => sum + (sim.results.savings as number), 0) / budgetSimulations.length
            : null;

        return { totalIncome, totalExpenses, totalAllocatedToGoals, netSavings, avgSavingsCapacity };
    }, [transactions, goals, calculatorHistory]);

    if (!user) return null;

    const format = (amount: number) => formatCurrencyUtil(amount, user.currency);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Resumen de Movimientos y KPIs">
            <div className="space-y-3">
                <div className="flex items-center p-3 bg-borde-sutil dark:bg-dark-borde rounded-lg">
                    <div className="p-2 bg-green-100 dark:bg-primary/20 rounded-full mr-3">
                       <WalletIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm text-gray-700 dark:text-dark-texto-sutil">Total de Ingresos</p>
                       <p className="text-xl font-bold text-primary">{format(kpis.totalIncome)}</p>
                    </div>
                </div>
                 <div className="flex items-center p-3 bg-borde-sutil dark:bg-dark-borde rounded-lg">
                    <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full mr-3">
                       <WalletIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm text-gray-700 dark:text-dark-texto-sutil">Total de Gastos</p>
                       <p className="text-xl font-bold text-red-500">{format(kpis.totalExpenses)}</p>
                    </div>
                </div>
                 <div className={`p-3 rounded-lg flex items-center ${kpis.netSavings >= 0 ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                    <div className={`p-2 rounded-full mr-3 ${kpis.netSavings >= 0 ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                       <WalletIcon className={`w-6 h-6 ${kpis.netSavings >= 0 ? 'text-green-700' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                       <p className={`text-sm ${kpis.netSavings >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>Ahorro Neto (Ingresos - Gastos)</p>
                       <p className={`text-xl font-bold ${kpis.netSavings >= 0 ? 'text-green-700' : 'text-red-600'}`}>{format(kpis.netSavings)}</p>
                    </div>
                </div>
                 <div className="flex items-center p-3 bg-blue-50 dark:bg-secondary/10 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-secondary/20 rounded-full mr-3">
                       <GoalsIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm text-blue-800 dark:text-blue-200">Total Ahorrado en Metas</p>
                       <p className="text-xl font-bold text-secondary">{format(kpis.totalAllocatedToGoals)}</p>
                    </div>
                </div>
                {kpis.avgSavingsCapacity !== null && (
                    <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-full mr-3">
                           <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm text-yellow-800 dark:text-yellow-200">Capacidad de Ahorro Promedio (Simulada)</p>
                           <p className="text-xl font-bold text-yellow-700">{format(kpis.avgSavingsCapacity)}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}


const BudgetCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const { t } = useTranslation();
    const savings = useMemo(() => {
        const inc = parseFloat(income);
        const exp = parseFloat(expenses);
        return !isNaN(inc) && !isNaN(exp) ? inc - exp : null;
    }, [income, expenses]);

    const handleSave = () => {
        if (savings !== null) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Ingresos': income, 'Gastos': expenses },
                results: { 'Ahorro': formatCurrencyUtil(savings, currency), savings: savings }
            });
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Ingresos Mensuales Totales</label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Ej: 2000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Gastos Mensuales Totales</label>
                <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="Ej: 1500" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            {savings !== null && (
                <>
                    <div className={`text-center p-4 rounded-lg ${savings >= 0 ? 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200'}`}>
                        <p className="text-sm">Capacidad de Ahorro Mensual</p>
                        <p className="text-2xl font-bold">{formatCurrencyUtil(savings, currency)}</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
        </div>
    )
}

const SavingsGoalCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [target, setTarget] = useState('');
    const [months, setMonths] = useState('');
    const { t } = useTranslation();
    const monthlySaving = useMemo(() => {
        const t = parseFloat(target);
        const m = parseInt(months);
        return !isNaN(t) && !isNaN(m) && m > 0 ? t / m : null;
    }, [target, months]);
    
    const handleSave = () => {
        if (monthlySaving !== null) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Monto Meta': target, 'Plazo (meses)': months },
                results: { 'Ahorro Mensual': formatCurrencyUtil(monthlySaving, currency) }
            });
        }
    }

    return (
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Monto de la Meta</label>
                <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Ej: 1200" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Tiempo para alcanzarla (en meses)</label>
                <input type="number" value={months} onChange={e => setMonths(e.target.value)} placeholder="Ej: 12" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            {monthlySaving !== null && (
                <>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-secondary/10 text-blue-800 dark:text-blue-200">
                        <p className="text-sm">Necesitas Ahorrar por Mes</p>
                        <p className="text-2xl font-bold">{formatCurrencyUtil(monthlySaving, currency)}</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
        </div>
    )
}

const EmergencyFundCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [expenses, setExpenses] = useState('');
    const [months, setMonths] = useState('3');
    const { t } = useTranslation();
    const emergencyFund = useMemo(() => {
        const exp = parseFloat(expenses);
        const m = parseInt(months);
        return !isNaN(exp) && !isNaN(m) && m > 0 ? exp * m : null;
    }, [expenses, months]);

    const handleSave = () => {
        if (emergencyFund !== null) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Gastos Mensuales': expenses, 'Meses Cobertura': months },
                results: { 'Fondo de Emergencia': formatCurrencyUtil(emergencyFund, currency) }
            });
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Tus Gastos Mensuales Esenciales</label>
                <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="Ej: 1200" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Meses de Cobertura</label>
                <select value={months} onChange={e => setMonths(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                    <option value="3">3 meses (Básico)</option>
                    <option value="6">6 meses (Recomendado)</option>
                    <option value="9">9 meses</option>
                    <option value="12">12 meses</option>
                </select>
            </div>
            {emergencyFund !== null && (
                <>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-secondary/10 text-blue-800 dark:text-blue-200">
                        <p className="text-sm">Tu Fondo de Emergencia Debería Ser</p>
                        <p className="text-2xl font-bold">{formatCurrencyUtil(emergencyFund, currency)}</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
        </div>
    )
}

const PersonalLoanCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState(''); // TEA
    const [term, setTerm] = useState('');
    const [disbursementFee, setDisbursementFee] = useState('');
    const [monthlyInsurance, setMonthlyInsurance] = useState('');
    const { t } = useTranslation();
    
    const results = useMemo(() => {
        const P = parseFloat(amount);
        const annualRate = parseFloat(rate);
        const n = parseInt(term);
        const disbFee = parseFloat(disbursementFee) || 0;
        const monthIns = parseFloat(monthlyInsurance) || 0;

        if (isNaN(P) || isNaN(annualRate) || isNaN(n) || P <= 0 || annualRate <= 0 || n <= 0) {
            return null;
        }

        const tem = Math.pow(1 + annualRate / 100, 1/12) - 1; // Tasa Efectiva Mensual
        
        const monthlyPaymentPrincipal = (P * tem * Math.pow(1 + tem, n)) / (Math.pow(1 + tem, n) - 1);
        const totalMonthlyPayment = monthlyPaymentPrincipal + monthIns;

        const amortizationSchedule = [];
        let balance = P;
        for(let i=1; i<=n; i++) {
            const interest = balance * tem;
            const principal = monthlyPaymentPrincipal - interest;
            const finalBalance = balance - principal;
            amortizationSchedule.push({
                month: i,
                initialBalance: balance,
                interest,
                principal,
                monthlyPayment: monthlyPaymentPrincipal,
                finalBalance
            });
            balance = finalBalance;
        }

        const totalPayment = totalMonthlyPayment * n + disbFee;
        const totalInterest = (monthlyPaymentPrincipal * n) - P;

        // TCEA Calculation using IRR (binary search)
        const cashFlow = [- (P - disbFee), ...Array(n).fill(totalMonthlyPayment)];
        let low = 0, high = 1, mid = 0, npv = 0;
        for (let i = 0; i < 100; i++) {
            mid = (low + high) / 2;
            npv = cashFlow.reduce((acc, val, t) => acc + val / Math.pow(1 + mid, t), 0);
            if (npv > 0) low = mid;
            else high = mid;
        }
        const tcea = Math.pow(1 + mid, 12) - 1;

        return { monthlyPayment: totalMonthlyPayment, totalPayment, totalInterest, tcea, schedule: amortizationSchedule };
    }, [amount, rate, term, disbursementFee, monthlyInsurance]);

    const handleSave = () => {
        if (results) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: {
                    'Monto del Préstamo': amount,
                    'TEA %': rate,
                    'Plazo (meses)': term,
                    'Costo Desembolso': disbursementFee || '0',
                    'Seguro Mensual': monthlyInsurance || '0'
                },
                results: {
                    'Cuota Mensual': formatCurrencyUtil(results.monthlyPayment, currency),
                    'Pago Total': formatCurrencyUtil(results.totalPayment, currency),
                    'Intereses Totales': formatCurrencyUtil(results.totalInterest, currency),
                    'TCEA': `${(results.tcea * 100).toFixed(2)}%`
                }
            });
        }
    };

    return (
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Monto del Préstamo ({currency.symbol})</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ej: 5000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Tasa de Interés Efectiva Anual (TEA %)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Ej: 35" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Plazo del Préstamo (en meses)</label>
                <input type="number" value={term} onChange={e => setTerm(e.target.value)} placeholder="Ej: 36" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Costo de Desembolso (opcional)</label>
                <input type="number" value={disbursementFee} onChange={e => setDisbursementFee(e.target.value)} placeholder="Ej: 50" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Seguro de Desgravamen Mensual (opcional)</label>
                <input type="number" value={monthlyInsurance} onChange={e => setMonthlyInsurance(e.target.value)} placeholder="Ej: 10" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            {results && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Cuota Mensual Total</span>
                        <span className="text-xl font-bold">{formatCurrencyUtil(results.monthlyPayment, currency)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span>Pago Total del Crédito</span>
                        <span>{formatCurrencyUtil(results.totalPayment, currency)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-red-600">Intereses Totales</span>
                        <span className="text-red-600">{formatCurrencyUtil(results.totalInterest, currency)}</span>
                    </div>
                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200 dark:border-green-500/20">
                        <span className="font-semibold text-blue-800 dark:text-blue-200">TCEA</span>
                        <span className="text-lg font-bold text-blue-800 dark:text-blue-200">{(results.tcea * 100).toFixed(2)}%</span>
                    </div>
                    <p className="text-xs text-center text-gray-600 dark:text-dark-texto-sutil pt-2">La TCEA (Tasa de Costo Efectivo Anual) incluye intereses, comisiones y gastos.</p>
                
                    <details className="pt-2">
                      <summary className="text-sm font-semibold cursor-pointer text-texto-oscuro dark:text-dark-texto">Ver Tabla de Amortización</summary>
                      <div className="mt-2 text-xs h-48 overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-green-100 dark:bg-green-500/20">
                            <tr>
                              <th className="p-1 font-semibold text-texto-oscuro dark:text-dark-texto">Mes</th>
                              <th className="p-1 font-semibold text-texto-oscuro dark:text-dark-texto">Interés</th>
                              <th className="p-1 font-semibold text-texto-oscuro dark:text-dark-texto">Principal</th>
                              <th className="p-1 font-semibold text-texto-oscuro dark:text-dark-texto">Saldo Final</th>
                            </tr>
                          </thead>
                          <tbody className="text-texto-oscuro dark:text-dark-texto">
                            {results.schedule.map(row => (
                              <tr key={row.month} className="border-b border-green-200 dark:border-green-500/20">
                                <td className="p-1">{row.month}</td>
                                <td className="p-1">{formatCurrencyUtil(row.interest, currency)}</td>
                                <td className="p-1">{formatCurrencyUtil(row.principal, currency)}</td>
                                <td className="p-1">{formatCurrencyUtil(row.finalBalance, currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </div>
            )}
        </div>
    )
}

const CompoundInterestCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [initial, setInitial] = useState('');
    const [monthly, setMonthly] = useState('');
    const [rate, setRate] = useState('');
    const [years, setYears] = useState('');
    const { t } = useTranslation();
    
    const result = useMemo(() => {
        const P = parseFloat(initial) || 0;
        const PMT = parseFloat(monthly) || 0;
        const r = parseFloat(rate) / 100;
        const t = parseInt(years);
        const n = 12; // Compounded monthly
        
        if(isNaN(r) || isNaN(t) || t <= 0) return null;

        const futureValuePrincipal = P * Math.pow(1 + r / n, n * t);
        const futureValueSeries = PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));
        const total = futureValuePrincipal + futureValueSeries;
        const totalContributions = P + (PMT * t * 12);
        const totalInterest = total - totalContributions;

        return { total, totalContributions, totalInterest };

    }, [initial, monthly, rate, years]);
    
    const handleSave = () => {
        if (result) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Inversión Inicial': initial, 'Aporte Mensual': monthly, 'Tasa Anual %': rate, 'Años': years },
                results: { 'Valor Futuro': formatCurrencyUtil(result.total, currency), 'Total Intereses': formatCurrencyUtil(result.totalInterest, currency) }
            });
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Inversión Inicial ({currency.symbol})</label>
                <input type="number" value={initial} onChange={e => setInitial(e.target.value)} placeholder="Ej: 1000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Aporte Mensual ({currency.symbol})</label>
                <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="Ej: 100" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Tasa de Interés Anual (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Ej: 8" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Años de Inversión</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Ej: 10" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             {result && (
                <>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-secondary/10 text-blue-800 dark:text-blue-200 space-y-3">
                        <div className="text-center">
                            <p className="text-sm">Valor Futuro de la Inversión</p>
                            <p className="text-2xl font-bold">{formatCurrencyUtil(result.total, currency)}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-200 dark:border-secondary/20">
                            <span>Total Aportado</span>
                            <span>{formatCurrencyUtil(result.totalContributions, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-primary font-semibold">
                            <span>Intereses Ganados</span>
                            <span>{formatCurrencyUtil(result.totalInterest, currency)}</span>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
        </div>
    );
};

const InflationCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [years, setYears] = useState('');
    const { t } = useTranslation();
    
    const result = useMemo(() => {
        const A = parseFloat(amount);
        const r = parseFloat(rate) / 100;
        const t = parseInt(years);
        if(isNaN(A) || isNaN(r) || isNaN(t) || t <= 0) return null;
        
        const futureValue = A * Math.pow(1 - r, t);
        
        return { futureValue };
    }, [amount, rate, years]);
    
    const handleSave = () => {
        if (result) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Monto Actual': amount, 'Tasa Inflación %': rate, 'Años': years },
                results: { 'Poder Adquisitivo Futuro': formatCurrencyUtil(result.futureValue, currency) }
            });
        }
    }

     return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Monto Actual ({currency.symbol})</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ej: 1000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Tasa de Inflación Anual (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Ej: 5" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Número de Años</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Ej: 5" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            {result && (
                <>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-200">
                        <p className="text-sm">En {years} años, {formatCurrencyUtil(parseFloat(amount), currency)} tendrán el poder adquisitivo de</p>
                        <p className="text-2xl font-bold">{formatCurrencyUtil(result.futureValue, currency)} de hoy</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
        </div>
    );
};

const DebtCapacityCalculator: React.FC<CalculatorProps> = ({ currency, onSave, calculatorId, calculatorTitle }) => {
    const [income, setIncome] = useState('');
    const [fixedExpenses, setFixedExpenses] = useState('');
    const { t } = useTranslation();
    
    const result = useMemo(() => {
        const inc = parseFloat(income);
        const exp = parseFloat(fixedExpenses);
        if(isNaN(inc) || isNaN(exp)) return null;

        const disposableIncome = inc - exp;
        const debtCapacity = disposableIncome * 0.35; // Recommended max 35-40%
        return { debtCapacity };
    }, [income, fixedExpenses]);
    
    const handleSave = () => {
        if (result) {
            onSave({
                calculatorId,
                calculatorTitle,
                inputs: { 'Ingresos Netos': income, 'Gastos Fijos': fixedExpenses },
                results: { 'Capacidad de Deuda Mensual': formatCurrencyUtil(result.debtCapacity, currency) }
            });
        }
    }
    
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Ingresos Mensuales Netos</label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Ej: 3000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-texto-sutil">Gastos Fijos Mensuales (sin deudas)</label>
                <input type="number" value={fixedExpenses} onChange={e => setFixedExpenses(e.target.value)} placeholder="Ej: 1500" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-borde border border-gray-300 dark:border-dark-borde rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             {result && result.debtCapacity > 0 && (
                <>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200">
                        <p className="text-sm">Tu cuota mensual máxima recomendada para nuevas deudas es</p>
                        <p className="text-2xl font-bold">{formatCurrencyUtil(result.debtCapacity, currency)}</p>
                        <p className="text-xs mt-2">Esto es el 35% de tus ingresos disponibles. No te endeudes por encima de este monto para mantener una buena salud financiera.</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">{t('calculatorsSaveSimulation')}</button>
                </>
            )}
             {result && result.debtCapacity <= 0 && (
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200">
                    <p className="text-sm">No es recomendable que adquieras nuevas deudas en este momento, ya que tus gastos superan o igualan tus ingresos.</p>
                </div>
            )}
        </div>
    );
};


interface CalculatorsPageProps {
    setActivePage: (page: AppActivePage) => void;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { t } = useTranslation();
    const isPremium = user?.subscriptionTier === 'premium';

    const [activeCalculator, setActiveCalculator] = useState<CalculatorId>(null);
    const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const currentCalculator = useMemo(() => calculators.find(c => c.id === activeCalculator), [activeCalculator]);

    const handleCalculatorClick = (calc: typeof calculators[0]) => {
        if (!calc.implemented) return;

        if (calc.isPremium && !isPremium) {
            setUpgradeModalOpen(true);
        } else {
            setActiveCalculator(calc.id as CalculatorId);
        }
    };
    
     const handleSaveCalculation = (entry: Omit<CalculatorHistoryEntry, 'id' | 'date'>) => {
        dispatch({ type: 'SAVE_CALCULATION', payload: entry });
        setActiveCalculator(null);
    };

    const renderCalculator = () => {
        if (!user || !currentCalculator) return null;
        const props = {
             currency: user.currency,
             onSave: handleSaveCalculation,
             calculatorId: currentCalculator.id as CalculatorId,
             calculatorTitle: currentCalculator.title
        };
        switch(activeCalculator) {
            case 'budget': return <BudgetCalculator {...props} />;
            case 'savingsGoal': return <SavingsGoalCalculator {...props} />;
            case 'emergencyFund': return <EmergencyFundCalculator {...props} />;
            case 'personalLoan': return <PersonalLoanCalculator {...props} />;
            case 'compoundInterest': return <CompoundInterestCalculator {...props} />;
            case 'inflation': return <InflationCalculator {...props} />;
            case 'debtCapacity': return <DebtCapacityCalculator {...props} />;
            default: return null;
        }
    }

    return (
        <div className="p-6 pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-texto-oscuro dark:text-dark-texto">Centro Financiero</h1>
                <p className="text-gray-600 dark:text-dark-texto-sutil">Gestiona y planifica tu dinero.</p>
            </header>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                    onClick={() => setActivePage('walletPage')}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:bg-borde-sutil dark:hover:bg-dark-borde transition-colors"
                >
                    <WalletIcon className="w-8 h-8 text-secondary mb-2" />
                    <span className="font-semibold text-texto-oscuro dark:text-dark-texto">Wallet</span>
                </button>
                <button
                    onClick={() => setActivePage('goals')}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:bg-borde-sutil dark:hover:bg-dark-borde transition-colors"
                >
                    <GoalsIcon className="w-8 h-8 text-primary mb-2" />
                    <span className="font-semibold text-texto-oscuro dark:text-dark-texto">Nuestras Metas</span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                 <button
                    onClick={() => setActivePage('marketplace')}
                    className="flex items-center justify-start text-left p-4 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:bg-borde-sutil dark:hover:bg-dark-borde transition-colors"
                >
                    <StoreIcon className="w-8 h-8 text-secondary mb-2 mr-4 flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-texto-oscuro dark:text-dark-texto">Marketplace</span>
                        <p className="text-xs text-gray-600 dark:text-dark-texto-sutil">Explora ofertas.</p>
                    </div>
                </button>
                 <button
                    onClick={() => setActivePage('checklist')}
                    className="flex items-center justify-start text-left p-4 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:bg-borde-sutil dark:hover:bg-dark-borde transition-colors"
                >
                    <DocumentTextIcon className="w-8 h-8 text-primary mb-2 mr-4 flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-texto-oscuro dark:text-dark-texto">{t('financeGoToChecklist')}</span>
                        <p className="text-xs text-gray-600 dark:text-dark-texto-sutil">Sube y gestiona.</p>
                    </div>
                </button>
            </div>

            <div className="space-y-6">
                {Object.entries(calculatorsByCategory).map(([category, calcs]) => (
                    <div key={category}>
                        <h2 className="text-lg font-bold text-texto-oscuro dark:text-dark-texto mb-3 flex items-center gap-2">
                            {category === 'Inversión y Crecimiento' && <ChartBarIcon className="w-5 h-5" />}
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {calcs.map(calc => (
                                <button
                                    key={calc.id}
                                    onClick={() => handleCalculatorClick(calc)}
                                    disabled={!calc.implemented}
                                    className={`bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 text-left transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden`}
                                >
                                    {calc.isPremium && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-300 px-2 py-1 rounded-full">
                                            <StarIcon className="w-3 h-3"/>
                                            Premium
                                        </div>
                                    )}
                                    <h3 className="font-bold text-texto-oscuro dark:text-dark-texto pr-16">{calc.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-dark-texto-sutil mt-1">{calc.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                 <button
                    onClick={() => setIsKpiModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-green-700 transition-colors"
                >
                    <HistoryIcon className="w-5 h-5" />
                    <span>KPIs</span>
                </button>
                <button
                    onClick={() => setActivePage('calculatorHistory')}
                    className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-dark-surface text-texto-oscuro dark:text-dark-texto font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-borde-sutil dark:hover:bg-dark-borde transition-colors"
                >
                     <HistoryIcon className="w-5 h-5" />
                    <span>Historial</span>
                </button>
            </div>

            <Modal isOpen={!!activeCalculator} onClose={() => setActiveCalculator(null)} title={currentCalculator?.title || ''}>
                {renderCalculator()}
            </Modal>

            <Modal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Función Premium">
                <div className="text-center p-4">
                    <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-texto-oscuro dark:text-dark-texto">Calculadora Avanzada</h3>
                    <p className="text-gray-600 dark:text-dark-texto-sutil my-4">
                        Esta herramienta es exclusiva para usuarios Premium. ¡Mejora tu plan para obtener análisis financieros más profundos!
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

            <KpiModal isOpen={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)} />
        </div>
    );
};