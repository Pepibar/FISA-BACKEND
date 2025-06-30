import axios from 'axios';
import pool from "../neon.js";
import enviarMail from "../emails.js";

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

    
    const responseIA = await axios.post(IA_URL, datosParaIA);
    console.log("✅ Respuesta IA:", responseIA.data);

    const { resultado: apto, mensaje } = responseIA.data;

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

    // ✅ Enviar correo al usuario
    await enviarMail(
      emailUsuario,
      "Resultado de tu solicitud de préstamo - FISA",
      `
        <h2>Hola 👋</h2>
        <p>Tu solicitud de préstamo fue procesada.</p>

        <p><strong>Resultado:</strong> ${
          apto ? "✅ Aprobada" : "❌ No Aprobada"
        }</p>
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
