import pool from '../neon.js';

async function crearSolicitud(req, res) {
  try {
    const {
      monto,
      plazomeses,
<<<<<<< HEAD
      historialcrediticio,
      usuariosid,
      edad,
      deudasmensuales,
=======
      usuariosid,
      edad,
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
      ingresos,
      tipodeingresos,
      añosexp,
<<<<<<< HEAD
=======
      tipodeingreso,
      interes,
      deudasmensuales,
      historialcrediticio
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
    } = req.body;

    const query = `
      INSERT INTO public.solicitantes (
        monto,
        plazomeses,
<<<<<<< HEAD
        historialcrediticio,
        usuariosid,
        edad,
        deudasmensuales,
=======
        usuariosid,
        edad,
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
        ingresos,
        tipodeingresos,
        añosexp,
<<<<<<< HEAD
=======
        tipodeingreso,
        interes,
        deudasmensuales,
        historialcrediticio
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
<<<<<<< HEAD
      historialcrediticio,
      usuariosid,
      edad,
      deudasmensuales,
=======
      usuariosid,
      edad,
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
      ingresos,
      tipodeingresos,
      añosexp,
<<<<<<< HEAD
=======
      tipodeingreso,
      interes,
      deudasmensuales,
      historialcrediticio
>>>>>>> 92bcb691df6aad0d20b10b2c24a6f05f14cbf4d7
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