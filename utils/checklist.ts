
import { User, IncomeSource, CreditGoal } from '../types';

export type Item = { id: string; label: string; required: boolean; tip?: string };
export type CreditType = 'negocio' | 'consumo' | 'hipotecario';

export function buildChecklist(user: User | null, type: CreditType): Item[] {
  if (!user?.onboardingData) return [];

  const { incomeSource } = user.onboardingData;

  const base: Item[] = [
    { id: "base_dni", label: "DNI legible y vigente", required: true },
    { id: "base_recibo_servicios", label: "Recibo de luz/agua con dirección", required: true, tip: "Últimos 2–3 meses. Si no está a tu nombre, adjunta constancia de domicilio." },
    { id: "base_sin_morosidad", label: "No tener morosidad grave en centrales de riesgo", required: true, tip: "Si la tienes, pide plan de regularización con la entidad." },
    { id: "base_cronograma_deudas", label: "Cronograma de pagos de deudas actuales", required: false, tip: "Demuestra tu organización y capacidad de pago actual." },
  ];
  
  const casadoItems: Item[] = [
      { id: "casado_dni_conyuge", label: "Copia DNI del cónyuge", required: true },
      { id: "casado_partida_matrimonio", label: "Partida de matrimonio", required: true },
  ];

  switch(type) {
    case 'negocio': {
        const items = [...base];
        if (incomeSource === IncomeSource.Autonomo) {
            items.push(
                { id: "negocio_ruc", label: "RUC activo (independiente)", required: true },
                { id: "negocio_licencia", label: "Licencia de funcionamiento municipal", required: true, tip: "Si tu negocio lo requiere, es fundamental." },
                { id: "negocio_ventas", label: "Ventas 6–12 meses (boletas/facturas/cuaderno)", required: true },
                { id: "negocio_estado_cuenta", label: "Estados de cuenta o movimientos bancarios", required: false, tip: "Muy útil para demostrar flujo de dinero." },
                { id: "negocio_fotos", label: "Fotos del negocio, mercadería y ubicación", required: false, tip: "Ayuda al analista a entender tu negocio." },
                { id: "negocio_lista_proveedores", label: "Lista de principales proveedores y clientes", required: false, tip: "Demuestra la estabilidad y red de tu negocio." },
                { id: "negocio_propiedad_activos", label: "Documentos de propiedad de activos (moto, herramientas, etc.)", required: false, tip: "Suma puntos si tienes activos a tu nombre." }
            );
        } else {
             items.push({ id: "negocio_boletas", label: "Boletas de pago (3 últimos meses)", required: true });
        }
        return items;
    }
    case 'consumo': {
        const items = [...base];
        if (incomeSource === IncomeSource.Empleado) {
            items.push({ id: "consumo_boletas", label: "Boletas de pago (3 últimos meses)", required: true });
        } else {
            items.push({ id: "consumo_sustento_independiente", label: "Sustento de ingresos como independiente (RUC, Recibos por Honorarios)", required: true });
        }
        items.push({ id: "consumo_proforma", label: "Proforma o cotización del bien a comprar", required: true, tip: "Esencial para justificar el monto del crédito." });
        return items;
    }
    case 'hipotecario': {
        return [
            ...base,
            ...casadoItems,
            { id: "hipo_boletas_largo", label: "Boletas de pago (6-12 últimos meses)", required: true },
            { id: "hipo_constancia_trabajo", label: "Constancia de trabajo vigente", required: true },
            { id: "hipo_declaracion_impuestos", label: "Declaración jurada de impuestos (2 últimos años)", required: true, tip: "Para independientes o rentas adicionales." },
            { id: "hipo_estado_cuenta_ahorro", label: "Estados de cuenta bancarios con ahorros", required: true, tip: "Demuestra tu cuota inicial y capacidad de ahorro." },
            { id: "hipo_titulo_propiedad", label: "Copia literal del Título de Propiedad del inmueble", required: true, tip: "Proporcionado por el vendedor." },
            { id: "hipo_hr_pu", label: "Autovalúo (HR y PU) del año en curso", required: true, tip: "Documentos municipales del inmueble." },
            { id: "hipo_tasacion", label: "Informe de tasación del inmueble", required: true, tip: "Realizado por un perito autorizado por el banco." },
        ];
    }
    default:
        return [];
  }
}
