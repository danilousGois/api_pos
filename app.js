import express from 'express'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

const app = express()
app.use(express.json())


app.get('/mensagem', async (req, res) => {
    try {
        const mensagens = await prisma.mensagem.findMany()
        res.status(200).json(mensagens)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar mensagens', error: error.message })
    }
})


app.post('/mensagem', async (req, res) => {
    try {
        const mensagem = await prisma.mensagem.create({
            data: {
                conteudo: req.body.conteudo
            }
        })
        res.status(201).json(mensagem)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar mensagem', error: error.message })
    }
})


app.put('/mensagem/:id', async (req, res) => {
    try {
        const mensagem = await prisma.mensagem.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                conteudo: req.body.conteudo
            }
        })
        res.status(200).json(mensagem)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar mensagem', error: error.message })
    }
})


app.delete('/mensagem/:id', async (req, res) => {
    try {
        await prisma.mensagem.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.status(200).json({ message: 'Mensagem deletada' })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar mensagem', error: error.message })
    }
})


app.listen(3000)