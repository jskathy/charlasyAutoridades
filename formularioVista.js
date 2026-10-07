// Todo lo que el formulario de registro lee o escribe en pantalla. No tiene reglas de negocio ni llamadas a la red.
const formulario = () => document.getElementById("registroForm");

export function leerFormulario() {
  return Object.fromEntries(new FormData(formulario())); // los campos deshabilitados no se incluyen
}

export function cargarOpciones(select, items, obtenerEtiqueta) {
  const opciones = items.map(item => {
    const opcion = document.createElement("option");
    opcion.value = item.id;
    opcion.textContent = obtenerEtiqueta(item);
    return opcion;
  });
  select.append(...opciones);
}

export function mostrarErrores(errores) {
  limpiarErrores();
  for (const [campo, mensaje] of Object.entries(errores)) {
    document.getElementById(`error-${campo}`).textContent = mensaje;
    document.getElementById(campo)?.classList.add("invalido");
  }
  const primerInvalido = document.querySelector(".mensaje-error:not(:empty)");
  primerInvalido?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function limpiarErrores() {
  document.querySelectorAll(".mensaje-error").forEach(elemento => { elemento.textContent = ""; });
  document.querySelectorAll(".invalido").forEach(elemento => elemento.classList.remove("invalido"));
}

export function mostrarResultado(tipo, mensaje) {
  const resultado = document.getElementById("resultado");
  resultado.textContent = mensaje;
  resultado.className = `resultado ${tipo}`;
}

export function ocultarResultado() {
  const resultado = document.getElementById("resultado");
  resultado.textContent = "";
  resultado.className = "resultado";
}

export function reiniciarFormulario() {
  formulario().reset();
  actualizarCamposDependientes();
}

export function bloquearEnvio(bloqueado) {
  document.getElementById("botonEnviar").disabled = bloqueado;
}

// "Partido" solo tiene sentido si es afiliado, y "charla" solo si dijo que le interesa alguna.
export function actualizarCamposDependientes() {
  const marcado = nombre => formulario().querySelector(`input[name="${nombre}"]:checked`)?.value;
  document.getElementById("partido").disabled = marcado("esAfiliado") !== "si";
  document.getElementById("charlas").disabled = marcado("interesadoEnCharlas") !== "si";
}

export function escucharCambiosDeRadios(alCambiar) {
  formulario().querySelectorAll('input[type="radio"]').forEach(radio => radio.addEventListener("change", alCambiar));
}

export function preseleccionarCharla(idCharla) {
  const select = document.getElementById("charlas");
  const existe = [...select.options].some(opcion => opcion.value === idCharla);
  if (!existe) return;
  formulario().querySelector('input[name="interesadoEnCharlas"][value="si"]').checked = true;
  actualizarCamposDependientes();
  select.value = idCharla;
}
