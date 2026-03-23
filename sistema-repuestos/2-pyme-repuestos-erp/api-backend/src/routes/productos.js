import express from 'express';
import supabase from '../db.js';

const router = express.Router();

const getProductosConCompatibilidad = async (queryBuilder) => {
  const { data: productos, error: prodError } = await queryBuilder;
  if (prodError || !productos || productos.length === 0) return [];

  const productoIds = productos.map(p => p.id);
  const { data: compatibilidades, error: compError } = await supabase
    .from('compatibilidad')
    .select('*')
    .in('producto_id', productoIds);

  if (compError) throw compError;

  return productos.map(p => ({
    ...p,
    compatibilidad: compatibilidades.filter(c => c.producto_id === p.id)
  }));
};

// GET /api/productos/buscar?q=
router.get('/buscar', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    
    // Find matching compatibilities first to simulate subquery IN
    const { data: compMatches } = await supabase
      .from('compatibilidad')
      .select('producto_id')
      .or(`marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`);
      
    const matchingProdIds = compMatches ? compMatches.map(c => c.producto_id) : [];
    
    let query = supabase
      .from('productos')
      .select('*, distribuidores(nombre)')
      .order('created_at', { ascending: false });

    let orStr = `nombre.ilike.%${searchTerm}%,codigo_barras.ilike.%${searchTerm}%`;
    if (matchingProdIds.length > 0) {
      orStr += `,id.in.(${matchingProdIds.join(',')})`;
    }
    query = query.or(orStr);

    const productos = await getProductosConCompatibilidad(query);
    
    const formatted = productos.map(p => ({
      ...p,
      distribuidor_nombre: p.distribuidores ? p.distribuidores.nombre : null
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const query = supabase
      .from('productos')
      .select('*, distribuidores(nombre)')
      .order('created_at', { ascending: false });
      
    const productos = await getProductosConCompatibilidad(query);
    const formatted = productos.map(p => ({
      ...p,
      distribuidor_nombre: p.distribuidores ? p.distribuidores.nombre : null
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const query = supabase
      .from('productos')
      .select('*, distribuidores(nombre)')
      .eq('id', req.params.id);
      
    const productos = await getProductosConCompatibilidad(query);
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const p = productos[0];
    res.json({
        ...p,
        distribuidor_nombre: p.distribuidores ? p.distribuidores.nombre : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST /api/productos
router.post('/', async (req, res) => {
  try {
    const { codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id, compatibilidad } = req.body;
    const imagenData = Array.isArray(imagen) ? JSON.stringify(imagen) : imagen;

    const { data: result, error: insertError } = await supabase
      .from('productos')
      .insert([{ codigo_barras, nombre, descripcion, componentes, precio, stock, imagen: imagenData, distribuidor_id }])
      .select();

    if (insertError) throw insertError;
    const producto_id = result[0].id;

    if (compatibilidad && compatibilidad.length > 0) {
      const compInserts = compatibilidad.map(c => ({
        producto_id,
        marca: c.marca,
        modelo: c.modelo,
        anio_desde: c.anio_desde,
        anio_hasta: c.anio_hasta,
        motor: c.motor
      }));
      const { error: compError } = await supabase.from('compatibilidad').insert(compInserts);
      if (compError) throw compError;
    }

    res.status(201).json({ id: producto_id, message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id, compatibilidad } = req.body;
    const imagenData = Array.isArray(imagen) ? JSON.stringify(imagen) : imagen;

    const { error: updateError } = await supabase
      .from('productos')
      .update({ codigo_barras, nombre, descripcion, componentes, precio, stock, imagen: imagenData, distribuidor_id })
      .eq('id', id);
      
    if (updateError) throw updateError;

    // Replace compatibilidad
    await supabase.from('compatibilidad').delete().eq('producto_id', id);
    
    if (compatibilidad && compatibilidad.length > 0) {
      const compInserts = compatibilidad.map(c => ({
        producto_id: id,
        marca: c.marca,
        modelo: c.modelo,
        anio_desde: c.anio_desde,
        anio_hasta: c.anio_hasta,
        motor: c.motor
      }));
      const { error: compError } = await supabase.from('compatibilidad').insert(compInserts);
      if (compError) throw compError;
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
