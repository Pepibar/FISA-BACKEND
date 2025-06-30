import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';
import usuario from './controllers/login.js';
import { verifyToken } from './middleware/middleware.js';

const app = express();


app.use(cors());
app.use(express.json());

app.post('/solicitudes',verifyToken, solicitudes.crearSolicitud);
app.post('/register', usuario.register);
app.post('/login', usuario.login);
app.get('/solicitudeshechas', verifyToken, solicitudes.obtenerSolicitudesUsuario);


app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});


export default app;