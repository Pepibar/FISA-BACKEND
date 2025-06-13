import express from 'express';
import cors from 'cors';
import solicitudes from './controllers/app.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta para crear una solicitud
app.post('/solicitudes', solicitudes.crearSolicitud);

app.get('/', (req, res) => {
  res.send('API de FISA funcionando correctamente ✅');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});