const fs = require('fs');
const path = require('path');
const { realizarKick, realizarBan, realizarMute, realizarUnmute, realizarUnban, realizarWarn } = require('../utils/moderacion');

const estadosModeracion = new Map(); // { userId: { paso: 0, tipo: 'kick', datos: {} } }

module.exports = async (message) => {
  if (message.author.bot || message.channel.type !== 1) return; // Solo procesa DMs de usuarios

  const estado = estadosModeracion.get(message.author.id);
  if (!estado) return;

  const { paso, tipo, datos } = estado;

  if (tipo === 'kick') {
    if (paso === 0) {
      datos.id = message.content.trim();
      estadosModeracion.set(message.author.id, { paso: 1, tipo, datos });
      message.reply('✏️ Ahora escribe la razón del kick.');
    } else if (paso === 1) {
      datos.razon = message.content.trim();
      await realizarKick(message.client, message, datos);
      estadosModeracion.delete(message.author.id);
    }
  }

  else if (tipo === 'ban') {
    if (paso === 0) {
      datos.id = message.content.trim();
      estadosModeracion.set(message.author.id, { paso: 1, tipo, datos });
      message.reply('✏️ Ahora escribe la razón del ban.');
    } else if (paso === 1) {
      datos.razon = message.content.trim();
      await realizarBan(message.client, message, datos);
      estadosModeracion.delete(message.author.id);
    }
  }

  else if (tipo === 'mute') {
    if (paso === 0) {
      datos.id = message.content.trim();
      estadosModeracion.set(message.author.id, { paso: 1, tipo, datos });
      message.reply('✏️ Escribe la razón del mute.');
    } else if (paso === 1) {
      datos.razon = message.content.trim();
      estadosModeracion.set(message.author.id, { paso: 2, tipo, datos });
      message.reply('⏱️ Escribe la duración del mute (ej: 10m, 2h, 1d).');
    } else if (paso === 2) {
      datos.tiempo = message.content.trim();
      await realizarMute(message.client, message, datos);
      estadosModeracion.delete(message.author.id);
    }
  }

  else if (tipo === 'unmute') {
    datos.id = message.content.trim();
    await realizarUnmute(message.client, message, datos);
    estadosModeracion.delete(message.author.id);
  }

  else if (tipo === 'unban') {
    datos.id = message.content.trim();
    await realizarUnban(message.client, message, datos);
    estadosModeracion.delete(message.author.id);
  }

  else if (tipo === 'warn') {
    if (paso === 0) {
      datos.id = message.content.trim();
      estadosModeracion.set(message.author.id, { paso: 1, tipo, datos });
      message.reply('✏️ Escribe la razón del aviso (warn).');
    } else if (paso === 1) {
      datos.razon = message.content.trim();
      await realizarWarn(message.client, message, datos);
      estadosModeracion.delete(message.author.id);
    }
  }
};

module.exports.estadosModeracion = estadosModeracion;
