import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Item from '../models/Item.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'El email ya está registrado' });

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Email o contraseña incorrectos' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener categorías y ubicaciones del usuario
router.get('/settings', verifyToken, async (req, res) => {
  try {
    //Solo categorías y ubicaciones que tengan al menos un item
    const categories = await Item.find({ user: req.userId }).distinct('category');
    const locations = await Item.find({ user: req.userId }).distinct('location');

    res.json({ categories, locations });
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;