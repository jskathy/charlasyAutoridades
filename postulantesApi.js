import { URL_API } from "../config.js";
import { pedirJson } from "./http.js";

export function guardarPostulante(postulante) {
  return pedirJson(`${URL_API}/postulantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postulante)
  });
}

// Se compara en JavaScript y no con "?dni=..." porque json-server convierte los valores numéricos de la URL a número,
// y nosotras guardamos el DNI como texto: nunca coincidirían. Con una base de datos real esto sería un WHERE dni = ?.
export async function existePostulanteConDni(dni) {
  const postulantes = await pedirJson(`${URL_API}/postulantes`);
  return postulantes.some(postulante => postulante.dni === dni);
}
