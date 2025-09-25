import express from 'express';
import Item from '../models/Item.js';
import verifyToken from '../middleware/verifyToken.js';
import User from '../models/User.js';

const router = express.Router();

// -----------------------------
// Añadir item
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, quantity, location, expiryDate } = req.body;
    if (!name || !category || !location) {
      return res.status(400).json({ error: 'Nombre, categoría y ubicación son obligatorios' });
    }

    const item = new Item({ name, category, quantity, location, expiryDate, user: req.userId });
    await item.save();

    // Guardar nueva categoría o ubicación en el usuario
    const user = await User.findById(req.userId);
    if (!user.categories.includes(category)) user.categories.push(category);
    if (!user.locations.includes(location)) user.locations.push(location);
    await user.save();

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Obtener items del usuario y mover caducados a categoría "Caducados"
router.get('/', verifyToken, async (req, res) => {
  try {
    const now = new Date();

    // Marcar items caducados
    await Item.updateMany(
      { user: req.userId, expiryDate: { $lte: now }, category: { $ne: 'Caducados' } },
      { $set: { category: 'Caducados' } }
    );

    // Obtener todos los items actualizados
    const items = await Item.find({ user: req.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Eliminar item manualmente
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    if (item.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await item.deleteOne();

    // Actualizar categorías y ubicaciones en uso
    const user = await User.findById(req.userId);
    user.categories = await Item.find({ user: req.userId }).distinct('category');
    user.locations = await Item.find({ user: req.userId }).distinct('location');
    await user.save();

    res.json({ message: 'Item eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//items que caducan en <= 5 días

router.get('/expiring', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 5);

    const items = await Item.find({
      user: req.userId,
      expiryDate: { $lte: limit, $gte: now }
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;