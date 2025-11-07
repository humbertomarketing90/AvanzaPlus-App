
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

type AuthPage = 'welcome' | 'login' | 'register';

interface LoginPageProps {
    setAuthPage: (page: AuthPage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setAuthPage }) => {
    const { dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // For this app, we only check against the hardcoded admin credentials.
        // A real app would check against a database or a list of registered users.
        if (email.toLowerCase() === 'admin@avanzaplus.com' && password === '123456') {
            dispatch({ type: 'LOGIN' });
        } else {
            setError('Correo electrónico o contraseña incorrectos.');
        }
    };

    return (
        <div className="font-poppins bg-fondo text-texto-oscuro">
            <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col items-center justify-center p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">AVANZAPLUS</h1>
                    <p className="text-lg text-gray-600">Bienvenido/a de vuelta.</p>
                </div>
                <form onSubmit={handleLogin} className="w-full bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-center text-texto-oscuro mb-6">Iniciar Sesión</h2>
                    {error && <p className="bg-red-100 text-red-700 text-center p-3 rounded-lg mb-4 text-sm">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</p>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@avanzaplus.com"
                            required
                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</p>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="123456"
                            required
                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-md">
                        Entrar
                    </button>
                    <div className="text-center mt-4">
                        <button type="button" onClick={() => setAuthPage('register')} className="text-sm font-medium text-secondary hover:underline">
                            ¿No tienes cuenta? Regístrate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};