import axios from 'axios';
import pool from "../neon.js";
import enviarMail from '../emails.js';

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

   
    if (
      !monto ||
      !plazomeses ||
      !historialcrediticio ||
      !edad ||
      !ingresos ||
      !tipodeingresos ||
      !añosexp ||
      !deudasmensuales
    ) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const usuariosid = req.usuariosid;
    const emailUsuario = req.userEmail;

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

    let apto = false;
    let mensaje = "Resultado simulado: IA no disponible.";

    try {
      const responseIA = await axios.post(IA_URL, datosParaIA);
      apto = responseIA.data.resultado;
      mensaje = responseIA.data.mensaje;
      console.log("✅ Respuesta IA:", responseIA.data);
    } catch (error) {
      console.warn("⚠️ IA no disponible, usando resultado simulado");
    }

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
    console.log("Email para enviar el mail:", emailUsuario, typeof emailUsuario);

if (!emailUsuario || typeof emailUsuario !== "string" || emailUsuario.trim() === "") {
  return res.status(400).json({ error: "Email del usuario inválido o no definido" });
}
    if (emailUsuario) {
      await enviarMail(
        emailUsuario,
        "Resultado de tu solicitud de préstamo - FISA",
    `
      <h2>Hola 👋</h2>
      <p>Tu solicitud de préstamo fue procesada.</p>

      <p><strong>Resultado:</strong> ${apto ? "✅ Aprobada" : "❌ No Aprobada"}</p>
      <p><strong>Motivo:</strong> ${mensaje}</p>

      <h3>📄 Detalles de tu solicitud:</h3>
      <ul>
        <li><strong>Monto solicitado:</strong> $${monto}</li>
        <li><strong>Plazo:</strong> ${plazomeses} meses</li>
        <li><strong>Ingresos mensuales:</strong> $${ingresos}</li>
        <li><strong>Deudas mensuales:</strong> $${deudasmensuales}</li>
        <li><strong>Historial crediticio:</strong> ${historialcrediticio}</li>
        <li><strong>Tipo de ingreso:</strong> ${tipodeingresos}</li>
        <li><strong>Años de experiencia laboral:</strong> ${añosexp}</li>
        <li><strong>Edad:</strong> ${edad} años</li>
      </ul>

      <p>Gracias por confiar en FISA. Nuestro equipo te contactará si es necesario o podés responder a este correo para consultas.</p>
      <hr/>
      <p>FISA - Financial Intelligence for Smart Approval</p>
    `
  );
      console.log("📧 Email enviado a:", emailUsuario);
    } else {
      console.warn("⚠️ Email del usuario no definido. No se envió el mail.");
    }

    res.status(201).json({
      mensaje: "Solicitud creada correctamente",
      solicitud: resultado.rows[0],
      resultadoIA: { resultado: apto, mensaje },
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
