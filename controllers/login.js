import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import service from "./services.js";

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

    usuario.password = hash;

    const rol = usuario.rol || 'usuario';

    const nuevoUsuario = await service.createUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: usuario.password,
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
    const usuario = req.body;

    if (!usuario.email || !usuario.password) {
        return res.status(400).json({ message: "Debe proporcionar email y contraseña" });
    }

    try {
        const usuario_db = await service.getUsuarioByEmail(usuario.email);
        if (!usuario_db) {
            return res.status(400).json({ message: "No hay un usuario asociado a ese mail" });
        }

        const passwordEnDB = usuario_db.password;  
        const secret = process.env.JWT_SECRET;

        const comparison = bcrypt.compareSync(usuario.password, passwordEnDB);

        if (comparison) {
  const token = jwt.sign(
    { usuariosid: usuario_db.usuariosid, rol: usuario_db.rol }, 
    secret,
    { expiresIn: 30 * 60 }
  );

  return res.status(200).json({
    token: token,
    usuario: {
      id: usuario_db.usuariosid,
      nombre: usuario_db.nombre,
      apellido: usuario_db.apellido,
      email: usuario_db.email,
      rol: usuario_db.rol,
    },
  });
}else {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const usuario = {
    login,
    register,
};

export default usuario;
