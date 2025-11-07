import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, formatCurrency } from '../types';
import { Modal } from '../components/Modal';
import { Confetti } from '../components/Confetti';
import { useAppContext } from '../context/AppContext';
import { AppActivePage } from '../App';
import { CameraIcon } from '../components/Icons';
import { extractExpenseFromReceipt } from '../services/geminiService';
import { useTranslation } from '../hooks/useTranslation';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove the data URL prefix
        };
        reader.onerror = error => reject(error);
    });
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { state } = useAppContext();
    const { goals, user } = state;

    if (!user) return null;

    const isPositive = transaction.type === TransactionType.Aporte || transaction.type === TransactionType.RetiroMeta;
    const amountColor = isPositive ? 'text-primary' : 'text-red-500';
    const sign = isPositive ? '+' : '-';

    const formattedAmount = formatCurrency(transaction.amount, user.currency);

    let description = transaction.description ? `(${transaction.description})` : '';
    if (transaction.relatedGoal) {
        const goal = goals.find(g => g.id === transaction.relatedGoal);
        if(goal) {
            description = `(Meta: ${goal.name})`;
        }
    }

    return (
        <div className="flex items-center justify-between py-3 border-b border-borde-sutil">
            <div>
                <p className="font-semibold text-texto-oscuro">
                    {transaction.type}
                </p>
                <p className="text-sm text-gray-500">{transaction.date.toLocaleDateString()} {description}</p>
            </div>
            <p className={`font-bold ${amountColor}`}>{sign} {formattedAmount}</p>
        </div>
    );
}
interface WalletPageProps {
    setActivePage: (page: AppActivePage) => void;
}


export const WalletPage: React.FC<WalletPageProps> = ({ setActivePage }) => {
    const { state, dispatch } = useAppContext();
    const { user, transactions } = state;
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const [isAporteModalOpen, setAporteModalOpen] = useState(false);
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const [aporteAmount, setAporteAmount] = useState('');

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDescription, setWithdrawDescription] = useState('');
    const [withdrawError, setWithdrawError] = useState<string | null>(null);

    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'confirm'>('idle');
    const [scannedData, setScannedData] = useState<{ amount: number | null, description: string | null}>({ amount: null, description: null});

    const handleAporteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(aporteAmount);
        if (!amount || amount <= 0) {
            alert("Por favor, introduce un monto válido.");
            return;
        }
        
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: { amount, type: TransactionType.Aporte }
        });

        setAporteModalOpen(false);
        setAporteAmount('');
        
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    const handleWithdrawSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        
        if (!amount || amount <= 0) {
            setWithdrawError("Por favor, introduce un monto válido.");
            return;
        }
        if (user && amount > user.walletBalance) {
            setWithdrawError("No puedes retirar más de tu balance actual.");
            return;
        }

        dispatch({
            type: 'ADD_TRANSACTION',
            payload: { amount, type: TransactionType.Gasto, description: withdrawDescription }
        });
        
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        setWithdrawDescription('');
        setWithdrawError(null);
    };

    const handleScanClick = () => {
        setIsScanModalOpen(true);
        cameraInputRef.current?.click();
    };

    const handleScanFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setScanStatus('scanning');
            try {
                const base64 = await fileToBase64(file);
                const result = await extractExpenseFromReceipt(base64);
                setScannedData(result);
                setScanStatus('confirm');
                // Pre-fill withdraw form
                setWithdrawAmount(result.amount?.toString() ?? '');
                setWithdrawDescription(result.description ?? '');

            } catch (error) {
                console.error("Scan failed", error);
                setScanStatus('idle');
                setIsScanModalOpen(false);
                alert("No se pudo procesar la imagen del recibo.");
            }
        } else {
            setIsScanModalOpen(false);
        }
        event.target.value = '';
    };

    const handleConfirmScannedExpense = () => {
        setWithdrawModalOpen(true); // Open the regular withdraw modal, pre-filled
        setIsScanModalOpen(false);
        setScanStatus('idle');
    };
    
    if (!user) return null;

    return (
        <div className="p-6 pb-24">
            {showConfetti && <Confetti />}
             <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture onChange={handleScanFileChange} />

            <header className="mb-6 text-center relative">
                 <button 
                    onClick={() => setActivePage('finanzas')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary hover:underline"
                >
                    &larr; Volver
                </button>
                <h1 className="text-2xl font-bold text-texto-oscuro">Wallet</h1>
            </header>

            <div className="bg-primary text-white rounded-2xl shadow-lg p-6 mb-6 text-center">
                <p className="text-sm opacity-80 mb-1">Balance Actual</p>
                <p className="text-4xl font-bold tracking-wider">{formatCurrency(user.walletBalance, user.currency)}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                <button 
                    onClick={() => setAporteModalOpen(true)}
                    className="col-span-1 bg-secondary text-white font-semibold py-3 px-2 rounded-xl shadow-md hover:bg-blue-600 transition-colors"
                >
                    Aportar
                </button>
                <button 
                    onClick={() => setWithdrawModalOpen(true)}
                    className="col-span-1 bg-white text-texto-oscuro font-semibold py-3 px-2 rounded-xl shadow-md border border-borde-sutil hover:bg-gray-50 transition-colors">
                    {t('walletWithdrawButton')}
                </button>
                 <button 
                    onClick={handleScanClick}
                    className="col-span-1 flex items-center justify-center gap-2 bg-white text-texto-oscuro font-semibold py-3 px-2 rounded-xl shadow-md border border-borde-sutil hover:bg-gray-50 transition-colors">
                    <CameraIcon className="w-5 h-5"/> Escanear
                </button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-texto-oscuro mb-2">Historial Reciente</h3>
                {transactions.slice(0, 10).map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
            </div>

             <Modal isOpen={isAporteModalOpen} onClose={() => setAporteModalOpen(false)} title="Realizar Aporte a Wallet">
                <form onSubmit={handleAporteSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Monto a aportar</label>
                        <div className="relative mt-1">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-600 sm:text-sm">{user.currency.symbol}</span>
                            </div>
                            <input 
                                type="number" 
                                value={aporteAmount}
                                onChange={(e) => setAporteAmount(e.target.value)}
                                placeholder="0.00" 
                                className="block w-full rounded-md border-0 py-2 pl-7 pr-2 bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                step="0.01"
                                min="0.01"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">
                        Confirmar Aporte
                    </button>
                </form>
            </Modal>
            
            <Modal isOpen={isWithdrawModalOpen} onClose={() => { setWithdrawModalOpen(false); setWithdrawError(null); }} title="Registrar Gasto">
                <form onSubmit={handleWithdrawSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Monto del gasto</label>
                         <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-600 sm:text-sm">{user.currency.symbol}</span>
                            </div>
                            <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => {
                                    setWithdrawAmount(e.target.value);
                                    if (withdrawError) setWithdrawError(null);
                                }}
                                placeholder="0.00" 
                                className={`block w-full rounded-md border-0 py-2 pl-7 pr-2 bg-white border ${withdrawError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                                step="0.01"
                                min="0.01"
                            />
                        </div>
                         {withdrawError && <p className="text-red-500 text-xs mt-1">{withdrawError}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
                        <input 
                            type="text" 
                            value={withdrawDescription}
                            onChange={(e) => setWithdrawDescription(e.target.value)}
                            placeholder="Ej: Supermercado" 
                            className="block w-full rounded-md border-0 py-2 px-3 bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-red-600 transition-colors">
                        Confirmar Gasto
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isScanModalOpen} onClose={() => { setIsScanModalOpen(false); setScanStatus('idle'); }} title="Escanear Recibo">
                {scanStatus === 'scanning' && (
                     <div className="flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-600">Analizando recibo con IA...</p>
                    </div>
                )}
                 {scanStatus === 'confirm' && (
                    <div className="p-4 text-center">
                        <h3 className="text-xl font-bold text-texto-oscuro mb-4">Recibo Analizado</h3>
                        <p className="text-gray-700">Monto: <strong className="text-primary">{formatCurrency(scannedData.amount ?? 0, user.currency)}</strong></p>
                        <p className="text-gray-700 mb-6">Descripción: <strong className="text-primary">{scannedData.description ?? 'No encontrado'}</strong></p>
                        <button onClick={handleConfirmScannedExpense} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors">
                           Confirmar y Registrar
                        </button>
                         <button onClick={() => { setIsScanModalOpen(false); setScanStatus('idle'); }} className="w-full mt-2 text-sm text-gray-600">
                           Cancelar
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};