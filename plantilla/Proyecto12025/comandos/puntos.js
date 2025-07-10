const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const PUNTOS_FILE = './puntos.json';

function loadPuntos() {
  if (!fs.existsSync(PUNTOS_FILE)) return {};
  const content = fs.readFileSync(PUNTOS_FILE, 'utf-8');
  return content ? JSON.parse(content) : {};
}

module.exports = async function puntosHandler(message) {
  const puntos = loadPuntos();
  const userId = message.author.id;
  const userPuntos = puntos[userId] || 0;

  // Obtener top 5 usuarios con más puntos
  const topUsuarios = Object.entries(puntos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topTexto = await Promise.all(
    topUsuarios.map(async ([id, puntos], index) => {
      try {
        const user = await message.guild.members.fetch(id).catch(() => null);
        const username = user ? user.user.username : `Usuario desconocido (${id})`;
        return `**${index + 1}.** ${username}: **${puntos}** puntos`;
      } catch (err) {
        return `**${index + 1}.** ID ${id}: **${puntos}** puntos`;
      }
    })
  );

  const embed = new EmbedBuilder()
    .setTitle('📊 Tus Puntos')
    .setDescription(`Tienes **${userPuntos}** puntos.\n\n🏆 **Top 5 Usuarios:**\n${topTexto.join('\n')}`)
    .setColor('Yellow');

  message.channel.send({ embeds: [embed] });
};
