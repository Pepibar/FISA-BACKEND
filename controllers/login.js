import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import service from "./services.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const register = async (req, res) => {
  const usuario = req.body;

  if (!usuario.email || !usuario.password || !usuario.nombre || !usuario.apellido) {
    return res.status(400).send("Todos los campos tienen que estar completos");
  }

  try {
    const usuario_email = await service.getUsuarioByEmail(usuario.email);
    if (usuario_email) {
      return res.status(400).json({ message: "Ya hay un usuario con ese email" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(usuario.password, salt);

    const rol = usuario.rol || "usuario";

    const nuevoUsuario = await service.createUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: hash,
      rol,
    });

    return res.json({
      id: nuevoUsuario.usuariosid,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ha ocurrido un error inesperado" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Debe proporcionar email y contraseña" });
  }

  try {
    const usuario_db = await service.getUsuarioByEmail(email);
    if (!usuario_db) {
      return res.status(400).json({ message: "No hay un usuario asociado a ese mail" });
    }

    const comparison = bcrypt.compareSync(password, usuario_db.password);
    const secret = process.env.JWT_SECRET;

    if (comparison) {
      const token = jwt.sign(
        {
          usuariosid: usuario_db.usuariosid,
          rol: usuario_db.rol,
          email: usuario_db.email,  // 🔥 Ahora incluye email
        },
        secret,
        { expiresIn: 60 * 60 } // 1 hora
      );

      return res.status(200).json({
        token,
        usuario: {
          id: usuario_db.usuariosid,
          nombre: usuario_db.nombre,
          apellido: usuario_db.apellido,
          email: usuario_db.email,
          rol: usuario_db.rol,
        },
      });
    } else {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const forgetpassword = async (req, res) => {
  const { email } = req.body;

  const user = await service.getUsuarioByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const token = jwt.sign({ id: user.usuariosid }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Token válido por 15 minutos
  });

  const link = `https://fisa-backend.vercel.app/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial; padding: 20px; border: 2px solid #a259ff; border-radius: 10px;">
      <h2 style="color:#a259ff;">Recuperación de contraseña 🔑</h2>
      <p>Hola ${user.nombre}, recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente botón para continuar:</p>
      <a href="${link}" 
         style="padding: 10px 20px; background-color: #a259ff; color: white; 
                text-decoration: none; border-radius: 5px;">
         Cambiar contraseña
      </a>
      <p style="margin-top:20px;">Si no solicitaste este cambio, ignorá este correo.</p>
      <hr/>
      <p>FISA - Financial Intelligence for Smart Approval</p>
    </div>
  `;

  await enviarMail(email, "Recuperá tu contraseña", html);

  res.json({ message: "Email enviado con el enlace para recuperar la contraseña" });
};



const usuario = {
  login,
  register,
 forgetpassword,
  
};

export default usuario;
