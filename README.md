# Portal para Autoridades de Mesa — Prototipo (Entrega 2)

Prueba de concepto de la materia Ingeniería de Software (UNGS). Cubre dos casos de uso: **consultar charlas** (con su sede ubicada en un mapa) e **inscribirse como postulante** a autoridad de mesa.

## Requisitos
- [Node.js](https://nodejs.org) 22.12 o superior 


## Cómo iniciarlo
```bash
npm install   # instala las dependencias (json-server) a partir de package.json
npm start     # levanta la API y la web en el puerto 3001
```
Después abrir **http://localhost:3001/index.html**.

Para verificar las reglas de negocio y la integración con USIG (sin internet, con respuestas simuladas): `npm test`.

## Qué hay en cada parte
| Archivo | Se ocupa de |
|---|---|
| `index.html` + `js/paginaCharlas.js` | Consultar charlas y ver cada sede en el mapa |
| `registro.html` + `js/registro.js` | Formulario de inscripción del postulante |
| `js/vistas/` | Dibujar en pantalla (tarjetas, mapa, formulario) |
| `js/logica/postulante.js` | Reglas de negocio: validaciones y armado del registro |
| `js/api/` | Acceso a datos: json-server (`charlasApi`, `postulantesApi`, `distritosApi`) y USIG (`usigApi`) |
| `db.json` | Datos de ejemplo: 24 distritos, 5 sedes, 5 charlas y 2 postulantes |

## Decisiones
- **Persistencia: json-server.** Expone `db.json` como una API REST sin instalar ni configurar una base de datos. Asimismo, en un futuro permitira reemplazar el backend sin alterar el flujo del prototipo.
- **Mapa: API de USIG + Leaflet.** La dirección de la sede se envía a `servicios.usig.buenosaires.gob.ar/normalizar/`, y las coordenadas de la respuesta se usan para ubicar el punto en el mapa.
- las validaciones se hacen solo en el navegador; json-server no valida lo que recibe.
