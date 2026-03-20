import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/distribuidores
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM distribuidores ORDER BY nombre ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener distribuidores' });
  }
});

// POST /api/distribuidores
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const [result] = await pool.query('INSERT INTO distribuidores (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ id: result.insertId, nombre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear distribuidor' });
  }
});

// DELETE /api/distribuidores/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM distribuidores WHERE id = ?', [id]);
    res.json({ message: 'Distribuidor eliminado' });
  } catch (error) {
    console.error(error);
    // Might have foreign key constraints violation, hence status 400 optionally
    res.status(500).json({ error: 'Error al eliminar distribuidor' });
  }
});

export default router;
