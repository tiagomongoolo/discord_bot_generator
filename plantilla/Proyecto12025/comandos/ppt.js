const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const PUNTOS_FILE = './puntos.json';

function loadPuntos() {
  if (!fs.existsSync(PUNTOS_FILE)) return {};
  const content = fs.readFileSync(PUNTOS_FILE, 'utf-8');
  return content ? JSON.parse(content) : {};
}

function savePuntos(data) {
  fs.writeFileSync(PUNTOS_FILE, JSON.stringify(data, null, 2));
}

module.exports = async function pptHandler(message, command, args, client) {
  const opciones = ['piedra', 'papel', 'tijera'];
  const emojis = { piedra: '🪨', papel: '📄', tijera: '✂️' };

  const embed = new EmbedBuilder()
    .setTitle('🕹️ Piedra, Papel o Tijera')
    .setDescription('¡Haz tu elección!')
    .setColor('Blue');

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ppt_piedra').setLabel('Piedra').setEmoji('🪨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ppt_papel').setLabel('Papel').setEmoji('📄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ppt_tijera').setLabel('Tijera').setEmoji('✂️').setStyle(ButtonStyle.Primary)
  );

  const msg = await message.channel.send({ embeds: [embed], components: [buttons] });

  const collector = msg.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time: 15000,
    max: 1,
  });

  collector.on('collect', async interaction => {
    const eleccionUsuario = interaction.customId.split('_')[1];
    const eleccionBot = opciones[Math.floor(Math.random() * 3)];

    let resultado = '';
    let puntosGanados = 0;

    if (eleccionUsuario === eleccionBot) {
      resultado = '🤝 ¡Empate!';
      puntosGanados = 5;
    } else if (
      (eleccionUsuario === 'piedra' && eleccionBot === 'tijera') ||
      (eleccionUsuario === 'papel' && eleccionBot === 'piedra') ||
      (eleccionUsuario === 'tijera' && eleccionBot === 'papel')
    ) {
      resultado = '🏆 ¡Ganaste!';
      puntosGanados = 10;
    } else {
      resultado = '💥 ¡Perdiste!';
    }

    // ✅ Guardar puntos en formato: { "ID": puntos }
    const puntos = loadPuntos();
    const userId = message.author.id;
    puntos[userId] = (puntos[userId] || 0) + puntosGanados;
    savePuntos(puntos);

    const resultadoEmbed = new EmbedBuilder()
      .setTitle('📊 Resultado')
      .setDescription(
        `Tu elección: ${emojis[eleccionUsuario]}\nElección del bot: ${emojis[eleccionBot]}\n\n**${resultado}**\n` +
        (puntosGanados > 0 ? `🎉 Has ganado **${puntosGanados}** puntos.` : `😢 No ganaste puntos esta vez.`)
      )
      .setColor(resultado.includes('Ganaste') ? 'Green' : resultado.includes('Empate') ? 'Grey' : 'Red');

    const replayButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ppt_revancha').setLabel('Revancha').setEmoji('🔁').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ppt_salir').setLabel('Retirarse').setEmoji('🏳️').setStyle(ButtonStyle.Danger)
    );

    await interaction.update({ embeds: [resultadoEmbed], components: [replayButtons] });

    const nextCollector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 15000,
      max: 1,
    });

    nextCollector.on('collect', async replay => {
      if (replay.customId === 'ppt_revancha') {
        pptHandler(message, command, args, client); // Repetir el juego
        await replay.deferUpdate();
      } else {
        await replay.update({ content: '👋 Juego terminado. ¡Gracias por jugar!', embeds: [], components: [] });
      }
    });
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      msg.edit({ content: '⏰ Tiempo agotado. Juego cancelado.', components: [], embeds: [] });
    }
  });
};
    