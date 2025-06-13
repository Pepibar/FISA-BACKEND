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
      usuariosid,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
    } = req.body;

    // Preparar datos para enviar a la IA
    const datosParaIA = {
      historial_crediticio: historialcrediticio,
      ingresos_mensuales: ingresos,
      deudas_mensuales: deudasmensuales,
      monto_prestamo: monto,
      plazo_meses: plazomeses,
      edad: edad,
      tipo_ingreso: tipodeingresos,
      años_trabajando: añosexp,
    };

    // Llamar a la IA
    const responseIA = await axios.post(IA_URL, datosParaIA);
    console.log("✅ Respuesta IA:", responseIA.data);

    const { resultado: apto, mensaje } = responseIA.data;

    // Insertar en DB con respuesta IA
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
      mensaje: "Solicitud creada y analizada por IA",
      solicitud: resultado.rows[0],
      resultadoIA: responseIA.data,
    });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error.message);
    res.status(500).json({ error: "Error al crear solicitud o comunicarse con la IA" });
  }
}

const solicitudes = {
  crearSolicitud,
};

export default solicitudes;
