const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'utils', 'mod_roles.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');

module.exports = async (message, args) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply('❌ Solo los administradores pueden usar este comando.');
  }

  const guildId = message.guild.id;
  const modRoles = [];

  const embed = new EmbedBuilder()
    .setTitle('🛠️ Configuración de Moderación')
    .setDescription('Ingresa el **ID del rol** que deseas agregar como moderador.')
    .setColor('DarkGreen');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('mod_add')
      .setLabel('Agregar otro')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('mod_done')
      .setLabel('Finalizar')
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await message.channel.send({ embeds: [embed], components: [row] });

  const collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id });
  const interactionCollector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 });

  collector.on('collect', m => {
    if (/^\d{17,20}$/.test(m.content)) {
      modRoles.push(m.content);
      m.react('✅');
    } else {
      m.reply('❌ El ID proporcionado no es válido. Intenta nuevamente.');
    }
  });

  interactionCollector.on('collect', async i => {
    await i.deferUpdate();

    if (i.customId === 'mod_done') {
      collector.stop();
      interactionCollector.stop();

      const db = JSON.parse(fs.readFileSync(configPath, 'utf-8') || '{}');
      db[guildId] = modRoles;
      fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

      await i.editReply({
        content: '✅ Configuración completa, puede continuar con su moderación.',
        embeds: [],
        components: []
      });
    }
  });
};
