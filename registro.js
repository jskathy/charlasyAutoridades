// Controlador de registro.html: orquesta el CU de inscripción (leer -> validar -> guardar -> avisar).
import { obtenerDistritos } from "./api/distritosApi.js";
import { obtenerCharlasConSede } from "./api/charlasApi.js";
import { guardarPostulante, existePostulanteConDni } from "./api/postulantesApi.js";
import { validarPostulante, armarPostulante, normalizarDni } from "./logica/postulante.js";
import {
  leerFormulario, cargarOpciones, mostrarErrores, limpiarErrores, mostrarResultado, ocultarResultado,
  reiniciarFormulario, bloquearEnvio, actualizarCamposDependientes, escucharCambiosDeRadios, preseleccionarCharla
} from "./vistas/formularioVista.js";

async function iniciar() {
  actualizarCamposDependientes();
  escucharCambiosDeRadios(actualizarCamposDependientes);
  document.getElementById("registroForm").addEventListener("submit", enviarPostulacion);

  try {
    const [distritos, charlas] = await Promise.all([obtenerDistritos(), obtenerCharlasConSede()]);
    cargarOpciones(document.getElementById("distrito"), distritos, distrito => distrito.nombre);
    cargarOpciones(document.getElementById("charlas"), charlas, charla => charla.nombre);
    preseleccionarCharla(new URLSearchParams(window.location.search).get("charla"));
  } catch (error) {
    mostrarResultado("error", `No pudimos cargar los datos del formulario. ${error.message}`);
  }
}

async function enviarPostulacion(evento) {
  evento.preventDefault();
  ocultarResultado();

  const datos = leerFormulario();
  const errores = validarPostulante(datos);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }
  limpiarErrores();

  bloquearEnvio(true); // evita que un doble clic registre dos veces la misma persona
  try {
    if (await existePostulanteConDni(normalizarDni(datos.dni))) {
      mostrarErrores({ dni: "Ya existe una postulación con este DNI." });
      return;
    }
    await guardarPostulante(armarPostulante(datos));
    reiniciarFormulario();
    mostrarResultado("exito", "¡Listo! Tu postulación fue registrada correctamente.");
  } catch (error) {
    mostrarResultado("error", `No pudimos registrar tu postulación. ${error.message}`);
  } finally {
    bloquearEnvio(false);
  }
}

iniciar();
