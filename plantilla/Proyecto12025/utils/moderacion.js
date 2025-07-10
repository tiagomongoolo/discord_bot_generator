const fs = require('fs');
const path = require('path');
const ms = require('ms');

const LOGS_PATH = path.join(__dirname, '../logs.json');

function registrarLogModeracion(tipo, autorId, objetivoId, razon) {
  const logs = fs.existsSync(LOGS_PATH) ? JSON.parse(fs.readFileSync(LOGS_PATH, 'utf-8')) : [];
  logs.push({
    tipo,
    autorId,
    objetivoId,
    razon,
    fecha: new Date().toISOString()
  });
  fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));
}

async function kickUsuario(guild, userId, razon, autorId, channel) {
  const miembro = await guild.members.fetch(userId).catch(() => null);
  if (miembro) {
    await miembro.kick(razon);
    registrarLogModeracion('kick', autorId, userId, razon);
    if (channel) channel.send(`✅ Usuario expulsado: <@${userId}>`);
  } else {
    if (channel) channel.send('❌ Usuario no encontrado.');
  }
}

async function banUsuario(guild, userId, razon, autorId, channel) {
  const miembro = await guild.members.fetch(userId).catch(() => null);
  if (miembro) {
    await miembro.ban({ reason: razon });
    registrarLogModeracion('ban', autorId, userId, razon);
    if (channel) channel.send(`✅ Usuario baneado: <@${userId}>`);
  } else {
    if (channel) channel.send('❌ Usuario no encontrado.');
  }
}

async function unbanUsuario(guild, userId, autorId, channel) {
  try {
    await guild.members.unban(userId);
    registrarLogModeracion('unban', autorId, userId, 'Unban manual');
    if (channel) channel.send(`✅ Usuario desbaneado: ${userId}`);
  } catch {
    if (channel) channel.send('❌ No se pudo desbanear al usuario.');
  }
}

async function muteUsuario(guild, userId, razon, duracion, autorId, channel) {
  const miembro = await guild.members.fetch(userId).catch(() => null);
  const muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (miembro && muteRole) {
    await miembro.roles.add(muteRole, razon);
    registrarLogModeracion('mute', autorId, userId, razon);
    if (channel) channel.send(`✅ Usuario muteado: <@${userId}> por ${ms(duracion, { long: true })}`);
    setTimeout(() => {
      miembro.roles.remove(muteRole).catch(() => {});
    }, duracion);
  } else {
    if (channel) channel.send('❌ No se pudo aplicar el mute.');
  }
}

async function unmuteUsuario(guild, userId, autorId, channel) {
  const miembro = await guild.members.fetch(userId).catch(() => null);
  const muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (miembro && muteRole) {
    await miembro.roles.remove(muteRole);
    registrarLogModeracion('unmute', autorId, userId, 'Unmute manual');
    if (channel) channel.send(`✅ Usuario desmuteado: <@${userId}>`);
  } else {
    if (channel) channel.send('❌ No se pudo desmutear al usuario.');
  }
}

function registrarAccion(objetivoId, tipo, autorId, razon) {
  registrarLogModeracion(tipo, autorId, objetivoId, razon);
}

module.exports = {
  registrarLogModeracion,
  kickUsuario,
  banUsuario,
  unbanUsuario,
  muteUsuario,
  unmuteUsuario,
  registrarAccion
};
