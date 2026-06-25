const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let currentState = 'DISCONNECTED';
let currentQR = null;

const isProd = process.env.NODE_ENV === 'production';
const authPath = isProd ? '/data' : './';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: authPath }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

const qrcode = require('qrcode');

client.on('qr', async (qr) => {
  console.log('[WhatsApp] QR Recibido. Escanea para conectar.');
  try {
    currentQR = await qrcode.toDataURL(qr);
  } catch (err) {
    currentQR = qr;
  }
  currentState = 'QR_READY';
});

client.on('ready', () => {
  console.log('[WhatsApp] ¡Cliente Conectado Exitosamente!');
  currentState = 'CONNECTED';
  currentQR = null;
});

client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Cliente Desconectado:', reason);
  currentState = 'DISCONNECTED';
});

client.initialize();

// Rutas de la API
app.get('/status', (req, res) => {
  res.json({ status: currentState, qr: currentQR });
});

app.post('/send', async (req, res) => {
  const { phone, message, mediaBase64 } = req.body;
  
  if (currentState !== 'CONNECTED') {
    return res.status(503).json({ error: 'WhatsApp no está conectado todavía.' });
  }

  try {
    // Formatear teléfono: agregar código de país (asumimos +52 México si no tiene, o limpiar caracteres)
    // Para simplificar, asumimos que el cliente envía el teléfono con código (ej. 521234567890)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('52') && formattedPhone.length === 10) {
       formattedPhone = '521' + formattedPhone; // México móvil format
    }
    const chatId = `${formattedPhone}@c.us`;

    let sentMessage;
    if (mediaBase64) {
      // Extraer mimetype y data de base64 data URL (e.g. "data:image/png;base64,iVBORw0KGgo...")
      const matches = mediaBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let media;
      if (matches && matches.length === 3) {
        media = new MessageMedia(matches[1], matches[2], 'codigo_qr.png');
      } else {
        // Fallback si no es data URL completo
        media = new MessageMedia('image/png', mediaBase64, 'codigo_qr.png');
      }
      
      sentMessage = await client.sendMessage(chatId, media, { caption: message });
    } else {
      sentMessage = await client.sendMessage(chatId, message);
    }
    
    res.json({ success: true, messageId: sentMessage.id._serialized });
  } catch (error) {
    console.error('[WhatsApp Error]', error);
    res.status(500).json({ error: 'No se pudo enviar el mensaje.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[WhatsApp Server] Corriendo en http://localhost:${PORT}`);
});
