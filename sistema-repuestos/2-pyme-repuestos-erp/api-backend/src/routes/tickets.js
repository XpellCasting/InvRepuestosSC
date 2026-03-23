import express from 'express';
import supabase from '../db.js';

const router = express.Router();

const getTicketsConProductos = async (queryBuilder) => {
  const { data: tickets, error: ticketError } = await queryBuilder;
  if (ticketError || !tickets || tickets.length === 0) return [];

  const ticketIds = tickets.map(t => t.id);
  const { data: ticketProductos, error: tpError } = await supabase
    .from('ticket_productos')
    .select('*, productos(nombre, imagen, codigo_barras)')
    .in('ticket_id', ticketIds);

  if (tpError) throw tpError;

  return tickets.map(t => ({
    ...t,
    productos: ticketProductos.filter(tp => tp.ticket_id === t.id).map(tp => ({
      producto_id: tp.producto_id,
      nombre: tp.productos ? tp.productos.nombre : null,
      imagen: tp.productos ? tp.productos.imagen : null,
      codigo_barras: tp.productos ? tp.productos.codigo_barras : null,
      cantidad: tp.cantidad,
      precio_unitario: tp.precio_unitario
    }))
  }));
};

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
    const tickets = await getTicketsConProductos(query);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const query = supabase.from('tickets').select('*').eq('id', req.params.id);
    const tickets = await getTicketsConProductos(query);
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
  try {
    const { numero, fecha, productos } = req.body;
    let total = 0;
    const productosAEliminar = [];

    // 1. Validar stock
    for (const item of productos) {
      const { data: dbProd, error } = await supabase.from('productos').select('stock').eq('id', item.producto_id);
      if (error || !dbProd || dbProd.length === 0) {
        throw new Error(`Producto ${item.producto_id} no existe`);
      }
      if (dbProd[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ID: ${item.producto_id}`);
      }
      total += item.cantidad * item.precio_unitario;
    }

    // 2. Insertar ticket
    const { data: ticketResult, error: ticketError } = await supabase
      .from('tickets')
      .insert([{ numero, fecha, total, estado: 'en-espera' }])
      .select();

    if (ticketError) throw ticketError;
    const ticket_id = ticketResult[0].id;

    // 3. Insertar ticket_productos y descontar stock
    try {
      const tpInserts = productos.map(item => ({
        ticket_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));
      const { error: tpError } = await supabase.from('ticket_productos').insert(tpInserts);
      if (tpError) throw tpError;

      for (const item of productos) {
         // fetch current stock again
         const { data: pData } = await supabase.from('productos').select('nombre, stock').eq('id', item.producto_id).single();
         if (pData) {
            const newStock = pData.stock - item.cantidad;
            await supabase.from('productos').update({ stock: newStock }).eq('id', item.producto_id);
            if (newStock <= 0) {
              productosAEliminar.push(pData.nombre);
            }
         }
      }
    } catch (innerErr) {
       // Manual rollback
       await supabase.from('tickets').delete().eq('id', ticket_id);
       throw innerErr;
    }

    res.status(201).json({ id: ticket_id, eliminados: productosAEliminar, message: 'Ticket creado' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear ticket' });
  }
});

// PUT /api/tickets/:id/estado
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { data: ticket, error: fetchErr } = await supabase.from('tickets').select('estado').eq('id', id);
    if (fetchErr || !ticket || ticket.length === 0) return res.status(404).json({ error: 'Ticket no encontrado' });
    
    if (ticket[0].estado !== 'en-espera') {
      return res.status(400).json({ error: 'Solo se puede cambiar estado desde en-espera' });
    }

    const { error: updateErr } = await supabase.from('tickets').update({ estado }).eq('id', id);
    if (updateErr) throw updateErr;
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
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Ticket eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

export default router;
