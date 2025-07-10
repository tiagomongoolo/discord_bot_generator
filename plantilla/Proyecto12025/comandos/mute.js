const ms = require('ms');
const { registrarLogModeracion } = require('../utils/moderacion');

module.exports = async (message, args) => {
  const [id, ...rest] = args;
  const tiempo = rest.pop();
  const razon = rest.join(' ') || 'Sin razón';

  const member = await message.guild.members.fetch(id).catch(() => null);
  if (!member) return message.channel.send('❌ Usuario no encontrado.');

  const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (!muteRole) return message.channel.send('❌ No se encontró el rol "Muted".');

  await member.roles.add(muteRole, razon);
  message.channel.send(`✅ ${member.user.tag} fue muteado por ${tiempo}.`);
  registrarLogModeracion('mute', message.author.id, id, razon);

  setTimeout(() => {
    member.roles.remove(muteRole).catch(() => {});
  }, ms(tiempo));
};