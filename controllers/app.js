import pool from '../neon.js';

async function crearSolicitud(req, res) {
  try {
    const {
      monto,
      plazomeses,
      historialcrediticio,
      usuariosid,
      edad,
      deudasmensuales,
      ingresos,
      tipodeingresos,
      añosexp,
    } = req.body;

    const query = `
      INSERT INTO public.solicitantes (
        monto,
        plazomeses,
        historialcrediticio,
        usuariosid,
        edad,
        deudasmensuales,
        ingresos,
        tipodeingresos,
        añosexp,
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
      historialcrediticio,
      usuariosid,
      edad,
      deudasmensuales,
      ingresos,
      tipodeingresos,
      añosexp,
    ];

    const resultado = await pool.query(query, values);
    res.status(201).json({ mensaje: 'Solicitud creada', solicitud: resultado.rows[0] });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
}

const solicitudes = {
crearSolicitud
};

export default solicitudes