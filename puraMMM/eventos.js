function buscarEventoPorId(idBuscado) {
  // Convertimos ambos a string para comparar correctamente
  return eventos.find(evento => String(evento.id) === String(idBuscado));
}