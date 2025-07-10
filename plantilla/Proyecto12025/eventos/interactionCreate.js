const { InteractionType } = require('discord.js');

module.exports = async (interaction) => {
  if (interaction.type !== InteractionType.MessageComponent) return;

  const { customId, user, client } = interaction;

  // ✅ Verifica si es uno de los botones del panel de moderación
  const acciones = ['mod_kick', 'mod_ban', 'mod_mute', 'mod_unmute', 'mod_warn', 'mod_unban'];

  if (acciones.includes(customId)) {
    await interaction.deferUpdate(); // Oculta la "cargando..." de Discord

    try {
      // Envía el paso 1 para cada acción
      switch (customId) {
        case 'mod_kick':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Kick**. Por favor, escribe el ID del usuario que deseas expulsar:',
            ephemeral: true,
          });

        case 'mod_ban':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Ban**. Por favor, escribe el ID del usuario que deseas banear:',
            ephemeral: true,
          });

        case 'mod_mute':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Mute**. Escribe: `ID razón tiempo` (ej: `123 spam 10m`)',
            ephemeral: true,
          });

        case 'mod_unmute':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Unmute**. Por favor, escribe el ID del usuario a desmutear:',
            ephemeral: true,
          });

        case 'mod_warn':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Warn**. Escribe: `ID razón` (ej: `123 conducta inapropiada`)',
            ephemeral: true,
          });

        case 'mod_unban':
          return interaction.followUp({
            content: '🔹 Ingresaste al módulo de **Unban**. Escribe el ID del usuario a desbanear:',
            ephemeral: true,
          });
      }
    } catch (err) {
      console.error('❌ Error en interactionCreate:', err);
    }
  }
};
