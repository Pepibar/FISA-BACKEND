import jwt from "jsonwebtoken";
import pool from "../neon.js";

export const verifyToken = async (req, res, next) => {
  const header_token = req.headers["authorization"];
  console.log("🔐 Token recibido:", header_token);

  if (!header_token) {
    return res.status(400).json({ message: "Token necesario" });
  }

  const tokenParts = header_token.split(" ");
  if (tokenParts[0] !== "Bearer" || tokenParts.length !== 2) {
    console.log("❌ Formato del token no válido");
    return res.status(400).json({ message: "Formato del token no válido" });
  }

  const token = tokenParts[1];

  try {
    const secret = process.env.JWT_SECRET;
      console.log("🔑 Secret utilizada:", secret); // 👉 Verifica si el JWT_SECRET se está leyendo correctamente
    const decoded = jwt.verify(token, secret);
    const { usuariosid } = decoded;
    console.log("✅ Token decodificado. UsuarioID:", usuariosid);
    const result = await pool.query(
      "SELECT * FROM public.usuarios WHERE usuariosid = $1",
      [usuariosid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Guardamos el ID en la request para usarlo en rutas protegidas
    req.usuariosid = usuariosid;
    next();

  } catch (error) {
    
    console.error("❌ Error en verificación de token:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};