const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
require('dotenv').config();

const app = express();
const PORT = 3000;

// 📁 Rutas
const PLANTILLA_PATH = path.join(__dirname, 'plantilla', 'Proyecto12025');
const COMANDOS_PATH = path.join(PLANTILLA_PATH, 'comandos');
const FRONTEND_PATH = path.join(__dirname, 'frontend');
const PUBLIC_PATH = path.join(__dirname, 'public');

// 🌐 Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Necesario para leer JSON
app.use(session({
  secret: 'super-secret', // ⚠️ Cámbialo en producción
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// 🧠 Discord OAuth
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/discord/callback',
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 🌍 Rutas estáticas
app.use('/frontend', express.static(FRONTEND_PATH)); // Para step1.html y demás
app.use(express.static(PUBLIC_PATH)); // Para dashboard.html y root

// 🔐 Rutas de autenticación
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/dashboard.html');
});

app.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('No autorizado');
  res.json(req.user);
});

// 📦 Ruta para comandos disponibles
app.get('/comandos-disponibles', async (req, res) => {
  try {
    const archivos = await fs.readdir(COMANDOS_PATH);
    const comandos = archivos
      .filter(archivo => archivo.endsWith('.js'))
      .map(archivo => path.parse(archivo).name);
    res.json(comandos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron leer los comandos.' });
  }
});

// ⚙️ Generar bot
app.post('/generar-bot', async (req, res) => {
  const { nombre, token, prefijo, comandos = [], musica } = req.body;
  const comandosSeleccionados = Array.isArray(comandos) ? comandos : [comandos];
  const carpetaTemporal = path.join(__dirname, 'temporal', nombre);

  try {
    // 1. Copiar plantilla base
    await fs.copy(PLANTILLA_PATH, carpetaTemporal);

    // 2. Limpiar y copiar comandos
    const comandosFinal = path.join(carpetaTemporal, 'comandos');
    await fs.emptyDir(comandosFinal);

    for (const cmd of comandosSeleccionados) {
      const origen = path.join(COMANDOS_PATH, `${cmd}.js`);
      const destino = path.join(comandosFinal, `${cmd}.js`);
      await fs.copy(origen, destino);
    }

    // 3. Música
    if (!musica) {
      await fs.remove(path.join(carpetaTemporal, 'musicManager.js')).catch(() => {});
      await fs.remove(path.join(comandosFinal, 'music.js')).catch(() => {});
    }

    // 4. Reemplazar en .env
    const envPath = path.join(carpetaTemporal, '.env');
    let env = await fs.readFile(envPath, 'utf8');
    env = env.replace(/DISCORD_TOKEN=.*/g, `DISCORD_TOKEN=${token}`);
    env = env.replace(/PREFIX=.*/g, `PREFIX=${prefijo}`);
    await fs.writeFile(envPath, env);

    // 5. Borrar node_modules
    await fs.remove(path.join(carpetaTemporal, 'node_modules'));

    // 6. Crear ZIP
    const zipName = `${nombre}.zip`;
    const zipPath = path.join(__dirname, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(zipPath, zipName, async () => {
        await fs.remove(zipPath);
        await fs.remove(carpetaTemporal);
      });
    });

    archive.pipe(output);
    archive.directory(carpetaTemporal, false);
    await archive.finalize();

  } catch (err) {
    console.error('Error al generar el bot:', err);
    res.status(500).send('Error al generar el bot.');
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

console.log('Client ID:', process.env.DISCORD_CLIENT_ID);
