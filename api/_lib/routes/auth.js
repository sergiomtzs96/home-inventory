import express from 'express';
import jwt from 'jsonwebtoken';
import { db, auth } from '../firebase.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Correo electrónico no válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    await usersRef.doc(userRecord.uid).set({
      username,
      email,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(userRecord.uid);
    res.status(201).json({ token, username });
  } catch (err) {
    console.error('Error en registro:', err);
    if (err.code === 'auth/email-already-in-use') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    try {
      const userRecord = await auth.getUserByEmail(email);
      const token = generateToken(userRecord.uid);
      res.json({ token, username: userData.username });
    } catch (authError) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.where('user', '==', userId).get();

    const categories = new Set();
    const locations = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) categories.add(data.category);
      if (data.location) locations.add(data.location);
    });

    res.json({
      categories: Array.from(categories),
      locations: Array.from(locations),
    });
  } catch (err) {
    console.error('Error en settings:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
