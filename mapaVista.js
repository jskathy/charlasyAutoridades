// Todo lo que tiene que ver con dibujar el mapa (Leaflet). No sabe nada de USIG ni de charlas: recibe coordenadas y las muestra.

const VISTA_INICIAL = [-34.6037, -58.3816]; // Solo centra el mapa al abrir la página; no es la ubicación de ninguna sede.
const ZOOM_INICIAL = 12;
const ZOOM_SEDE = 16;

let mapa;
let marcador;

export function iniciarMapa(idContenedor) {
  mapa = L.map(idContenedor).setView(VISTA_INICIAL, ZOOM_INICIAL);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(mapa);
}

export function mostrarUbicacion({ lat, lng }, titulo, detalle) {
  if (marcador) marcador.remove();
  marcador = L.marker([lat, lng]).addTo(mapa).bindPopup(armarPopup(titulo, detalle)).openPopup();
  mapa.setView([lat, lng], ZOOM_SEDE);
}

export function mostrarEstadoMapa(mensaje, esError = false) {
  const elemento = document.getElementById("estadoMapa");
  elemento.textContent = mensaje;
  elemento.classList.toggle("error", esError);
}

export function irAlMapa() {
  document.getElementById("mapaDeSedes").scrollIntoView({ behavior: "smooth" });
}

export function mostrarCandidatos(lista, candidatos, alElegir) {
  lista.replaceChildren(...candidatos.map(candidato => {
    const item = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = `${candidato.etiqueta}`;
    boton.addEventListener("click", () => alElegir(candidato));
    item.append(boton);
    return item;
  }));
}

function armarPopup(titulo, detalle) {
  const popup = document.createElement("div");
  const negrita = document.createElement("strong");
  negrita.textContent = titulo;
  popup.append(negrita, document.createElement("br"), detalle);
  return popup;
}
