import express from 'express'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

const app = express()
app.use(express.json)

app.get('/mensagem', async (req, res) => {

    const mensagens = await prisma.mensagem.findMany()

    res.status(200).json(mensagens)
})

app.post('/mensagem', async (req, res) => {

    await prisma.mensagem.create({
        data: {
            id: req.body.id,
            conteudo: req.body.conteudo
        }
    })

    res.status(201).json(req.body)
})

app.put('/mensagem/:id', async (req, res) => {

    await prisma.mensagem.update({
        where: {
            id: req.params.id
        },

        data: {
            id: req.body.id,
            conteudo: req.body.conteudo
        }

    })

    res.status(201).json(req.body)
})

app.delete('/mensagem/:id', async (req, res) => {

    await prisma.mensagem.delete({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({'message': 'Mensagem deletada'})
})


app.listen(3000)