// Controlador de index.html: conecta los datos (api/) con lo que se ve (vistas/). Acá no hay HTML ni fetch.
import { obtenerCharlasConSede } from "./api/charlasApi.js";
import { buscarCandidatos } from "./api/usigApi.js";
import { dibujarCharlas, mostrarErrorCharlas, escucharVerSede } from "./vistas/charlasVista.js";
import { iniciarMapa, mostrarUbicacion, mostrarEstadoMapa, mostrarCandidatos, irAlMapa } from "./vistas/mapaVista.js";

const contenedorCharlas = document.getElementById("listaCharlas");
const formularioBusqueda = document.getElementById("formBuscarDireccion");
const campoDireccion = document.getElementById("direccionBuscada");
const listaCandidatos = document.getElementById("candidatos");

let charlas = [];

async function iniciar() {
  iniciarMapa("map");
  escucharVerSede(contenedorCharlas, ubicarSedeDeCharla);
  formularioBusqueda.addEventListener("submit", ubicarDireccionIngresada);

  try {
    charlas = await obtenerCharlasConSede();
    dibujarCharlas(contenedorCharlas, charlas);
  } catch (error) {
    mostrarErrorCharlas(contenedorCharlas, `No pudimos cargar las charlas. ${error.message}`);
  }
}

// CU "Consultar charlas": la dirección de la sede se envía a USIG y con su respuesta se ubica el punto en el mapa.
async function ubicarSedeDeCharla(idCharla) {
  const { sede } = charlas.find(charla => charla.id === idCharla);
  irAlMapa();
  mostrarEstadoMapa("Buscando la ubicación de la sede...");
  limpiarCandidatos();

  try {
    const candidatos = await buscarCandidatos(sede.direccion);
    // Las sedes están en CABA: si USIG devuelve la misma calle en otros partidos, preferimos la de CABA.
    const ubicacion = candidatos.find(candidato => candidato.partido === "CABA") ?? candidatos[0];
    mostrarUbicacion(ubicacion, sede.nombre, sede.direccion);
    mostrarEstadoMapa("");
  } catch (error) {
    mostrarEstadoMapa(`No pudimos ubicar la sede en el mapa. ${error.message}`, true);
  }
}

// Prueba libre: permite ubicar cualquier dirección y, si hay varias coincidencias, elegir cuál.
async function ubicarDireccionIngresada(evento) {
  evento.preventDefault();
  const texto = campoDireccion.value.trim();
  limpiarCandidatos();

  if (!texto) {
    mostrarEstadoMapa("Escribí una dirección para ubicarla.", true);
    return;
  }

  mostrarEstadoMapa("Buscando la dirección...");
  try {
    const candidatos = await buscarCandidatos(texto);
    if (candidatos.length === 1) {
      mostrarCandidatoEnMapa(candidatos[0]);
    } else {
      mostrarEstadoMapa("Encontramos varias coincidencias. Elegí una:");
      mostrarCandidatos(listaCandidatos, candidatos, mostrarCandidatoEnMapa);
    }
  } catch (error) {
    mostrarEstadoMapa(`No pudimos ubicar la dirección. ${error.message}`, true);
  }
}

function mostrarCandidatoEnMapa(candidato) {
  mostrarUbicacion(candidato, candidato.etiqueta, "");
  mostrarEstadoMapa("");
  limpiarCandidatos();
}

function limpiarCandidatos() {
  listaCandidatos.replaceChildren();
}

iniciar();
