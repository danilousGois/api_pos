import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function emailValido(email) {
  if (typeof email !== 'string' || email.length < 8) return false;

  // Regex básico para validar email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

// Função para validar senha com regras:
// mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial
function senhaValida(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

// Controller para registrar usuário
async function registrar(req, res) {
  const { nome, email, senha } = req.body;

  const erros = {};

  if (!nome || nome.trim() === '') {
    erros.nome = 'Nome é obrigatório';
  }

  if (!emailValido(email)) {
    erros.email = 'Email inválido: deve ter formato válido e pelo menos 8 caracteres.';
  }

  if (!senhaValida(senha)) {
    erros.senha = 'Senha inválida: deve conter ao menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial.';
  }

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  try {
    // Aqui você pode verificar se email já existe no banco
    // e salvar o usuário com a senha hashada, por exemplo:
    // const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    // if (usuarioExistente) return res.status(400).json({ erros: { email: 'Email já cadastrado' } });
    //
    // await prisma.usuario.create({ data: { nome, email, senha: hashSenha } });

    // Só para exemplo, resposta de sucesso:
    return res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

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


module.exports = { 
  registrar,
  login
 };