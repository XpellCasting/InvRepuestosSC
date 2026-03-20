import express from 'express';
import pool from '../db.js';

const router = express.Router();

const getTicketsConProductos = async (whereClause = '', queryParams = []) => {
  const query = `
    SELECT * FROM tickets
    ${whereClause}
    ORDER BY created_at DESC
  `;
  const [tickets] = await pool.query(query, queryParams);

  if (tickets.length === 0) return [];

  const ticketIds = tickets.map(t => t.id);
  const [productos] = await pool.query(
    `SELECT tp.*, p.nombre, p.imagen, p.codigo_barras
     FROM ticket_productos tp 
     JOIN productos p ON tp.producto_id = p.id 
     WHERE tp.ticket_id IN (?)`,
    [ticketIds]
  );

  return tickets.map(t => ({
    ...t,
    productos: productos.filter(p => p.ticket_id === t.id).map(p => ({
      producto_id: p.producto_id,
      nombre: p.nombre,
      imagen: p.imagen,
      codigo_barras: p.codigo_barras,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    }))
  }));
};

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await getTicketsConProductos();
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const tickets = await getTicketsConProductos('WHERE id = ?', [req.params.id]);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json(tickets[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el ticket' });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { numero, fecha, productos } = req.body;
    
    // 1. Validar stock disponible
    let total = 0;
    const productosAEliminar = [];

    for (const item of productos) {
      const [dbProd] = await connection.query('SELECT stock FROM productos WHERE id = ?', [item.producto_id]);
      if (dbProd.length === 0) {
        throw new Error(`Producto ${item.producto_id} no existe`);
      }
      if (dbProd[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ID: ${item.producto_id}`);
      }
      total += item.cantidad * item.precio_unitario;
    }

    // 2. Insertar en tickets
    const [ticketResult] = await connection.query(
      'INSERT INTO tickets (numero, fecha, total, estado) VALUES (?, ?, ?, ?)',
      [numero, fecha, total, 'en-espera']
    );
    const ticket_id = ticketResult.insertId;

    // 3. Insertar en ticket_productos & 4. Descontar stock
    for (const item of productos) {
      await connection.query(
        'INSERT INTO ticket_productos (ticket_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ticket_id, item.producto_id, item.cantidad, item.precio_unitario]
      );

      // Descontar stock
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );

      // 5. Check if stock = 0
      const [updatedProd] = await connection.query('SELECT id, nombre, stock FROM productos WHERE id = ?', [item.producto_id]);
      if (updatedProd[0].stock <= 0) {
        productosAEliminar.push(updatedProd[0].nombre);
        // NOTA: Se comenta el DELETE porque eliminar un producto con ventas
        // registradas viola la integridad referencial (FOREIGN KEY) del ticket.
        // El producto debe mantenerse con stock 0 para el historial de ventas.
        // await connection.query('DELETE FROM productos WHERE id = ?', [item.producto_id]);
      }
    }

    await connection.commit();
    res.status(201).json({ id: ticket_id, eliminados: productosAEliminar, message: 'Ticket creado' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear ticket' });
  } finally {
    connection.release();
  }
});

// PUT /api/tickets/:id/estado
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const [ticket] = await pool.query('SELECT estado FROM tickets WHERE id = ?', [id]);
    if (ticket.length === 0) return res.status(404).json({ error: 'Ticket no encontrado' });
    
    if (ticket[0].estado !== 'en-espera') {
      return res.status(400).json({ error: 'Solo se puede cambiar estado desde en-espera' });
    }

    await pool.query('UPDATE tickets SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
});

// DELETE /api/tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    res.json({ message: 'Ticket eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

export default router;
