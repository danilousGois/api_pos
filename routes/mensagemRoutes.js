import express from 'express';
import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.cookies.token;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.redirect('/login');

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.redirect('/login');
    req.usuario = usuario;
    next();
  });
}

router.get('/', autenticarToken, async (req, res) => {
  try {
    const mensagens = await prisma.mensagem.findMany({
      where: { id_user: req.usuario.id },
      orderBy: { dataHora: 'desc' },
    });
    res.render('mensagens', { mensagens });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar mensagens');
  }
});

router.post('/', autenticarToken, async (req, res) => {
  const { conteudo } = req.body;
  if (!conteudo || conteudo.trim() === '') {
    return res.render('mensagens', { erro: 'Conteúdo obrigatório', mensagens: [] });
  }

  try {
    await prisma.mensagem.create({
      data: {
        conteudo,
        id_user: req.usuario.id,
      },
    });
    res.redirect('/mensagens');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar mensagem');
  }
});

router.post('/editar/:id', autenticarToken, async (req, res) => {
  const { conteudo } = req.body;
  const id = parseInt(req.params.id);

  if (!conteudo || conteudo.trim() === '') {
    return res.redirect('/mensagens');
  }

  try {
    const existente = await prisma.mensagem.findUnique({ where: { id_mensagem: id } });
    if (!existente || existente.id_user !== req.usuario.id) {
      return res.redirect('/mensagens');
    }

    await prisma.mensagem.update({
      where: { id_mensagem: id },
      data: { conteudo },
    });

    res.redirect('/mensagens');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar mensagem');
  }
});

router.post('/excluir/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const existente = await prisma.mensagem.findUnique({ where: { id_mensagem: id } });
    if (!existente || existente.id_user !== req.usuario.id) {
      return res.redirect('/mensagens');
    }

    await prisma.mensagem.delete({ where: { id_mensagem: id } });
    res.redirect('/mensagens');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir mensagem');
  }
});

export default router;
