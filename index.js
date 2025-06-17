import express from 'express';
import authRoutes from './routes/authRoutes.js';
import mensagemRoutes from './routes/mensagemRoutes.js';

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);          // público
app.use('/mensagens', mensagemRoutes); // protegido

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});