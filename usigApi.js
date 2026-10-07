import { URL_USIG } from "../config.js";
import { pedirJson } from "./http.js";

// Único módulo que conoce la forma del JSON de USIG. El resto del código trabaja con { etiqueta, partido, lat, lng }.
export async function buscarCandidatos(texto) {
  const consulta = new URLSearchParams({ direccion: texto, geocodificar: "true", srid: "4326" });
  const datos = await pedirJson(`${URL_USIG}?${consulta}`);

  // Nivel "¿sirvió?": USIG puede contestar HTTP 200 y aun así no haber encontrado nada.
  if (datos.errorMessage) {
    throw new Error(datos.errorMessage);
  }

  const candidatos = (datos.direccionesNormalizadas ?? [])
    .filter(direccion => direccion.coordenadas)
    .map(direccion => ({
      etiqueta: direccion.direccion,
      partido: direccion.nombre_partido,
      lat: Number(direccion.coordenadas.y), // en USIG, y es la latitud...
      lng: Number(direccion.coordenadas.x)  // ...y x es la longitud. Además pueden venir como texto.
    }));

  if (candidatos.length === 0) {
    throw new Error("No se encontró la dirección.");
  }
  return candidatos;
}
