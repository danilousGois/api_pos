import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function emailValido(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function senhaValida(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

export async function registrar(req, res) {
  const { nome, email, senha } = req.body;
  const erros = {};

  if (!nome || nome.trim() === '') erros.nome = 'Nome é obrigatório';
  if (!emailValido(email)) erros.email = 'Email inválido';
  if (!senhaValida(senha)) erros.senha = 'Senha fraca';

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return res.status(400).json({ erros: { email: 'Email já cadastrado' } });

    const senhaHash = await bcrypt.hash(senha, 10);

    await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
    });

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso', redirecionar: '/mensagens' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) return res.status(401).json({ erro: 'Senha inválida' });

    const token = jwt.sign(
      { id: usuario.id_user, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ mensagem: 'Login bem-sucedido', token, redirecionar: '/mensagens' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
}
