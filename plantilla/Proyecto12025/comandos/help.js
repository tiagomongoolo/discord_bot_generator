module.exports = async function (message) {
  const prefix = process.env.PREFIX || '!';

  const config = message.client.guildConfigs?.get(message.guild.id);
  const hasAdminRole = config?.adminRoles?.some(roleId =>
    message.member.roles.cache.has(roleId)
  );
  const isAdmin = config?.adminUsers?.includes(message.author.id);

  const comandosPublicos = [
    `\`${prefix}eventos\` – Ver eventos`,
    `\`${prefix}ppt [piedra|papel|tijera]\` – Jugar`,
    `\`${prefix}help_active\` – Ver ayudantes activos`,
    `\`${prefix}help\` – Mostrar esta ayuda`
  ];


  let mensaje = '📜 **Comandos:**\n' + comandosPublicos.join('\n');
  if (hasAdminRole || isAdmin) {
    mensaje += '\n\n🔐 **Privados:**\n' + comandosPrivados.join('\n');
  }

  try {
    await message.author.send(mensaje);
  } catch (err) {
    return message.reply('❌ No pude enviarte el mensaje privado. ¿Tienes los DMs activados?');
  }

  return message.react('📬');
};
