import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';
import usuario from './controllers/login.js';
import { verifyToken, authorizeRoles } from './middleware/middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/solicitudes', verifyToken, authorizeRoles(['usuario', 'admin']), solicitudes.crearSolicitud);


app.post('/register', usuario.register);
app.post('/login', usuario.login);

app.get('/admin/dashboard', verifyToken, authorizeRoles(['admin']), (req, res) => {
  res.json({ message: "Bienvenido admin" });
});

app.get('/solicitudeshechas', verifyToken, authorizeRoles(['usuario', 'admin']), solicitudes.obtenerSolicitudesUsuario);

app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});

export default app;