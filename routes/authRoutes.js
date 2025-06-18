import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const router = express.Router();

// Funções de validação
function emailValido(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function senhaValida(senha) {
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regexSenha.test(senha);
}

// POST /registro - Registrar novo usuário
router.post('/registro', async (req, res) => {
  const { nome, email, senha } = req.body;
  const erros = {};

  if (!nome || nome.trim() === '') erros.nome = 'Nome é obrigatório';
  if (!emailValido(email)) erros.email = 'Email inválido';
  if (!senhaValida(senha)) erros.senha = 'Senha inválida';

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return res.status(400).json({ erros: { email: 'Email já cadastrado' } });

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
    });

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso', usuario: novoUsuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

// POST /login - Autenticar e gerar token
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Senha inválida' });

    const token = jwt.sign(
      { id: usuario.id_user, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no login' });
  }
});

export default router;
