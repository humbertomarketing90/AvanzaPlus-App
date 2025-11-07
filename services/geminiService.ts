import { GoogleGenAI } from "@google/genai";
import { User, ScenarioOption, OnboardingData, ActionPlanItem } from "../types";

const friendlyError = "No se pudo conectar con el asistente. Revisa tu conexión o inténtalo más tarde.";
const premiumError = "Esta es una función Premium. Actualiza tu plan para obtener acceso.";

export async function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export async function safeGenerate<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { 
    return await withTimeout(fn()); 
  }
  catch (e) {
    console.error("safeGenerate failed:", e);
    return fallback; 
  }
}

const buildContextPrompt = (user: User): string => {
    const currencyInfo = `La moneda del usuario es ${user.currency.name} (${user.currency.code}) y el símbolo es ${user.currency.symbol}.`;
    let context = `El perfil del usuario es: Puntaje de crédito de ${user.creditProfile.score}, deuda de ${user.currency.symbol}${user.creditProfile.debt}, y una utilización de crédito del ${user.creditProfile.creditUtilization}%. Ha acumulado ${user.points} puntos en lecciones. ${currencyInfo}`;
    if(user.onboardingData) {
        context += ` Tiene ${user.onboardingData.age} años, su fuente de ingresos es '${user.onboardingData.incomeSource}', sus ingresos mensuales son '${user.onboardingData.monthlyIncome} ${user.currency.code}', tiene ${user.onboardingData.dependents} dependientes. Su situación crediticia es '${user.onboardingData.creditSituation}' y su objetivo principal es '${user.onboardingData.creditGoal}'.`
    }
    return context;
}

export const getPersonalizedCreditAdvice = async (user: User, decision: ScenarioOption): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
    return friendlyError;
  }

  const userContext = buildContextPrompt(user);
  const prompt = `Eres 'AP Coach', un asesor de crédito amigable y experto. ${userContext}
El usuario acaba de tomar la siguiente decisión: "${decision.text}".
El impacto en su puntaje fue de ${decision.impact} puntos porque: "${decision.explanation}".
Basado en todo este contexto, dale un consejo conciso (2-3 oraciones), positivo y educativo sobre por qué esta fue una buena o mala decisión y qué podría hacer para mejorar. Mantén un tono motivador. No uses markdown.`;

  const fallback = "Lo siento, no pude generar un consejo en este momento. Recuerda siempre mantener tus deudas bajas y pagar a tiempo.";

  return safeGenerate(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }, fallback);
};


export const getChatResponse = async (prompt: string, user: User): Promise<string> => {
  if (user.subscriptionTier !== 'premium') return premiumError;
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
    return friendlyError;
  }
  
  const userContext = buildContextPrompt(user);
  const fullPrompt = `Eres 'AP Coach', un asesor de crédito amigable y experto. Responde a las preguntas del usuario sobre finanzas y crédito de manera sencilla y educativa. ${userContext}
  No uses markdown. Responde a la siguiente pregunta: "${prompt}"`;
  
  const fallback = "Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo más tarde.";

  return safeGenerate(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    return response.text;
  }, fallback);
};

export const recommendGoals = async (user: User): Promise<string> => {
    if (user.subscriptionTier !== 'premium') return premiumError;
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. AI features will be disabled.");
        return friendlyError;
    }

    const prompt = `Eres 'AP Coach', un asesor financiero. Recomienda 3 metas de ahorro a corto plazo para un usuario cuya moneda es ${user.currency.code}. Por ejemplo: "Fondo de emergencia de ${user.currency.symbol}500", "Pagar tarjeta de crédito de ${user.currency.symbol}200", "Ahorrar para un gadget de ${user.currency.symbol}300". Responde solo con la lista, cada meta en una nueva línea. No uses markdown ni numeración.`;
    
    const fallback = `Ahorrar para emergencias\nPagar deudas existentes\nGuardar para un viaje corto`;

    return safeGenerate(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    }, fallback);
};

export const getPersonalizedActionPlan = async (onboardingData: OnboardingData): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. AI features will be disabled.");
        return [];
    }
    const prompt = `Basado en este perfil de un nuevo usuario: Objetivo='${onboardingData.creditGoal}', Situación='${onboardingData.creditSituation}', Ingresos='${onboardingData.monthlyIncome}', crea un plan de acción de 3 pasos muy cortos y accionables para que empiece en la app. Responde solo con un array JSON de 3 strings. Por ejemplo: ["Completa la lección 'Entendiendo tu Puntaje'", "Practica con 5 escenarios más", "Crea tu primera meta de ahorro"].`;

    const fallback = ["Completar la primera lección", "Probar 5 escenarios", "Crear una meta de ahorro"];

    return safeGenerate(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        try {
            const result = JSON.parse(response.text);
            return Array.isArray(result) && result.length === 3 ? result : fallback;
        } catch {
            return fallback;
        }
    }, fallback);
};

export const getNewActionPlan = async (user: User): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. AI features will be disabled.");
        return [];
    }
    const userContext = buildContextPrompt(user);
    const prompt = `Eres 'AP Coach', un asesor de crédito experto. ${userContext} El usuario ha completado su plan de acción inicial. Genera un NUEVO plan de acción de 3 pasos un poco más avanzados para que siga mejorando. Deben ser cortos y accionables. Responde solo con un array JSON de 3 strings. Ejemplo: ["Revisa tu reporte de crédito este mes", "Intenta reducir tu utilización de crédito al 25%", "Completa la lección sobre 'Pago Mínimo'"].`;

    const fallback = ["Revisar reporte de crédito", "Reducir utilización de crédito", "Completar lección avanzada"];

    return safeGenerate(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        try {
            const result = JSON.parse(response.text.trim());
            return Array.isArray(result) && result.length === 3 ? result : fallback;
        } catch {
            return fallback;
        }
    }, fallback);
};

export const analyzeDocumentImage = async (base64Image: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Análisis no disponible.";
    }
    const prompt = "Analiza esta imagen de un documento. ¿Es legible y está completo? Responde con 'OK' si es claro, o con una sugerencia muy corta como 'Foto borrosa, intenta de nuevo' o 'Documento cortado en los bordes'. Sé muy breve.";
    
    const fallback = "No se pudo analizar. Por favor, verifica que la imagen sea clara.";

    return safeGenerate(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    }, fallback);
};

export const extractExpenseFromReceipt = async (base64Image: string): Promise<{amount: number | null, description: string | null}> => {
     if (!process.env.API_KEY) {
        return { amount: null, description: null };
    }
    const prompt = "Extrae el monto total y el nombre del comercio de esta imagen de un recibo. Responde con un único objeto JSON con las claves 'amount' (número) y 'description' (string). Si no puedes encontrar un valor, usa null. Ejemplo: {\"amount\": 25.50, \"description\": \"Supermercado Metro\"}";
    
    const fallback = { amount: null, description: 'No se pudo leer el recibo' };

    return safeGenerate(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        try {
            // Clean the response to ensure it's valid JSON
            const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanedText);
            return {
                amount: typeof result.amount === 'number' ? result.amount : null,
                description: typeof result.description === 'string' ? result.description : null,
            };
        } catch (e) {
            console.error("Error parsing receipt JSON:", e);
            return fallback;
        }
    }, fallback);
};