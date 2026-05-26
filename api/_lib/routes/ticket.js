import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

let _genai = null;
const getModel = () => {
  if (!_genai) _genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genai.getGenerativeModel({ model: 'gemini-flash-latest' });
};

const PROMPT = `Analiza este ticket de compra y extrae todos los productos comprados.
Devuelve ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown:
{
  "products": [
    {
      "name": "nombre del producto en español, claro y conciso",
      "quantity": 1,
      "price": 0.00,
      "confidence": "high",
      "alternatives": []
    }
  ]
}
Reglas:
- "name": nombre legible en español (si está abreviado, intenta deducirlo).
- "quantity": número entero de unidades compradas.
- "price": precio UNITARIO como decimal. Si aparece solo el total, divide entre quantity. Si no se detecta, pon 0.
- "confidence": "high" si el nombre es claro, "medium" si hay duda, "low" si está muy abreviado.
- "alternatives": array de posibles nombres alternativos (solo si confidence es "low" o "medium").
- Si la imagen NO es un ticket, devuelve { "products": [], "error": "No se detectó un ticket válido" }.
- Responde SOLO con el JSON.`;

router.post('/scan', verifyToken, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

  try {
    const model = getModel();

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'image/jpeg',
      },
    };

    const result = await model.generateContent([PROMPT, imagePart]);
    const raw = result.response.text().trim();

    const clean = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error('Ticket scan error:', err.message);
    if (err instanceof SyntaxError) {
      return res.status(422).json({ error: 'No se pudo interpretar la respuesta de la IA. Intenta con una imagen más clara.' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
