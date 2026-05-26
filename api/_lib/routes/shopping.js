import express from 'express';
import { db } from '../firebase.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('shopping').where('user', '==', req.userId).get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.json(items);
  } catch (err) {
    console.error('Error getting shopping list:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, quantity = 1, category } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const docRef = await db.collection('shopping').add({
      name,
      quantity,
      category: category || 'Otros',
      user: req.userId,
      createdAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error adding to shopping list:', err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    const itemRef = db.collection('shopping').doc(req.params.id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const data = doc.data();
    if (data.user !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await itemRef.update({ quantity });
    const updatedDoc = await itemRef.get();

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error('Error updating shopping item:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const itemRef = db.collection('shopping').doc(req.params.id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const data = doc.data();
    if (data.user !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await itemRef.delete();
    res.json({ message: 'Item eliminado correctamente' });
  } catch (err) {
    console.error('Error deleting shopping item:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
