import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';
import usuario from './controllers/login.js';
import { verifyToken, authorizeRoles } from './middleware/middleware.js';
import service from './controllers/services.js';
import axios from "axios";
import https from "https";




const app = express();



app.get("/bcra", async (req, res) => {
  try {
    const url = "https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/14";

    const headers = {
      "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODA2ODUyMjcsInR5cGUiOiJleHRlcm5hbCIsInVzZXIiOiJwbGF5bWFydHUxOEBnbWFpbC5jb20ifQ.uFWlbUryqQJYCnelGF9amd-y6R7Qdkq02JRR4lo-s-3q9fNjAao680gthXrnk_QqHySzIQenulsfHnfq-pncWg"
    };

    // ⭐ IMPORTANTE — axios SI ignora certificados
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await axios.get(url, {
      headers,
      httpsAgent
    });

    console.log("🔄 Status BCRA:", response.status);

    const datos = response.data;

    if (!datos.results || datos.results.length === 0) {
      return res.status(404).json({ error: "No hay datos disponibles" });
    }

    const ultimo = datos.results[0];

    return res.json({
      fecha: ultimo.fecha,
      valor: ultimo.valor
    });

  } catch (error) {
    console.error("❌ Error BCRA:", error);
    return res.status(500).json({ error: "Error consultando BCRA" });
  }
});


app.use(cors());
app.use(express.json());

app.post('/solicitudes', solicitudes.crearSolicitud);

app.post('/forgetpassword', usuario.forgetpassword);
app.post('/register', usuario.register);
app.post('/login', usuario.login);

app.get('/admin/dashboard', verifyToken, authorizeRoles(['admin']), (req, res) => {
  res.json({ message: "Bienvenido admin" });
});

app.get('/solicitudeshechas', verifyToken, authorizeRoles(['usuario', 'admin']), service.getSolicitudesByUsuarioId);


app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});
//son rutas inutiles para evitar errores de favicon 
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

export default app;