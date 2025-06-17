import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const emailRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

export const registrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ erro: 'Email inválido. Deve conter letras maiúsculas, minúsculas, número, caractere especial e 8+ caracteres.' });
  }

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) {
    return res.status(400).json({ erro: 'Email já cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    });

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar usuário', detalhes: error.message });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não encontrado.' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Senha inválida.' });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    'segredo-super-seguro',
    { expiresIn: '1h' }
  );

  res.json({ mensagem: 'Login realizado com sucesso', token });
};