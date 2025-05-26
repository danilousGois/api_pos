import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

// Middleware de tratamento de erros genérico
function tratarErros(err, req, res, next) {
    console.error(err)
    res.status(500).json({ message: 'Erro interno do servidor', erro: err.message })
}

// GET - Listar mensagens
app.get('/mensagem', async (req, res, next) => {
    try {
        const mensagens = await prisma.mensagem.findMany()
        res.status(200).json(mensagens)
    } catch (err) {
        next(err)
    }
})

// POST - Criar mensagem
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

// PUT - Atualizar mensagem
app.put('/mensagem/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const { conteudo } = req.body

    if (isNaN(id) || !conteudo) {
        return res.status(400).json({ message: 'ID inválido ou conteúdo ausente' })
    }

    try {
        const mensagem = await prisma.mensagem.update({
            where: { id },
            data: { conteudo }
        })
        res.status(200).json(mensagem)
    } catch (err) {
        next(err)
    }
})

// DELETE - Deletar mensagem
app.delete('/mensagem/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' })
    }

    try {
        await prisma.mensagem.delete({ where: { id } })
        res.status(200).json({ message: 'Mensagem deletada' })
    } catch (err) {
        next(err)
    }
})

// Middleware final de erros
app.use(tratarErros)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})