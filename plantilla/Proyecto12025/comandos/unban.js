const { registrarLogModeracion } = require('../utils/moderacion');

module.exports = async (message, args) => {
  const userId = args[0];
  try {
    await message.guild.members.unban(userId);
    message.channel.send(`✅ El usuario con ID ${userId} ha sido desbaneado.`);
    registrarLogModeracion('unban', message.author.id, userId, 'Unban manual');
  } catch (error) {
    message.channel.send('❌ No se pudo desbanear al usuario.');
  }
};
