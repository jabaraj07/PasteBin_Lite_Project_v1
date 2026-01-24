import express from 'express';
const router = express.Router();
import { viewPasteHTML } from '../controller/pasteController.js';

// HTML view route for pastes
router.get('/p/:id', viewPasteHTML);

export default router;

