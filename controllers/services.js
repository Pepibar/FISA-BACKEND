import pool from "../neon.js";

const getUsuarioByEmail = async (email) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    if (rows.length < 1) return null;
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const getUsuarioById = async (id) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE usuariosid = $1",
      [id]
    );
    if (rows.length < 1) return null;
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const createUsuario = async (usuario) => {
  try {
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [usuario.nombre, usuario.apellido, usuario.email, usuario.password]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const service = {
  getUsuarioByEmail,
  getUsuarioById,
  createUsuario
};

export default service;
