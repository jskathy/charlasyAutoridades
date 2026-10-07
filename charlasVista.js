import { escaparHtml, formatearFecha, formatearHorario } from "../formato.js";

const SEDE_DESCONOCIDA = { nombre: "Sede a confirmar", direccion: "" };

export function dibujarCharlas(contenedor, charlas) {
  if (charlas.length === 0) {
    contenedor.innerHTML = '<p class="aviso-vacio">Por el momento no hay charlas programadas.</p>';
    return;
  }
  contenedor.innerHTML = charlas.map(armarTarjeta).join("");
}

export function mostrarErrorCharlas(contenedor, mensaje) {
  contenedor.innerHTML = `<p class="aviso-vacio estado error">${escaparHtml(mensaje)}</p>`;
}

// Avisa con el id de la charla cuando alguien toca "Ver sede en el mapa". Un solo listener para todas las tarjetas.
export function escucharVerSede(contenedor, alElegir) {
  contenedor.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-charla-id]");
    if (boton) alElegir(boton.dataset.charlaId);
  });
}

function armarTarjeta(charla) {
  const sede = charla.sede ?? SEDE_DESCONOCIDA;
  const botonMapa = charla.sede
    ? `<button class="btn-mapa" data-charla-id="${escaparHtml(charla.id)}">📍 Ver sede en el mapa</button>`
    : "";

  return `
    <div class="tarjeta-charla">
      <h2>${escaparHtml(charla.nombre)}</h2>
      <p class="InfoCharla">${escaparHtml(charla.tema)}</p>
      <p class="UbicacionCharla">
        📍 ${escaparHtml(sede.nombre)} <br>
        ${escaparHtml(sede.direccion)} <br>
        Sala: ${escaparHtml(charla.sala)}
      </p>
      <div class="fecha-hora-box">
        <span class="FechaCharla">🗓️ ${escaparHtml(formatearFecha(charla.fecha))}</span>
        <span class="HoraCharla">🕒 ${escaparHtml(formatearHorario(charla.horaInicio, charla.horaFin))}</span>
      </div>
      <div class="tarjeta-botones">
        ${botonMapa}
        <a href="registro.html?charla=${encodeURIComponent(charla.id)}" class="btn-vincular">Vincular a mi postulación</a>
      </div>
    </div>`;
}
