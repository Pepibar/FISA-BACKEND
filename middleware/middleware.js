export const verifyToken = async (req, res, next) => {
  const header_token = req.headers["authorization"];
  console.log("🔐 Token recibido:", header_token);

  if (!header_token) {
    return res.status(400).json({ message: "Token necesario" });
  }

  const tokenParts = header_token.split(" ");
  if (tokenParts[0] !== "Bearer" || tokenParts.length !== 2) {
    return res.status(400).json({ message: "Formato de token inválido" });
  }

  const token = tokenParts[1];

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const { usuariosid } = decoded;

    const result = await pool.query(
      "SELECT * FROM public.usuarios WHERE usuariosid = $1",
      [usuariosid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    req.usuariosid = usuariosid;
    req.userEmail = result.rows[0].email;  // 🔥 🔥 Esto es clave
    req.rol = result.rows[0].rol;          // 🔥 También para roles

    next();

  } catch (error) {
    console.error("❌ Error en verificación de token:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
