import prisma from '../prisma.js';

// Criar
export const criarMensagem = async (req, res) => {
  try {
    const { conteudo } = req.body;
    const idUsuario = req.usuario.id;

    if (!conteudo || conteudo.trim() === '') {
      return res.status(400).json({ erro: 'O conteúdo é obrigatório.' });
    }

    const nova = await prisma.mensagem.create({
      data: { conteudo, idUsuario },
    });

    res.status(201).json({ mensagem: 'Criada com sucesso.', dados: nova });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar.', detalhes: error.message });
  }
};

// Listar
export const listarMensagens = async (req, res) => {
  try {
    const mensagens = await prisma.mensagem.findMany({
      include: { usuario: { select: { nome: true, email: true } } },
    });
    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar.', detalhes: error.message });
  }
};

// Buscar por ID
export const buscarMensagem = async (req, res) => {
  const { id } = req.params;
  try {
    const mensagem = await prisma.mensagem.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: { select: { nome: true } } },
    });

    if (!mensagem) return res.status(404).json({ erro: 'Não encontrada.' });

    res.json(mensagem);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar.', detalhes: error.message });
  }
};

// Atualizar
export const atualizarMensagem = async (req, res) => {
  const { id } = req.params;
  const { conteudo } = req.body;

  if (!conteudo || conteudo.trim() === '') {
    return res.status(400).json({ erro: 'Conteúdo obrigatório.' });
  }

  try {
    const mensagem = await prisma.mensagem.findUnique({ where: { id: parseInt(id) } });
    if (!mensagem) return res.status(404).json({ erro: 'Não encontrada.' });

    if (mensagem.idUsuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Não autorizado a editar.' });
    }

    const atualizada = await prisma.mensagem.update({
      where: { id: parseInt(id) },
      data: { conteudo },
    });

    res.json({ mensagem: 'Atualizada com sucesso.', dados: atualizada });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar.', detalhes: error.message });
  }
};

// Deletar
export const deletarMensagem = async (req, res) => {
  const { id } = req.params;

  try {
    const mensagem = await prisma.mensagem.findUnique({ where: { id: parseInt(id) } });
    if (!mensagem) return res.status(404).json({ erro: 'Não encontrada.' });

    if (mensagem.idUsuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Não autorizado a deletar.' });
    }

    await prisma.mensagem.delete({ where: { id: parseInt(id) } });
    res.json({ mensagem: 'Deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar.', detalhes: error.message });
  }
};