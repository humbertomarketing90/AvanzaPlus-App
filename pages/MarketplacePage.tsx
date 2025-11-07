import React, { useState, useMemo } from 'react';
import { AppActivePage } from '../App';
import { StoreIcon, CheckCircleIcon, LockClosedIcon, StarIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { buildChecklist, Item } from '../utils/checklist';
import { Confetti } from '../components/Confetti';
import { CreditType } from '../types';

interface MarketplacePageProps {
  setActivePage: (page: AppActivePage) => void;
}

type Product = {
    id: number;
    name: string;
    entity: string;
    type: "Microcrédito" | "Consumo" | "Hipotecario";
    rate: string;
    features: string[];
    isPremium?: boolean;
};

const mockProducts: Product[] = [
    {
        id: 1,
        name: "Crédito Negocio Rápido",
        entity: "Financiera Confianza",
        type: "Microcrédito",
        rate: "Desde 45% TEA",
        features: ["Desembolso en 24h", "Sin garantes", "Para capital de trabajo"]
    },
    {
        id: 2,
        name: "Crédito Compra Deuda",
        entity: "Caja Arequipa",
        type: "Consumo",
        rate: "Desde 28% TEA",
        features: ["Consolida tus deudas", "Cuotas fijas mensuales", "Mejora tu historial"]
    },
    {
        id: 3,
        name: "Crédito Vehicular",
        entity: "Banco de Crédito BCP",
        type: "Consumo",
        rate: "Desde 15% TEA",
        features: ["Financia hasta el 100%", "Plazos de hasta 60 meses", "Seguro vehicular incluido"],
        isPremium: true,
    },
     {
        id: 4,
        name: "Crédito Hipotecario MiVivienda",
        entity: "Interbank",
        type: "Hipotecario",
        rate: "Desde 9.5% TEA",
        features: ["Bono del Buen Pagador", "Financiamiento hasta 25 años", "Para primera vivienda"],
        isPremium: true,
    },
]

const getCreditTypeFromProduct = (productType: Product['type']): CreditType => {
    switch(productType) {
        case 'Microcrédito': return 'negocio';
        case 'Consumo': return 'consumo';
        case 'Hipotecario': return 'hipotecario';
        default: return 'negocio';
    }
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ setActivePage }) => {
    const { state } = useAppContext();
    const { user, uploadedFiles } = state;
    const isUserPremium = user?.subscriptionTier === 'premium';

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [isPreApplySuccess, setIsPreApplySuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const missingItems = useMemo(() => {
        if (!selectedProduct || !user) return [];
        
        const creditType = getCreditTypeFromProduct(selectedProduct.type);
        const requiredItems = buildChecklist(user, creditType).filter(i => i.required);

        return requiredItems.filter(item => 
            !uploadedFiles[item.id] || uploadedFiles[item.id].status !== 'analyzed_ok'
        );
    }, [selectedProduct, user, uploadedFiles]);

    const handleInterestClick = (product: Product) => {
        if (product.isPremium && !isUserPremium) {
            setUpgradeModalOpen(true);
            return;
        }
        
        setSelectedProduct(product);
        setIsModalOpen(true);
        setIsPreApplySuccess(false);
        setShowConfetti(false);
    }
    
    const handleGoToChecklist = () => {
        setIsModalOpen(false);
        setActivePage('checklist');
    };
    
    const handlePreApply = () => {
        setIsPreApplySuccess(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    const renderModalContent = () => {
        if (!selectedProduct) return null;

        if (isPreApplySuccess) {
            return (
                <div className="text-center p-4">
                    <CheckCircleIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-texto-oscuro">¡Pre-solicitud Enviada!</h3>
                    <p className="text-gray-600 my-4">
                        Hemos enviado tu perfil y documentos a <strong>{selectedProduct.entity}</strong>. Un asesor se pondrá en contacto contigo en las próximas 24-48 horas.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        ¡Excelente!
                    </button>
                </div>
            );
        }

        if (missingItems.length > 0) {
            return (
                 <div>
                    <h3 className="text-xl font-bold text-texto-oscuro mb-4">¡Estás cerca!</h3>
                    <p className="text-gray-700 mb-4">Para solicitar el <strong>{selectedProduct.name}</strong>, primero necesitas completar los siguientes documentos requeridos:</p>
                    <ul className="space-y-2 mb-6 bg-borde-sutil p-4 rounded-lg">
                        {missingItems.map(item => (
                            <li key={item.id} className="text-sm font-medium text-texto-oscuro">
                                ❌ {item.label}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleGoToChecklist}
                        className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
                    >
                       Completar mi Checklist
                    </button>
                </div>
            )
        }

        return (
            <div>
                <CheckCircleIcon className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold text-texto-oscuro text-center mb-4">¡Todo listo para continuar!</h3>
                <p className="text-gray-700 mb-6 text-center">
                    Hemos verificado que tienes todos los documentos necesarios para el <strong>{selectedProduct.name}</strong>. ¿Quieres enviar tu pre-solicitud a <strong>{selectedProduct.entity}</strong>?
                </p>
                <button
                    onClick={handlePreApply}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                    Enviar Pre-solicitud
                </button>
            </div>
        )
    };


    return (
        <div className="p-6 pb-24">
            {showConfetti && <Confetti />}
            <header className="mb-6 relative text-center">
                 <button 
                    onClick={() => setActivePage('finanzas')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary hover:underline"
                >
                    &larr; Volver
                </button>
                <h1 className="text-2xl font-bold text-texto-oscuro">Marketplace</h1>
            </header>

            <div className="space-y-4">
                {mockProducts.map(product => {
                    const isLocked = !!product.isPremium && !isUserPremium;
                    return (
                        <div key={product.id} className={`bg-white rounded-xl shadow-md p-4 border ${isLocked ? 'border-yellow-300 bg-yellow-50/50' : 'border-borde-sutil'} relative`}>
                            {product.isPremium && (
                                <div className="absolute top-0 -translate-y-1/2 left-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <StarIcon className="w-3 h-3"/> Premium
                                </div>
                            )}

                            <div className="flex justify-between items-start mt-2">
                                <div>
                                    <h3 className="font-bold text-texto-oscuro text-lg">{product.name}</h3>
                                    <p className="text-sm font-semibold text-secondary">{product.entity}</p>
                                </div>
                                <span className="text-xs font-bold text-primary bg-green-50 px-2 py-1 rounded-full">{product.type}</span>
                            </div>
                        
                            <ul className="my-3 space-y-1 text-sm text-gray-700">
                            {product.features.map(feature => (
                                <li key={feature} className="flex items-center">
                                        <span className="text-primary mr-2">✔</span> {feature}
                                </li>
                            ))}
                            </ul>
                            <div className="flex flex-col items-start mt-4 pt-3 border-t border-borde-sutil">
                                <p className="text-sm font-bold text-texto-oscuro mb-2">{product.rate}</p>
                                <button 
                                    onClick={() => handleInterestClick(product)}
                                    className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isLocked ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-primary text-white hover:bg-green-700'}`}
                                >
                                    {isLocked && <LockClosedIcon className="w-4 h-4" />}
                                    Me Interesa
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="mt-8 bg-blue-50 p-4 rounded-xl text-center">
                <StoreIcon className="w-8 h-8 text-secondary mx-auto mb-2"/>
                <p className="text-sm text-blue-800">
                   Este es un mercado simulado. Los productos y tasas son referenciales y con fines educativos.
                </p>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Verificar Requisitos">
                {renderModalContent()}
            </Modal>
             <Modal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Producto Premium Exclusivo">
                <div className="text-center p-4">
                    <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-texto-oscuro">Accede a Créditos Exclusivos</h3>
                    <p className="text-gray-600 my-4">
                        Este producto está reservado para nuestros miembros Premium. ¡Mejora tu plan para desbloquear las mejores ofertas del mercado!
                    </p>
                    <button
                        onClick={() => {
                            setUpgradeModalOpen(false);
                            setActivePage('subscription');
                        }}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Ver Planes Premium
                    </button>
                </div>
            </Modal>
        </div>
    );
};