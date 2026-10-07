import { URL_API } from "../config.js";
import { pedirJson } from "./http.js";

export function obtenerDistritos() {
  return pedirJson(`${URL_API}/distritos`);
}
