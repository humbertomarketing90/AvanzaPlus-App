
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SUPPORTED_CURRENCIES, Currency } from '../types';

type AuthPage = 'welcome' | 'login' | 'register';

interface RegisterPageProps {
    setAuthPage: (page: AuthPage) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setAuthPage }) => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(SUPPORTED_CURRENCIES[0].code);
    const [error, setError] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.trim().length < 2) {
            setError('Por favor, introduce un nombre válido.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        
        const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrencyCode) || SUPPORTED_CURRENCIES[0];
        
        // In a real app, you would also check if the email is already registered.
        
        dispatch({ 
            type: 'REGISTER', 
            payload: { 
                name: name.trim(), 
                email: email.toLowerCase(),
                password, // In a real app, you'd send a hash to the backend
                currency: selectedCurrency 
            } 
        });
        // After dispatch, the App component will handle navigation to the onboarding screen
    };

    return (
        <div className="font-poppins bg-fondo text-texto-oscuro">
            <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col items-center justify-center p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">AVANZAPLUS</h1>
                    <p className="text-lg text-gray-600">Crea tu cuenta para empezar.</p>
                </div>
                <form onSubmit={handleRegister} className="w-full bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-center text-texto-oscuro mb-6">Registro</h2>
                    {error && <p className="bg-red-100 text-red-700 text-center p-3 rounded-lg mb-4 text-sm">{error}</p>}
                    
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tu Nombre</p>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Escribe tu nombre" required className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email-register" className="block text-sm font-medium text-gray-700">Correo Electrónico</p>
                        <input id="email-register" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu.correo@ejemplo.com" required className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">Contraseña</p>
                        <input id="password-register" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</p>
                        <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" required className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="currency-register" className="block text-sm font-medium text-gray-700">Moneda</p>
                         <select id="currency-register" value={selectedCurrencyCode} onChange={(e) => setSelectedCurrencyCode(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            {SUPPORTED_CURRENCIES.map((currency) => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md">
                        Crear Cuenta
                    </button>
                    <div className="text-center mt-4">
                        <button type="button" onClick={() => setAuthPage('login')} className="text-sm font-medium text-secondary hover:underline">
                            ¿Ya tienes cuenta? Inicia Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
