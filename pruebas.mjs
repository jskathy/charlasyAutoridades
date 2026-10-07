// Pruebas rápidas de las reglas de negocio y del módulo USIG (sin red: se simula fetch). Ejecutar con: npm test
import assert from "node:assert/strict";
import { calcularEdad, validarPostulante, armarPostulante } from "../js/logica/postulante.js";
import { buscarCandidatos } from "../js/api/usigApi.js";
import { formatearFecha } from "../js/formato.js";

const hoy = new Date(2026, 9, 7); // 7/10/2026
const datosValidos = {
  distrito: "d1", nombre: "Juan", apellido: "Pérez", dni: "12.345.678", fecha: "1990-12-25",
  direccion: "Guadalajara 1234", telefono: "+54 9 11 1234 5678", email: "juan.perez@email.com",
  fueAutoridad: "no", cumplioCapacitacion: "no", esAfiliado: "no", interesadoEnCharlas: "no"
};

let pruebas = 0;
async function probar(nombre, funcion) {
  await funcion();
  pruebas++;
  console.log(`ok - ${nombre}`);
}

await probar("la edad es correcta si el cumpleaños todavía no llegó (bug de const edad--)", () => {
  assert.equal(calcularEdad("1990-12-25", hoy), 35);
  assert.equal(calcularEdad("1990-10-07", hoy), 36);
  assert.equal(calcularEdad("2008-10-08", hoy), 17);
});

await probar("datos válidos no generan errores (incluye teléfono con espacios y 9)", () => {
  assert.deepEqual(validarPostulante(datosValidos, hoy), {});
});

await probar("campos vacíos generan un mensaje por campo", () => {
  const errores = validarPostulante({}, hoy);
  for (const campo of ["distrito", "nombre", "apellido", "dni", "fecha", "direccion", "telefono", "email",
    "fueAutoridad", "cumplioCapacitacion", "esAfiliado", "interesadoEnCharlas"]) {
    assert.ok(errores[campo], `falta el error de ${campo}`);
  }
});

await probar("menor de 18, fecha futura, mail y DNI inválidos", () => {
  assert.ok(validarPostulante({ ...datosValidos, fecha: "2010-01-01" }, hoy).fecha);
  assert.ok(validarPostulante({ ...datosValidos, fecha: "2030-01-01" }, hoy).fecha);
  assert.ok(validarPostulante({ ...datosValidos, email: "juan@" }, hoy).email);
  assert.ok(validarPostulante({ ...datosValidos, dni: "123" }, hoy).dni);
});

await probar("partido y charla son obligatorios solo si corresponde", () => {
  assert.ok(validarPostulante({ ...datosValidos, esAfiliado: "si" }, hoy).partido);
  assert.ok(validarPostulante({ ...datosValidos, interesadoEnCharlas: "si" }, hoy).charlas);
  assert.deepEqual(validarPostulante({ ...datosValidos, esAfiliado: "si", partido: "Partido X" }, hoy), {});
});

await probar("armarPostulante limpia y convierte los datos", () => {
  const postulante = armarPostulante({ ...datosValidos, esAfiliado: "si", partido: " Partido X ", interesadoEnCharlas: "si", charlas: "charla-1" });
  assert.equal(postulante.dni, "12345678");
  assert.equal(postulante.telefono, "+5491112345678");
  assert.equal(postulante.esAfiliado, true);
  assert.equal(postulante.partido, "Partido X");
  assert.equal(postulante.charlaId, "charla-1");
  assert.equal(armarPostulante(datosValidos).partido, null);
  assert.equal(armarPostulante(datosValidos).charlaId, null);
});

function simularFetch(cuerpo, { ok = true, status = 200 } = {}) {
  globalThis.fetch = async () => ({ ok, status, json: async () => cuerpo });
}

await probar("USIG: convierte tipos y respeta que x es longitud e y es latitud", async () => {
  simularFetch({ direccionesNormalizadas: [{
    direccion: "CORRIENTES AV. 1234, CABA", nombre_partido: "CABA",
    coordenadas: { srid: 4326, x: "-58.384222", y: "-34.603939" }
  }] });
  const [candidato] = await buscarCandidatos("corrientes 1234");
  assert.deepEqual(candidato, { etiqueta: "CORRIENTES AV. 1234, CABA", partido: "CABA", lat: -34.603939, lng: -58.384222 });
});

await probar("USIG: HTTP 200 con errorMessage es un error", async () => {
  simularFetch({ direccionesNormalizadas: [], errorMessage: "Calle inexistente" });
  await assert.rejects(buscarCandidatos("xxx 1"), /Calle inexistente/);
});

await probar("USIG: lista vacía, HTTP 500 y red caída son errores con mensaje claro", async () => {
  simularFetch({ direccionesNormalizadas: [] });
  await assert.rejects(buscarCandidatos("xxx 1"), /No se encontró/);
  simularFetch({}, { ok: false, status: 500 });
  await assert.rejects(buscarCandidatos("x 1"), /HTTP 500/);
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(buscarCandidatos("x 1"), /No se pudo conectar/);
});

await probar("formato de fecha legible", () => {
  assert.equal(formatearFecha("2026-10-14"), "Miércoles, 14 de octubre de 2026");
});

console.log(`\n${pruebas} pruebas OK`);
