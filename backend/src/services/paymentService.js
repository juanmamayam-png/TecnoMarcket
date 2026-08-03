// Servicio de pagos — aísla la integración con la pasarela externa
// (tarjeta, PSE) detrás de una función única `charge()`.
//
// Por qué aislarlo así: el acta menciona un "proveedor alterno como
// contingencia" ante fallas del proveedor principal (riesgo R-01). Con
// esta interfaz, cambiar de proveedor o añadir un fallback solo implica
// tocar este archivo, no los controladores que lo usan.
//
// En este entregable el modo por defecto es "mock": simula la respuesta
// de una pasarela real sin salir a internet, para que el proyecto se
// pueda ejecutar y probar sin credenciales de un proveedor de pagos.
// Para integrar un proveedor real (ej. PayU, Wompi, Stripe) solo hay que
// reemplazar el cuerpo de `charge()` por la llamada a su SDK/API,
// manteniendo la misma firma de entrada/salida.

function generateReference() {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Cobra un monto a través de la pasarela de pagos.
 * @param {Object} params
 * @param {number} params.amount - Monto a cobrar.
 * @param {'tarjeta'|'pse'|'otro'} params.method - Medio de pago.
 * @param {Object} params.details - Datos del medio de pago (número
 *   enmascarado, banco, etc.) — nunca se debe loguear ni persistir tal cual.
 * @returns {Promise<{approved: boolean, reference: string, message: string}>}
 */
async function charge({ amount, method, details = {} }) {
  if (process.env.PAYMENT_GATEWAY_MODE === 'mock' || !process.env.PAYMENT_GATEWAY_MODE) {
    // Simulación: se aprueba cualquier pago con monto > 0. Un monto de
    // prueba de exactamente $1 se usa por convención para forzar un
    // rechazo y poder probar el flujo de error desde el frontend.
    await new Promise((resolve) => setTimeout(resolve, 300)); // latencia simulada
    const approved = Number(amount) !== 1;
    return {
      approved,
      reference: generateReference(),
      message: approved
        ? 'Pago aprobado'
        : 'Pago rechazado por la entidad financiera',
    };
  }

  // --- Punto de integración con un proveedor real ---
  // const response = await axios.post('https://api.proveedor.com/charges', {...});
  // return { approved: response.data.status === 'approved', reference: response.data.id, message: response.data.message };
  throw new Error('Modo de pasarela de pagos no soportado');
}

module.exports = { charge };
