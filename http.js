// Único lugar donde se hace fetch. Nivel "¿llegó?": distingue "no hay conexión" de "el servicio respondió con error".
export async function pedirJson(url, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(url, opciones);
  } catch {
    throw new Error("No se pudo conectar con el servicio.");
  }
  if (!respuesta.ok) {
    throw new Error(`El servicio respondió con error (HTTP ${respuesta.status}).`);
  }
  return respuesta.json();
}
