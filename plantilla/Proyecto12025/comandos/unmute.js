const { registrarLogModeracion } = require('../utils/moderacion');

module.exports = async (message, args) => {
  const member = await message.guild.members.fetch(args[0]).catch(() => null);
  if (!member) return message.channel.send('❌ Usuario no encontrado.');

  const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (!muteRole) return message.channel.send('❌ No se encontró el rol "Muted".');

  await member.roles.remove(muteRole);
  message.channel.send(`✅ ${member.user.tag} fue desmuteado.`);
  registrarLogModeracion('unmute', message.author.id, member.id, 'Unmute manual');
};
