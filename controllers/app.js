import pool from "../neon.js";

async function crearSolicitud(req, res) {
  try {
    console.log("📩 Solicitud recibida:", req.body); // Esto es clave para ver si llega el request

    const {
      monto,
      plazomeses,
      historialcrediticio,
      usuariosid,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
    } = req.body;

    const query = `
      INSERT INTO public.solicitudesprestamos (
        monto,
        plazomeses,
        historialcrediticio,
        usuariosid,
        edad,
        ingresos,
        tipodeingresos,
        añosexp,
        deudasmensuales
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
      historialcrediticio,
      usuariosid,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
    ];

    const resultado = await pool.query(query, values);

    res.status(201).json({
      mensaje: "Solicitud creada",
      solicitud: resultado.rows[0],
    });

  } catch (error) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({ error: "Error al crear solicitud" });
  }
}

const solicitudes = {
  crearSolicitud
};

export default solicitudes;