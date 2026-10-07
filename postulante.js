// Reglas de negocio de la inscripción. No toca el DOM ni la red: recibe datos y devuelve resultados, por eso se puede probar sola.

const EDAD_MINIMA = 18;
const REGEX_NOMBRE = /^[\p{L}][\p{L}\s'’-]+$/u;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_DNI = /^\d{7,8}$/;
const REGEX_TELEFONO = /^\+54(9)?\d{10}$/; // +54, un 9 opcional (celulares) y 10 dígitos

export function normalizarDni(texto) {
  return texto.replace(/[.\s]/g, "");
}

export function normalizarTelefono(texto) {
  return texto.replace(/[\s-]/g, "");
}

export function calcularEdad(fechaNacimientoIso, hoy = new Date()) {
  const [anio, mes, dia] = fechaNacimientoIso.split("-").map(Number);
  const mesActual = hoy.getMonth() + 1;
  const yaCumplioEsteAnio = mesActual > mes || (mesActual === mes && hoy.getDate() >= dia);
  return hoy.getFullYear() - anio - (yaCumplioEsteAnio ? 0 : 1);
}

// Devuelve un objeto { campo: "mensaje" }. Si está vacío, los datos son válidos.
export function validarPostulante(datos, hoy = new Date()) {
  const texto = campo => (datos[campo] ?? "").trim();
  const errores = {};

  if (!texto("distrito")) errores.distrito = "Seleccioná un distrito electoral.";

  for (const campo of ["nombre", "apellido"]) {
    if (!REGEX_NOMBRE.test(texto(campo))) {
      errores[campo] = "Ingresá al menos 2 letras (sin números).";
    }
  }

  if (!REGEX_DNI.test(normalizarDni(texto("dni")))) {
    errores.dni = "El DNI debe tener 7 u 8 dígitos.";
  }

  const errorFecha = validarFechaNacimiento(texto("fecha"), hoy);
  if (errorFecha) errores.fecha = errorFecha;

  if (texto("direccion").length < 3) errores.direccion = "Ingresá tu dirección actual.";

  if (!REGEX_TELEFONO.test(normalizarTelefono(texto("telefono")))) {
    errores.telefono = "Debe comenzar con +54 (con o sin el 9) y tener 10 dígitos. Ej: +54 9 11 1234 5678.";
  }

  if (!REGEX_EMAIL.test(texto("email"))) errores.email = "Ingresá un email válido. Ej: nombre@correo.com.";

  for (const campo of ["fueAutoridad", "cumplioCapacitacion", "esAfiliado", "interesadoEnCharlas"]) {
    if (!["si", "no"].includes(datos[campo])) errores[campo] = "Elegí una opción.";
  }

  // Reglas que dependen de otra respuesta (la consigna dice "detallando el partido" y "alguna de las charlas").
  if (datos.esAfiliado === "si" && !texto("partido")) {
    errores.partido = "Indicá el partido o agrupación.";
  }
  if (datos.interesadoEnCharlas === "si" && !texto("charlas")) {
    errores.charlas = "Elegí la charla que te interesa.";
  }

  return errores;
}

function validarFechaNacimiento(fechaIso, hoy) {
  if (!fechaIso) return "Ingresá tu fecha de nacimiento.";
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  if (new Date(anio, mes - 1, dia) > hoy) return "La fecha no puede ser futura.";
  if (calcularEdad(fechaIso, hoy) < EDAD_MINIMA) return `Tenés que tener al menos ${EDAD_MINIMA} años.`;
  return null;
}

// Convierte lo que escribió la persona en el registro que se guarda (tipos correctos, datos limpios).
export function armarPostulante(datos) {
  const texto = campo => (datos[campo] ?? "").trim();
  const esAfiliado = datos.esAfiliado === "si";
  const interesadoEnCharlas = datos.interesadoEnCharlas === "si";

  return {
    distritoId: texto("distrito"),
    nombre: texto("nombre"),
    apellido: texto("apellido"),
    dni: normalizarDni(texto("dni")),
    fechaNacimiento: texto("fecha"),
    direccion: texto("direccion"),
    telefono: normalizarTelefono(texto("telefono")),
    email: texto("email").toLowerCase(),
    fueAutoridadAntes: datos.fueAutoridad === "si",
    cumplioCapacitacion: datos.cumplioCapacitacion === "si",
    esAfiliado,
    partido: esAfiliado ? texto("partido") : null,
    interesadoEnCharlas,
    charlaId: interesadoEnCharlas ? texto("charlas") : null
  };
}
