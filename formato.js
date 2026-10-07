// Formateo para mostrar datos. Los datos se guardan "crudos" (fecha ISO, horas HH:MM) y se les da formato recién al mostrarlos.

export function formatearFecha(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  const texto = new Intl.DateTimeFormat("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date(anio, mes - 1, dia));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearHorario(horaInicio, horaFin) {
  return `${horaInicio} a ${horaFin} hs`;
}

// Evita que un dato con "<" o "&" rompa el HTML cuando se arma con plantillas.
export function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
