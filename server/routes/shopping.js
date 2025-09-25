import express from 'express';
import jwt from 'jsonwebtoken';
import ShoppingItem from '../models/ShoppingItemSchema.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// -----------------------------
// Obtener lista de compra del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await ShoppingItem.find({ user: req.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Añadir item a la lista de compra
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, quantity = 1, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Nombre y categoría son obligatorios' });

    const item = new ShoppingItem({
      name,
      quantity,
      category,
      user: req.userId
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Actualizar cantidad de un item
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    const item = await ShoppingItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Eliminar item de la lista de compra
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    await item.deleteOne();
    res.json({ message: 'Item eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;