import axios from 'axios';
import pool from "../neon.js";
import enviarMail from '../emails.js';

const IA_URL = "https://proyecto-ia-fisa.onrender.com/prestamo2";

async function crearSolicitud(req, res) {
  try {
    console.log("📩 Solicitud recibida:", req.body);

    const {
      monto,
      plazomeses,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
      mora_total,
      deuda_total,
      tuvo_atrasos,
    } = req.body;

    // Validación
    if (
      !monto || !plazomeses || !edad || !ingresos || !tipodeingresos ||
      añosexp === undefined || deudasmensuales === undefined ||
      mora_total === undefined || deuda_total === undefined || tuvo_atrasos === undefined
    ) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const usuariosid = req.usuariosid;
    const emailUsuario = req.userEmail;

    const datosParaIA = {
      ingresos_mensuales: ingresos,
      deudas_mensuales: deudasmensuales,
      monto_prestamo: monto,
      plazo_meses: plazomeses,
      edad,
      tipo_ingreso: tipodeingresos,
      años_trabajando: añosexp,
      mora_total,
      deuda_total,
      tuvo_atrasos,
    };

    const responseIA = await axios.post(IA_URL, datosParaIA);

    const apto = responseIA.data.resultado;
    const mensaje = responseIA.data.mensaje;
    console.log("✅ Respuesta IA:", responseIA.data);

    const query = `
      INSERT INTO public.solicitudesprestamos (
        monto,
        plazomeses,
        usuariosid,
        edad,
        ingresos,
        añosexp,
        tipodeingresos,
        deudasmensuales,
        mensaje,
        apto,
        mora_total,
        deuda_total,
        tuvo_atrasos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
      usuariosid,
      edad,
      ingresos,
      añosexp,
      tipodeingresos,
      deudasmensuales,
      mensaje,
      apto,
      mora_total,
      deuda_total,
      tuvo_atrasos
    ];

    // 🔍 Debug de la query
   
    res.status(201).json({
      mensaje: "Solicitud creada correctamente",
      solicitud: resultado.rows[0],
      resultadoIA: { resultado: apto, mensaje }
    });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error.message);
    res.status(500).json({ error: "Error al crear solicitud" });
  }
}

const solicitudes = { crearSolicitud };
export default solicitudes;
