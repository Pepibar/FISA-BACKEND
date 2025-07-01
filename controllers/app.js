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

    // ✅ Verificación de datos
    if (
      !monto ||
      !plazomeses ||
      !edad ||
      !ingresos ||
      !tipodeingresos ||
      añosexp === undefined ||
      deudasmensuales === undefined ||
      mora_total === undefined ||
      deuda_total === undefined ||
      tuvo_atrasos === undefined
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
      edad: edad,
      tipo_ingreso: tipodeingresos,
      años_trabajando: añosexp,
      mora_total: mora_total,
      deuda_total: deuda_total,
      tuvo_atrasos: tuvo_atrasos,
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
        tipodeingresos,
        añosexp,
        deudasmensuales,
        mora_total,
        deuda_total,
        tuvo_atrasos,
        mensaje,
        apto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      monto,
      plazomeses,
      usuariosid,
      edad,
      ingresos,
      tipodeingresos,
      añosexp,
      deudasmensuales,
      mora_total,
      deuda_total,
      tuvo_atrasos,
      mensaje,
      apto,
    ];

    const resultado = await pool.query(query, values);

    console.log("Email para enviar el mail:", emailUsuario, typeof emailUsuario);

    if (!emailUsuario || typeof emailUsuario !== "string" || emailUsuario.trim() === "") {
      return res.status(400).json({ error: "Email del usuario inválido o no definido" });
    }

    // ✅ Email con nuevo formato
    const contenidoHTML = `
  <div style="
    font-family: Arial, sans-serif;
    padding: 30px;
    background-color: #fff;
    border: 4px solid #A259FF;
    border-radius: 12px;
    max-width: 650px;
    margin: 20px auto;
    color: #333;
    font-size: 18px;
    line-height: 1.6;
  ">
    <h2 style="color: #A259FF; font-size: 28px; margin-bottom: 20px;">Hola 👋</h2>
    <p style="font-size: 20px; margin-bottom: 20px;">Tu solicitud de préstamo fue procesada.</p>

    <p style="font-size: 20px; margin-bottom: 15px;"><strong>Resultado:</strong> ${apto ? "✅ Aprobada" : "❌ No Aprobada"}</p>
    <p style="font-size: 20px; margin-bottom: 30px;"><strong>Motivo:</strong> ${mensaje}</p>

    <h3 style="color: #A259FF; font-size: 24px; margin-bottom: 15px;">📄 Detalles de tu solicitud:</h3>
    <ul style="font-size: 18px; padding-left: 25px; margin-bottom: 30px;">
      <li><strong>Monto solicitado:</strong> $${monto}</li>
      <li><strong>Plazo:</strong> ${plazomeses} meses</li>
      <li><strong>Ingresos mensuales:</strong> $${ingresos}</li>
      <li><strong>Deudas mensuales:</strong> $${deudasmensuales}</li>
      <li><strong>Mora total:</strong> $${mora_total}</li>
      <li><strong>Deuda total:</strong> $${deuda_total}</li>
      <li><strong>Tuvo atrasos:</strong> ${tuvo_atrasos ? "Sí" : "No"}</li>
      <li><strong>Tipo de ingreso:</strong> ${tipodeingresos}</li>
      <li><strong>Años de experiencia laboral:</strong> ${añosexp}</li>
      <li><strong>Edad:</strong> ${edad} años</li>
    </ul>

    <p style="font-size: 18px;">Gracias por confiar en <strong>FISA</strong>. Nuestro equipo te contactará si es necesario o podés responder a este correo para consultas.</p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 40px 0;">

    <p style="font-size: 16px; color: #777;">FISA - Financial Intelligence for Smart Approval</p>
  </div>
`;

    await enviarMail(emailUsuario, "Resultado de tu solicitud de préstamo - FISA", contenidoHTML);

    console.log("📧 Email enviado a:", emailUsuario);

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
