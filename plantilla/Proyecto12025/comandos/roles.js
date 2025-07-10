const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const rutaJSON = path.join(__dirname, '../utils/reaccionesRoles.json');

module.exports = async (message) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply('❌ Solo los administradores pueden usar este comando.');
  }

  const filtroAutor = m => m.author.id === message.author.id;
  const datos = {};

  // 1. Pregunta al usuario qué tipo de roles configurará (solo a modo informativo)
  await message.channel.send('🛠️ ¿Qué tipo de roles deseas configurar? (colores, intereses, etc.):');
  const tipo = await message.channel.awaitMessages({ filter: filtroAutor, max: 1, time: 60000 });
  if (!tipo.size) return message.channel.send('⏱️ Tiempo agotado.');
  datos.tipo = tipo.first().content;

  const rolesMap = {};

  while (true) {
    await message.channel.send('🔁 Ingresa el **ID del rol** y el **emoji** separados por un espacio (ejemplo: `123456789012345678 🎨`):');
    const entrada = await message.channel.awaitMessages({ filter: filtroAutor, max: 1, time: 60000 });
    if (!entrada.size) return message.channel.send('⏱️ Tiempo agotado.');

    const [rolID, emoji] = entrada.first().content.trim().split(/\s+/);
    if (!rolID || !emoji || isNaN(rolID)) {
      await message.channel.send('❌ Formato inválido. Intenta de nuevo.');
      continue;
    }

    rolesMap[emoji] = rolID;

    // Botones: Agregar más / Continuar
    const fila = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('mas')
        .setLabel('➕ Mandar más')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('continuar')
        .setLabel('✅ Continuar')
        .setStyle(ButtonStyle.Success)
    );

    const msgBotones = await message.channel.send({ content: '¿Deseas agregar otro rol o continuar?', components: [fila] });

    const interaccion = await msgBotones.awaitMessageComponent({ time: 60000 }).catch(() => {});
    if (!interaccion) return message.channel.send('⏱️ Tiempo agotado.');
    await interaccion.deferUpdate();

    if (interaccion.customId === 'continuar') break;
  }

  // 2. Pedir mensaje e ID de canal
  await message.channel.send('✏️ Escribe el **mensaje** que quieres que se envíe junto a las reacciones:');
  const msgTexto = await message.channel.awaitMessages({ filter: filtroAutor, max: 1, time: 60000 });
  if (!msgTexto.size) return message.channel.send('⏱️ Tiempo agotado.');
  const contenido = msgTexto.first().content;

  await message.channel.send('📨 Ahora escribe el **ID del canal** donde se enviará el mensaje:');
  const canalID = await message.channel.awaitMessages({ filter: filtroAutor, max: 1, time: 60000 });
  if (!canalID.size || !message.guild.channels.cache.get(canalID.first().content)) {
    return message.channel.send('❌ Canal inválido.');
  }

  const canalDestino = message.guild.channels.cache.get(canalID.first().content);

  // 3. Enviar mensaje con reacciones
  const mensajeEnviado = await canalDestino.send(contenido);
  for (const emoji of Object.keys(rolesMap)) {
    await mensajeEnviado.react(emoji).catch(() => {}); // Ignora errores por emojis inválidos
  }

  // 4. Guardar en JSON
  let datosGuardados = [];
  if (fs.existsSync(rutaJSON)) {
    datosGuardados = JSON.parse(fs.readFileSync(rutaJSON, 'utf8'));
  }

  datosGuardados.push({
    canalId: canalDestino.id,
    mensajeId: mensajeEnviado.id,
    asignaciones: rolesMap
  });

  fs.writeFileSync(rutaJSON, JSON.stringify(datosGuardados, null, 2));
  message.channel.send('✅ ¡Configuración guardada y mensaje enviado correctamente!');
};
