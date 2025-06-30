import axios from 'axios';
import pool from "../neon.js";

const IA_URL = "https://proyecto-ia-fisa.onrender.com/prestamo";

async function crearSolicitud(req, res) {
  try {
    console.log("📩 Solicitud recibida:", req.body);

    const {
      monto,
      plazomeses,
      historialcrediticio,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
    } = req.body;

    const usuariosid = req.usuariosid;

  const responseIA = {
      data: {
        resultado: true,  // o false para probar rechazo
        mensaje: "Simulación: préstamo aprobado",
      }
    };

   
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
        deudasmensuales,
        mensaje,
        apto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      mensaje,
      apto,
    ];

    const resultado = await pool.query(query, values);

    res.status(201).json({
      mensaje: "Solicitud creada y analizada (simulada) por IA",
      solicitud: resultado.rows[0],
      resultadoIA: responseIA.data,
    });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error.message);
    res.status(500).json({ error: "Error al crear solicitud" });
  }
}


const solicitudes = {
  crearSolicitud,
};

export default solicitudes;
