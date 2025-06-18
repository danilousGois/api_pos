import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registrar, login } from '../controllers/authController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Página de registro
router.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/registro.html'));
});

// Página de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Lógica de registro
router.post('/auth/registrar', registrar);

// Lógica de login
router.post('/auth/login', login);

export default router;