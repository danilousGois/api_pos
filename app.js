import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

// Middleware para tratar erros
function tratarErros(err, req, res, next) {
    console.error(err)
    res.status(500).json({ message: 'Erro interno do servidor', erro: err.message })
}

// Middleware para verificar se a mensagem existe
async function verificarMensagemExiste(req, res, next) {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        return res.status(400).json({
            status: 400,
            error: 'ID inválido',
            message: 'O ID fornecido na URL não é um número válido.'
        })
    }

    try {
        const mensagem = await prisma.mensagem.findUnique({
            where: { id }
        })

        if (!mensagem) {
            return res.status(404).json({
                status: 404,
                error: 'Não encontrado',
                message: `Nenhuma mensagem foi encontrada com o ID ${id}.`
            })
        }

        req.mensagem = mensagem
        next()
    } catch (err) {
        next(err)
    }
}

// GET - Listar todas as mensagens
app.get('/mensagem', async (req, res, next) => {
    try {
        const mensagens = await prisma.mensagem.findMany()
        res.status(200).json(mensagens)
    } catch (err) {
        next(err)
    }
})

// GET - Buscar mensagem por ID (com middleware)
app.get('/mensagem/:id', verificarMensagemExiste, (req, res) => {
    res.status(200).json(req.mensagem)
})

// POST - Criar nova mensagem
app.post('/mensagem', async (req, res, next) => {
    const { conteudo } = req.body

    if (!conteudo) {
        return res.status(400).json({ message: 'Conteúdo é obrigatório' })
    }

    try {
        const novaMensagem = await prisma.mensagem.create({ data: { conteudo } })
        res.status(201).json(novaMensagem)
    } catch (err) {
        next(err)
    }
})

// PUT - Atualizar mensagem (com middleware)
app.put('/mensagem/:id', verificarMensagemExiste, async (req, res, next) => {
    const { conteudo } = req.body

    if (!conteudo) {
        return res.status(400).json({ message: 'Conteúdo é obrigatório' })
    }

    try {
        const mensagemAtualizada = await prisma.mensagem.update({
            where: { id: req.mensagem.id },
            data: { conteudo }
        })

        res.status(200).json(mensagemAtualizada)
    } catch (err) {
        next(err)
    }
})

// DELETE - Deletar mensagem (com middleware)
app.delete('/mensagem/:id', verificarMensagemExiste, async (req, res, next) => {
    try {
        await prisma.mensagem.delete({ where: { id: req.mensagem.id } })
        res.status(200).json({ message: 'Mensagem deletada com sucesso' })
    } catch (err) {
        next(err)
    }
})

// Middleware para rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        error: 'Rota não encontrada',
        message: `A rota ${req.method} ${req.originalUrl} não foi encontrada.`
    })
})

// Middleware final de erros
app.use(tratarErros)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})