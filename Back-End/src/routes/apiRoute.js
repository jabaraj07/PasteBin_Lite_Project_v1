import express from 'express';
const router = express.Router();
import { createPaste } from '../controller/pasteController.js';
import { getPaste } from '../controller/pasteController.js';

router.get('/healthz', (req, res) => {
    return res.status(200).json({ ok: true });
})

router.post('/pastes',createPaste);

router.get('/pastes/:id',getPaste);

export default router;