const { registrarLogModeracion } = require('../utils/moderacion');

module.exports = async (message, args) => {
  const id = args[0];
  const razon = args.slice(1).join(' ') || 'Sin razón';
  const member = await message.guild.members.fetch(id).catch(() => null);
  if (!member) return message.channel.send('❌ Usuario no encontrado.');

  registrarLogModeracion('warn', message.author.id, id, razon);
  message.channel.send(`⚠️ ${member.user.tag} fue advertido. Razón: ${razon}`);
};
