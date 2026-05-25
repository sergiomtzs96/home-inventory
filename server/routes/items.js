import express from 'express';
import { db } from '../firebase.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// -----------------------------
// Añadir item
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, quantity, location, expiryDate, price } = req.body;
    if (!name || !category || !location) {
      return res.status(400).json({ error: 'Nombre, categoría y ubicación son obligatorios' });
    }

    const itemsRef = db.collection('items');
    const docRef = await itemsRef.add({
      name,
      category,
      quantity: quantity || 1,
      location,
      expiryDate: expiryDate || null,
      price: price || 0,
      user: req.userId,
      createdAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    const item = { id: doc.id, ...doc.data() };
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Obtener items del usuario y mover caducados a categoría "Caducados"
router.get('/', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.where('user', '==', req.userId).get();
    
    const items = [];
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
      
      // Marcar items caducados
      if (expiryDate && expiryDate <= now && data.category !== 'Caducados') {
        batch.update(doc.ref, { category: 'Caducados' });
        data.category = 'Caducados';
      }
      
      items.push({ id: doc.id, ...data });
    });

    await batch.commit();
    res.json(items);
  } catch (err) {
    console.error('Error getting items:', err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Eliminar item manualmente
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
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
    console.error('Error deleting item:', err);
    res.status(500).json({ error: err.message });
  }
});

//items que caducan en <= 5 días
router.get('/expiring', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 5);

    const itemsRef = db.collection('items');
    const snapshot = await itemsRef
      .where('user', '==', req.userId)
      .where('expiryDate', '<=', limit.toISOString())
      .get();

    const items = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
      if (expiryDate && expiryDate >= now) {
        items.push({ id: doc.id, ...data });
      }
    });

    res.json(items);
  } catch (err) {
    console.error('Error getting expiring items:', err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Actualizar quantity y/o price
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const data = doc.data();
    if (data.user !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const updates = {};
    if (req.body.quantity !== undefined) updates.quantity = req.body.quantity;
    if (req.body.price !== undefined) updates.price = req.body.price;

    await itemRef.update(updates);
    const updatedDoc = await itemRef.get();
    
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;