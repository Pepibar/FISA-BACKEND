import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import service from "./services.js"; // <-- asegúrate que apunta bien

const app = express();
app.use(cors());
app.use(express.json());

const register = async (req, res) => {
  console.log("📥 REGISTRO:", req.body); // 👈 esto ayuda mucho para debug

  const usuario = req.body;

  if (!usuario.email || !usuario.password || !usuario.nombre || !usuario.apellido) {
    console.log("⛔ Faltan campos:", usuario);
    return res.status(400).send("Todos los campos tienen que estar completos");
  }

  try {
    const usuario_email = await service.getUsuarioByEmail(usuario.email);
    if (usuario_email) {
      return res.status(400).json({ message: "Ya hay un usuario con ese email" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(usuario.password, salt);
    usuario.password = hash;

    const nuevoUsuario = await service.createUsuario(usuario);

    return res.json({
      id: nuevoUsuario.usuariosid,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      email: nuevoUsuario.email
    });
  } catch (error) {
    console.error("❌ Error en register:", error);
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const usuario = req.body;

  if (!usuario.email || !usuario.password) {
    return res.status(400).json({ message: "Debe proporcionar email y contraseña" });
  }

  try {
    const usuario_db = await service.getUsuarioByEmail(usuario.email);
    if (!usuario_db) {
      return res.status(400).json({ message: "No hay un usuario asociado a ese mail" });
    }

    const comparison = bcrypt.compareSync(usuario.password, usuario_db.password);
    if (!comparison) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ userid: usuario_db.usuariosid }, process.env.JWT_SECRET || "FISA", {
      expiresIn: 30 * 60,
    });

    return res.status(200).json({
      token: token,
      usuario: {
        id: usuario_db.usuariosid,
        nombre: usuario_db.nombre,
        apellido: usuario_db.apellido,
        email: usuario_db.email
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ message: error.message });
  }
};

const usuario = { login, register };

export default usuario;
