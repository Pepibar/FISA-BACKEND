import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';
import usuario from './controllers/login.js';
import { verifyToken } from './middleware/middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para crear solicitud (tu ya la tienes)
app.post('/solicitudes',verifyToken, solicitudes.crearSolicitud);

// Rutas para autenticación
app.post('/register', usuario.register);
app.post('/login', usuario.login);

app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});

export default app;