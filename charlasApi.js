import { URL_API } from "../config.js";
import { pedirJson } from "./http.js";

// Devuelve cada charla con su sede ya adjunta, ordenadas por fecha (la fecha va en formato ISO, por eso se ordena como texto).
export async function obtenerCharlasConSede() {
  const [charlas, sedes] = await Promise.all([
    pedirJson(`${URL_API}/charlas`),
    pedirJson(`${URL_API}/sedes`)
  ]);
  return charlas
    .map(charla => ({ ...charla, sede: sedes.find(sede => sede.id === charla.sedeId) }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
