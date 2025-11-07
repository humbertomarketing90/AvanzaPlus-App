
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CreditType, UploadedFileState } from '../types';
import { AppActivePage } from '../App';
import { WhatsAppIcon, CameraIcon, UploadIcon, CheckCircleIcon, TrashIcon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { Confetti } from '../components/Confetti';
import { analyzeDocumentImage } from '../services/geminiService';
import { buildChecklist, Item } from '../utils/checklist';


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


interface ChecklistPageProps {
  setActivePage: (page: AppActivePage) => void;
}

const tabs: { id: CreditType, name: string }[] = [
    { id: 'negocio', name: 'Para mi Negocio' },
    { id: 'consumo', name: 'Para una Compra' },
    { id: 'hipotecario', name: 'Para mi Vivienda' },
];

export const ChecklistPage: React.FC<ChecklistPageProps> = ({ setActivePage }) => {
  const { state, dispatch } = useAppContext();
  const { user, uploadedFiles, completedChecklists } = state;
  const [activeTab, setActiveTab] = useState<CreditType>('negocio');

  const items: Item[] = useMemo(() => buildChecklist(user, activeTab), [user, activeTab]);

  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const requiredItems = items.filter(item => item.required);
    if (requiredItems.length === 0 || !user) return;

    const allRequiredFilesUploaded = requiredItems.every(item => uploadedFiles[item.id] && uploadedFiles[item.id].status === 'analyzed_ok');

    if (allRequiredFilesUploaded && !completedChecklists[activeTab]) {
      setIsCompletionModalOpen(true);
      setShowConfetti(true);
      dispatch({ type: 'SET_CHECKLIST_COMPLETED', payload: { checklistType: activeTab } });
      
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [uploadedFiles, items, activeTab, completedChecklists, user, dispatch]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0] && currentItemId) {
          const file = event.target.files[0];
          const localCurrentItemId = currentItemId;
          
           dispatch({ 
              type: 'UPLOAD_FILE', 
              payload: { 
                itemId: localCurrentItemId,
                fileState: { name: file.name, status: 'analyzing', analysisResult: null } 
              }
            });
          
          try {
              const base64 = await fileToBase64(file);
              const result = await analyzeDocumentImage(base64);
              const isOk = result.toUpperCase().includes('OK');
              dispatch({ 
                type: 'UPLOAD_FILE', 
                payload: { 
                  itemId: localCurrentItemId,
                  fileState: { name: file.name, status: isOk ? 'analyzed_ok' : 'analyzed_fail', analysisResult: result } 
                }
              });
          } catch (error) {
               dispatch({ 
                type: 'UPLOAD_FILE', 
                payload: { 
                  itemId: localCurrentItemId,
                  fileState: { name: file.name, status: 'analyzed_fail', analysisResult: 'Error al analizar.' } 
                }
              });
          }
      }
      event.target.value = ''; // Reset for re-upload
      setCurrentItemId(null);
  };

  const handleTriggerInput = (ref: React.RefObject<HTMLInputElement>, itemId: string) => {
      setCurrentItemId(itemId);
      ref.current?.click();
  };

  const handleRemoveFile = (itemId: string) => {
      dispatch({ type: 'REMOVE_FILE', payload: { itemId } });
  };
  
  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false);
  };

  const waNumber = process.env.VITE_WA_NUMBER;
  const message = encodeURIComponent("Hola! Quiero ayuda con mi checklist de AVANZAPLUS.");
  const href = `https://wa.me/${waNumber}?text=${message}`;

  const renderFileUploadStatus = (itemId: string) => {
    const fileState = uploadedFiles[itemId];
    if (!fileState) {
        return (
             <div className="flex items-center justify-start gap-3">
              <button
                onClick={() => handleTriggerInput(cameraInputRef, itemId)}
                className="flex items-center gap-2 text-sm font-semibold text-secondary px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
                Tomar Foto
              </button>
              <button
                onClick={() => handleTriggerInput(fileInputRef, itemId)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <UploadIcon className="w-4 h-4" />
                Subir Archivo
              </button>
            </div>
        );
    }

    let statusContent;
    switch(fileState.status) {
        case 'analyzing':
            statusContent = (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Analizando...</span>
                </div>
            );
            break;
        case 'analyzed_ok':
            statusContent = (
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Verificado por IA</span>
                </div>
            );
            break;
        case 'analyzed_fail':
             statusContent = (
                <div className="text-sm text-red-600 font-semibold">
                    <p>⚠️ {fileState.analysisResult}</p>
                </div>
            );
            break;
        default:
            statusContent = null;
    }
    
    return (
        <div className="flex items-center justify-between bg-borde-sutil p-2 rounded-lg">
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-texto-oscuro truncate" title={fileState.name}>
                  {fileState.name}
                </span>
                <div className="mt-1">{statusContent}</div>
            </div>
            <button onClick={() => handleRemoveFile(itemId)} className="text-gray-500 hover:text-red-500 p-1 flex-shrink-0" aria-label={`Quitar archivo ${fileState.name}`}>
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
  }

  return (
    <main className="p-6 pb-24 max-w-xl mx-auto">
      {showConfetti && <Confetti />}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-texto-oscuro">Checklist para tu crédito</h1>
        <p className="text-gray-600 mt-1">Selecciona el tipo de crédito y prepárate para la solicitud.</p>
      </header>

      <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 -mx-6 px-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white text-texto-oscuro shadow-sm'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      <ul className="space-y-4">
        {items.map(i => (
          <li key={i.id} className="p-4 bg-white border rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`mt-1.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center ${uploadedFiles[i.id]?.status === 'analyzed_ok' ? 'bg-primary' : 'border-2 border-gray-300'}`}>
                {uploadedFiles[i.id]?.status === 'analyzed_ok' && <span className="text-white text-xs">✔</span>}
              </div>
              <div className="flex-1">
                <p className="font-medium text-texto-oscuro">
                    {i.label}
                    {i.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {i.tip && <p className="text-xs text-gray-600 opacity-80 mt-1">{i.tip}</p>}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-borde-sutil">
                {renderFileUploadStatus(i.id)}
            </div>
          </li>
        ))}
      </ul>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />


      <div className="mt-8 bg-blue-50 p-4 rounded-xl text-center">
        <h3 className="font-bold text-secondary">¿Necesitas ayuda?</h3>
        <p className="text-sm text-blue-800 mt-2 mb-4">Nuestro equipo está listo para resolver tus dudas y acompañarte en el proceso.</p>
        {waNumber && (
            <a
                href={href}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                aria-label="Hablar por WhatsApp"
            >
                <WhatsAppIcon className="w-5 h-5"/>
                Hablar por WhatsApp
            </a>
        )}
      </div>

       <Modal isOpen={isCompletionModalOpen} onClose={handleCloseCompletionModal} title="¡Checklist Completo!">
          <div className="text-center p-4">
              <CheckCircleIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-texto-oscuro">¡Felicidades!</h3>
              <p className="text-gray-600 my-4">
                  Has completado todos los documentos requeridos. Un asesor revisará tu documentación y se pondrá en contacto contigo pronto.
              </p>
              <button
                  onClick={handleCloseCompletionModal}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                  Entendido
              </button>
          </div>
      </Modal>
    </main>
  );
}
