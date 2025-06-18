import express from 'express';
import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware de autenticação via token JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}

// GET /mensagens - listar mensagens do usuário autenticado
router.get('/', autenticarToken, async (req, res) => {
  try {
    const mensagens = await prisma.mensagem.findMany({
      where: { id_user: req.usuario.id },
      orderBy: { dataHora: 'desc' },
    });
    res.json(mensagens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar mensagens' });
  }
});

// POST /mensagens - criar nova mensagem
router.post('/', autenticarToken, async (req, res) => {
  const { conteudo } = req.body;
  if (!conteudo || conteudo.trim() === '') {
    return res.status(400).json({ erro: 'Conteúdo obrigatório' });
  }

  try {
    const nova = await prisma.mensagem.create({
      data: {
        conteudo,
        id_user: req.usuario.id,
      },
    });
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar mensagem' });
  }
});

// PUT /mensagens/:id - editar mensagem existente
router.put('/:id', autenticarToken, async (req, res) => {
  const { conteudo } = req.body;
  const id = parseInt(req.params.id);

  if (!conteudo || conteudo.trim() === '') {
    return res.status(400).json({ erro: 'Conteúdo obrigatório' });
  }

  try {
    const mensagem = await prisma.mensagem.findUnique({ where: { id_mensagem: id } });
    if (!mensagem || mensagem.id_user !== req.usuario.id) {
      return res.status(404).json({ erro: 'Mensagem não encontrada ou não pertence a você' });
    }

    const atualizada = await prisma.mensagem.update({
      where: { id_mensagem: id },
      data: { conteudo },
    });

    res.json(atualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar mensagem' });
  }
});

// DELETE /mensagens/:id - excluir mensagem
router.delete('/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const mensagem = await prisma.mensagem.findUnique({ where: { id_mensagem: id } });
    if (!mensagem || mensagem.id_user !== req.usuario.id) {
      return res.status(404).json({ erro: 'Mensagem não encontrada ou não pertence a você' });
    }

    await prisma.mensagem.delete({ where: { id_mensagem: id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir mensagem' });
  }
});

export default router;
