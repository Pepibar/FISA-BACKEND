const pool = require('../neon');

async function crearSolicitud(req, res) {
  try {
    const {
      monto,
      plazomeses,
      fechasolicitud,
      usuariosid,
      edad,
      genero,
      educacion,
      ingresos,
      añosexp,
      vivienda,
      proposito,
      interes,
      duracionprestamos
    } = req.body;

    const query = `
      INSERT INTO public.solicitantes (
        monto,
        plazomeses,
        fechasolicitud,
        usuariosid,
        edad,
        genero,
        educacion,
        ingresos,
        añosexp,
        vivienda,
        proposito,
        interes,
        duracionprestamos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
      fechasolicitud,
      usuariosid,
      edad,
      genero,
      educacion,
      ingresos,
      añosexp,
      vivienda,
      proposito,
      interes,
      duracionprestamos
    ];

    const resultado = await pool.query(query, values);
    res.status(201).json({ mensaje: 'Solicitud creada', solicitud: resultado.rows[0] });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
}

module.exports = {
  crearSolicitud
};