import express from 'express';
import {
  criarMensagem,
  listarMensagens,
  buscarMensagem,
  atualizarMensagem,
  deletarMensagem
} from '../controllers/mensagemController.js';

import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.use(verificarToken);

router.post('/', criarMensagem);
router.get('/', listarMensagens);
router.get('/:id', buscarMensagem);
router.put('/:id', atualizarMensagem);
router.delete('/:id', deletarMensagem);

export default router;