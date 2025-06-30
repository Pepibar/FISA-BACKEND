import pool from "../neon.js";


const obtenerSolicitudesUsuario = async (req, res) => {
  try {
    const usuariosid = req.usuariosid;


    const query = `
      SELECT * FROM public.solicitudesprestamos
      WHERE usuariosid = $1
      ORDER BY solicitudid DESC;
    `;


    const result = await pool.query(query, [usuariosid]);


    res.status(200).json({
      mensaje: "Solicitudes encontradas",
      solicitudes: result.rows,
    });


  } catch (error) {
    console.error("❌ Error obteniendo solicitudes:", error.message);
    res.status(500).json({ error: "Error al obtener las solicitudes" });
  }
}


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
    createUsuario,
    obtenerSolicitudesUsuario
};


export default service;