import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bem-vindo à API! Use /auth/registrar para registrar usuários.');
});

// Rotas para renderizar HTML
app.get('/registrar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/mensagens', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mensagens.html'));
});

// Suas outras rotas API aqui, ex: auth, mensagens, etc...

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});