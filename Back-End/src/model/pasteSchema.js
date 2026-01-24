import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        required: true,
        default: () => Date.now()
    },
    ttl_Seconds: {
        type: Number,
        default: null
    },
    max_views: {
        type: Number,
        default: null
    },
    viewCount: {
        type: Number,
        required: true,
        default: 0
    },
    expiresAt: {
        type: Number,
        default: null
    }
})

pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Paste = mongoose.model('Paste',pasteSchema);
export default Paste;
