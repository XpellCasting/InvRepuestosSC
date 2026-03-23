import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET /api/distribuidores
router.get('/', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('distribuidores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('distribuidores')
      .insert([{ nombre }])
      .select();

    if (error) throw error;
    res.status(201).json({ id: data[0].id, nombre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear distribuidor' });
  }
});

// DELETE /api/distribuidores/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('distribuidores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Distribuidor eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar distribuidor' });
  }
});

export default router;
