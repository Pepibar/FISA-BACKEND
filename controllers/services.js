import pool from "../neon.js";

const getUsuarioByEmail = async (email) => {
    const { rows } = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
};

const getUsuarioById = async (id) => {
    const { rows } = await pool.query(
        "SELECT * FROM usuarios WHERE usuariosid = $1",
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

const createUsuario = async (usuario) => {
  try {
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [usuario.nombre, usuario.apellido, usuario.email, usuario.password, usuario.rol]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const getSolicitudesByUsuarioId = async (usuariosid) => {
    const { rows } = await pool.query(
        `SELECT * FROM public.solicitudesprestamos
         WHERE usuariosid = $1
         ORDER BY solicitudid DESC`,
        [usuariosid]
    );
    return rows;
};

const service = {
    getUsuarioByEmail,
    getUsuarioById,
    createUsuario,
    getSolicitudesByUsuarioId, 
};

export default service;
