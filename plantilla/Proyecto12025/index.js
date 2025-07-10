require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Verificar variables de entorno
if (!process.env.DISCORD_TOKEN || !process.env.PREFIX) {
  console.error('❌ ERROR: DISCORD_TOKEN o PREFIX no está definido en el archivo .env');
  process.exit(1);
}

const PREFIX = process.env.PREFIX;
let isProcessing = false;

// Crear cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

// Cargar comandos
const comandos = new Map();
const comandosDir = path.join(__dirname, 'comandos');
fs.readdirSync(comandosDir).forEach(file => {
  const nombre = file.split('.')[0];
  comandos.set(nombre, require(`./comandos/${file}`));
});

// Mensajes
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  if (isProcessing) return;

  isProcessing = true;
  try {
    const [commandName, ...args] = message.content.trim().split(' ');
    const comando = commandName.slice(PREFIX.length);

    if (comandos.has(comando)) {
      await comandos.get(comando)(message, args, client);
    }
  } catch (err) {
    console.error('❌ Error en el comando:', err);
  } finally {
    isProcessing = false;
  }
});

// Eliminar bienvenida y autoroles automáticos por IDs
// Ahora se deberá configurar con el comando !config

// Iniciar bot
client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// Eventos de reacciones
client.on('messageReactionAdd', (...args) => require('./eventos/messageReactionAdd')(...args));
client.on('messageReactionRemove', (...args) => require('./eventos/messageReactionRemove')(...args));

client.login(process.env.DISCORD_TOKEN);
