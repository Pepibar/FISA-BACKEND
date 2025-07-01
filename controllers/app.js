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

    // ✅ Validación de datos
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

    // 🔗 Datos para la IA
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

    // ✅ Guardar en la base de datos
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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

    console.log("Email para enviar:", emailUsuario);

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
      <h2 style="color: #A259FF; font-size: 28px;">Hola 👋</h2>
      <p style="font-size: 20px;">Tu solicitud fue procesada.</p>
      <p><strong>Resultado:</strong> ${apto ? "✅ Aprobada" : "❌ No Aprobada"}</p>
      <p><strong>Motivo:</strong> ${mensaje}</p>
      <h3 style="color: #A259FF;">📄 Detalles:</h3>
      <ul>
        <li><strong>Monto:</strong> $${monto}</li>
        <li><strong>Plazo:</strong> ${plazomeses} meses</li>
        <li><strong>Ingresos:</strong> $${ingresos}</li>
        <li><strong>Deudas:</strong> $${deudasmensuales}</li>
        <li><strong>Mora total:</strong> $${mora_total}</li>
        <li><strong>Deuda total:</strong> $${deuda_total}</li>
        <li><strong>Tuvo atrasos:</strong> ${tuvo_atrasos ? "Sí" : "No"}</li>
        <li><strong>Tipo de ingreso:</strong> ${tipodeingresos}</li>
        <li><strong>Años trabajando:</strong> ${añosexp}</li>
        <li><strong>Edad:</strong> ${edad}</li>
      </ul>
      <p>Gracias por confiar en <strong>FISA</strong>.</p>
    </div>`;

    await enviarMail(emailUsuario, "Resultado de tu solicitud - FISA", contenidoHTML);

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
