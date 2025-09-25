import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Obtener categorías y ubicaciones
router.get('/settings', auth, async (req, res) => {
    const user = await User.findById(req.userId);
    res.json({ categories: user.categories, locations: user.locations });
});

// Añadir categoría
router.post('/categories', auth, async (req, res) => {
    const { category } = req.body;
    const user = await User.findById(req.userId);
    if (!user.categories.includes(category)) {
        user.categories.push(category);
        await user.save();
    }
    res.json(user.categories);
});

// Añadir ubicación
router.post('/locations', auth, async (req, res) => {
    const { location } = req.body;
    const user = await User.findById(req.userId);
    if (!user.locations.includes(location)) {
        user.locations.push(location);
        await user.save();
    }
    res.json(user.locations);
});

export default router;
