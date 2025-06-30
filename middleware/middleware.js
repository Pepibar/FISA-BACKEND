import jwt from "jsonwebtoken";
import pool from "../neon.js";

export const verifyToken = async (req, res, next) => {
  const header_token = req.headers["authorization"];
  if (!header_token) {
    return res.status(400).json({ message: "Token necesario" });
  }

  const tokenParts = header_token.split(" ");
  if (tokenParts[0] !== "Bearer" || tokenParts.length !== 2) {
    return res.status(400).json({ message: "Formato del token no válido" });
  }

  const token = tokenParts[1];

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const { usuariosid, rol } = decoded;

    const result = await pool.query(
      "SELECT * FROM public.usuarios WHERE usuariosid = $1",
      [usuariosid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    req.usuariosid = usuariosid;
    req.rol = rol; // guardamos rol para rutas protegidas

    next();

  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
export const authorizeRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.rol)) {
      return res.status(403).json({ message: "Acceso no autorizado: rol insuficiente" });
    }
    next();
  };
};
