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

// Note: MongoDB TTL indexes only work with Date objects, not Number timestamps.
// Since we store expiresAt as a Number (milliseconds) for deterministic testing,
// expiration is checked manually in the controller code rather than via TTL index.
// Expired pastes remain in the database but are treated as "not found" when accessed.

const Paste = mongoose.model('Paste',pasteSchema);
export default Paste;
