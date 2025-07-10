const fs = require('fs');
const path = require('path');

const rutaJSON = path.join(__dirname, '../utils/reaccionesRoles.json');

module.exports = async (reaction, user) => {
  if (user.bot) return;

  const mensaje = reaction.message;
  if (!mensaje.guild || !mensaje.guild.available) return;

  if (!fs.existsSync(rutaJSON)) return;

  const configuraciones = JSON.parse(fs.readFileSync(rutaJSON, 'utf8'));

  for (const config of configuraciones) {
    if (mensaje.id === config.mensajeId && mensaje.channel.id === config.canalId) {
      const emoji = reaction.emoji.name;
      const rolID = config.asignaciones[emoji];
      if (!rolID) return;

      try {
        const miembro = await mensaje.guild.members.fetch(user.id);
        const rol = mensaje.guild.roles.cache.get(rolID);

        if (rol && mensaje.guild.members.me.roles.highest.position > rol.position) {
          await miembro.roles.remove(rol);
          console.log(`❎ Rol removido: ${rol.name} a ${user.tag}`);

          // Notificación por DM
          user.send(`❎ Se te ha removido el rol **${rol.name}** en **${mensaje.guild.name}**.`)
            .catch(() => console.warn(`⚠️ No se pudo enviar DM a ${user.tag}.`));
        }
      } catch (error) {
        console.error('❌ Error al remover el rol:', error);
      }
    }
  }
};
