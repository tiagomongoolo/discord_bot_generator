const { PermissionsBitField } = require('discord.js');
const { registrarLogModeracion } = require('../utils/moderacion');

module.exports = async (message, args) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
  const target = await message.guild.members.fetch(args[0]).catch(() => null);
  if (!target) return message.channel.send('❌ Usuario no encontrado.');
  const razon = args.slice(1).join(' ') || 'Sin razón';

  await target.kick(razon);
  message.channel.send(`✅ ${target.user.tag} fue expulsado.`);
  registrarLogModeracion('kick', message.author.id, target.id, razon);
};