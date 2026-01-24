import express from 'express';
const router = express.Router();
import { createPaste } from '../controller/pasteController.js';
import { getPaste } from '../controller/pasteController.js';
import mongoose from 'mongoose';

router.get('/healthz', (req, res) => {
    // Check database connection status
    const isConnected = mongoose.connection.readyState === 1; // 1 = connected
    return res.status(200).json({ ok: isConnected });
})

router.post('/pastes',createPaste);

router.get('/pastes/:id',getPaste);

export default router;