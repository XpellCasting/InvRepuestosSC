import express from 'express';
import pool from '../db.js';

const router = express.Router();

const getProductosConCompatibilidad = async (whereClause = '', queryParams = []) => {
  const query = `
    SELECT 
      p.*, 
      d.nombre as distribuidor_nombre 
    FROM productos p 
    LEFT JOIN distribuidores d ON p.distribuidor_id = d.id 
    ${whereClause} 
    ORDER BY p.created_at DESC
  `;
  const [productos] = await pool.query(query, queryParams);

  if (productos.length === 0) return [];

  const productoIds = productos.map(p => p.id);
  const [compatibilidades] = await pool.query(
    'SELECT * FROM compatibilidad WHERE producto_id IN (?)',
    [productoIds]
  );

  return productos.map(p => ({
    ...p,
    compatibilidad: compatibilidades.filter(c => c.producto_id === p.id)
  }));
};

// GET /api/productos/buscar?q=
router.get('/buscar', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const searchLike = `%${searchTerm}%`;

    const whereClause = `
      WHERE p.nombre LIKE ? 
      OR p.codigo_barras LIKE ? 
      OR p.id IN (
        SELECT producto_id FROM compatibilidad 
        WHERE marca LIKE ? OR modelo LIKE ?
      )
    `;
    const params = [searchLike, searchLike, searchLike, searchLike];
    
    const productos = await getProductosConCompatibilidad(whereClause, params);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const productos = await getProductosConCompatibilidad();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const productos = await getProductosConCompatibilidad('WHERE p.id = ?', [req.params.id]);
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(productos[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST /api/productos
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id, compatibilidad } = req.body;

    const [result] = await connection.query(
      `INSERT INTO productos (codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id]
    );

    const producto_id = result.insertId;

    if (compatibilidad && compatibilidad.length > 0) {
      const compatibilidadValues = compatibilidad.map(c => [
        producto_id, c.marca, c.modelo, c.anio_desde, c.anio_hasta, c.motor
      ]);
      await connection.query(
        'INSERT INTO compatibilidad (producto_id, marca, modelo, anio_desde, anio_hasta, motor) VALUES ?',
        [compatibilidadValues]
      );
    }

    await connection.commit();
    res.status(201).json({ id: producto_id, message: 'Producto creado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  } finally {
    connection.release();
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const { codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id, compatibilidad } = req.body;

    await connection.query(
      `UPDATE productos 
       SET codigo_barras=?, nombre=?, descripcion=?, componentes=?, precio=?, stock=?, imagen=?, distribuidor_id=? 
       WHERE id=?`,
      [codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id, id]
    );

    // Replace compatibilidad
    await connection.query('DELETE FROM compatibilidad WHERE producto_id = ?', [id]);
    
    if (compatibilidad && compatibilidad.length > 0) {
      const compatibilidadValues = compatibilidad.map(c => [
        id, c.marca, c.modelo, c.anio_desde, c.anio_hasta, c.motor
      ]);
      await connection.query(
        'INSERT INTO compatibilidad (producto_id, marca, modelo, anio_desde, anio_hasta, motor) VALUES ?',
        [compatibilidadValues]
      );
    }

    await connection.commit();
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  } finally {
    connection.release();
  }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // CASCADE handles the compatibilidad deletion implicitly
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
