const fs = require('fs');
const path = './puntos.json';

function cargarPuntos() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(path));
}

function guardarPuntos(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function obtenerPuntos(userId) {
  const data = cargarPuntos();
  return data[userId]?.puntos || 0;
}

function agregarPuntos(userId, cantidad) {
  const data = cargarPuntos();
  if (!data[userId]) {
    data[userId] = { puntos: 0, reclamo: false };
  }

  data[userId].puntos += cantidad;
  if (data[userId].puntos < 0) data[userId].puntos = 0;

  guardarPuntos(data);
}

function puedeReclamar(userId) {
  const data = cargarPuntos();
  return data[userId]?.puntos >= 1000 && !data[userId]?.reclamo;
}

function marcarReclamado(userId) {
  const data = cargarPuntos();
  if (!data[userId]) return;
  data[userId].reclamo = true;
  guardarPuntos(data);
}

module.exports = {
  obtenerPuntos,
  agregarPuntos,
  puedeReclamar,
  marcarReclamado
};
