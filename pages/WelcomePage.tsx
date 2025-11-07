
import React from 'react';

type AuthPage = 'welcome' | 'login' | 'register';

interface WelcomePageProps {
    setAuthPage: (page: AuthPage) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ setAuthPage }) => {
    return (
        <div className="font-poppins bg-fondo text-texto-oscuro">
            <div className="relative max-w-lg mx-auto bg-fondo min-h-screen shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-5xl font-bold text-primary mb-4">AVANZAPLUS</h1>
                    <p className="text-xl text-gray-600">Tu camino hacia un mejor crédito comienza aquí.</p>
                </div>
                <div className="w-full pb-8">
                     <button 
                        onClick={() => setAuthPage('register')} 
                        className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg text-lg mb-4"
                    >
                        Registrarse
                    </button>
                    <button 
                        onClick={() => setAuthPage('login')} 
                        className="w-full bg-white text-primary font-bold py-4 px-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg border-2 border-primary"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
