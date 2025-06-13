import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/solicitudes', solicitudes.crearSolicitud);

app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});

export default app;