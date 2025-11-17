import axios from 'axios';
import pool from "../neon.js";
import enviarMail from '../emails.js';

const IA_URL = "https://proyecto-ia-fisa.onrender.com/prestamo2";

async function crearSolicitud(req, res) {
  try {
    console.log("📩 Solicitud recibida - headers:", req.headers);

    // DEBUG: mostrar body bruto para entender qué llega
    console.log("📩 Solicitud recibida - body raw:", req.body);

    // Protección defensiva: si no hay body, devolvemos error amigable
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Body vacío o no recibido. Asegurate de enviar JSON y el header 'Content-Type: application/json'."
      });
    }

    // Usar body seguro para evitar errores al destructurar undefined
    const body = req.body || {};

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
    } = body;

    // Validación de campos obligatorios
    if (
      monto === undefined || plazomeses === undefined || edad === undefined ||
      ingresos === undefined || tipodeingresos === undefined ||
      añosexp === undefined || deudasmensuales === undefined ||
      mora_total === undefined || deuda_total === undefined || tuvo_atrasos === undefined
    ) {
      console.warn("⚠️ Faltan datos en body:", body);
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const usuariosid = req.usuariosid;
    const emailUsuario = req.userEmail;

    // Datos que se envían a la IA
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

    // Llamada a la IA
    const responseIA = await axios.post(IA_URL, datosParaIA);

    const apto = responseIA.data.resultado;
    const mensaje = responseIA.data.mensaje;
    const detalles = responseIA.data.detalles;

    console.log("✅ Respuesta IA:", responseIA.data);

    // Guardar en base de datos
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

    console.log("🧪 QUERY:", query);
    console.log("🧪 VALUES:", values);
    console.log("🧮 Cantidad de columnas:", query.match(/\$\d+/g)?.length, "| Valores:", values.length);

    const resultado = await pool.query(query, values);

    // Respuesta al cliente (incluye detalles)
    res.status(201).json({
      mensaje: "Solicitud creada correctamente",
      solicitud: resultado.rows[0],
      resultadoIA: {
        resultado: apto,
        mensaje,
        detalles
      }
    });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error);
    // Si es un error de axios con response, loguealo completo
    if (error.response) {
      console.error("Axios error response data:", error.response.data);
      console.error("Axios error response status:", error.response.status);
    }
    res.status(500).json({ error: "Error al crear solicitud" });
  }
}

const solicitudes = { crearSolicitud };
export default solicitudes;
