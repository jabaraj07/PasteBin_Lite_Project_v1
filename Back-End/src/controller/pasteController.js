import {createPasteData} from "../Helper/dataCreation.js";
import {getPasteData} from "../Helper/getData.js";
import Paste from "../model/pasteSchema.js";
import getCurrentTime from "../Helper/getCurrentTime.js";

// Helper function to escape HTML entities for XSS protection
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
};


export const createPaste = async (req, res) => {
    // Support both lowercase and capitalized field names for flexibility
    const {content, ttl_seconds, ttl_Seconds, max_views, max_Views} = req.body;
    const ttlSeconds = ttl_Seconds !== undefined ? ttl_Seconds : ttl_seconds;
    const maxViews = max_Views !== undefined ? max_Views : max_views;
    
    // Validate content: must be a non-empty string
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({error: 'Content is required and must be a non-empty string'})
    }
    
    // Validate content length (1MB limit = 1,048,576 characters)
    const MAX_CONTENT_LENGTH = 1048576;
    if (content.length > MAX_CONTENT_LENGTH) {
        return res.status(400).json({error: `Content is too long. Maximum length is ${MAX_CONTENT_LENGTH.toLocaleString()} characters (1MB).`})
    }
    
    // Validate ttl_seconds: if present, must be an integer >= 1
    if (ttlSeconds !== undefined && ttlSeconds !== null) {
        if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
            return res.status(400).json({error: 'ttl_Seconds must be an integer and greater than 1'})
        }
    }
    
    // Validate max_views: if present, must be an integer >= 1
    if (maxViews !== undefined && maxViews !== null) {
        if (!Number.isInteger(maxViews) || maxViews < 1) {
            return res.status(400).json({error: 'max_views must be an integer and greater than 1'})
        }
    }
    
    try {
        const Data = await createPasteData(content, ttlSeconds, maxViews);
        if (! Data) {
            return res.status(400).json({error: 'Failed to create paste'})
        }
        // BASE_URL should be the frontend URL (e.g., Vercel domain)
        // For local dev: http://localhost:3000
        // For production: https://your-app.vercel.app
        const frontendUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.status(201).json({
            id: Data.id,
            url: `${frontendUrl}/p/${Data.id}`
        })
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}


export const getPaste = async (req, res) => {
    const {id} = req.params;
    try {
        if (!id) {
            return res.status(400).json({error: 'ID is required'})
        }
        const currentTime = getCurrentTime(req);
        const Data = await getPasteData(id);
        
        // Case 1: Missing paste
        if (! Data) {
            return res.status(404).json({error: 'Paste not found due to missing paste'})
        }

        // Case 2: Expired paste (use deterministic time for testing)
        if (Data.expiresAt !== null && Data.expiresAt < currentTime) {
            return res.status(404).json({error: 'Paste not found due to expiration'})
        }

        // Case 3: View limit exceeded
        if (Data.max_views !== null && Data.viewCount >= Data.max_views) {
            return res.status(404).json({error: 'Paste not found due to view limit exceeded'})
        }

        // Increment view count atomically (only if viewCount < max_views or max_views is null)
        const updateCondition = Data.max_views !== null ? {
            id: id,
            viewCount: {
                $lt: Data.max_views
            }
        } : {
            id: id
        };

        const updatedData = await Paste.findOneAndUpdate(updateCondition, {
            $inc: {
                viewCount: 1
            }
        }, {new: true});

        // If update failed (max views reached between check and update), return 404
        if (!updatedData) {
            return res.status(404).json({error: 'Paste not found due to update failure'})
        }

        // Calculate remaining views
        const remainingViews = updatedData.max_views !== null ? Math.max(0, updatedData.max_views - updatedData.viewCount) : null;

        return res.status(200).json({
            content: updatedData.content,
            "remaining_views": remainingViews,
            expires_at: updatedData.expiresAt ? new Date(updatedData.expiresAt).toISOString() : null
        })
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

export const viewPasteHTML = async (req, res) => {
    const {id} = req.params;
    try {
        if (!id) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Paste Not Found</title></head>
                <body><h1>Paste not found</h1></body>
                </html>
            `)
        }
        const currentTime = getCurrentTime(req);
        const Data = await getPasteData(id);

        // Case 1: Missing paste
        if (! Data) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Paste Not Found</title></head>
                <body><h1>Paste not found</h1></body>
                </html>
            `)
        }

        // Case 2: Expired paste (use deterministic time for testing)
        if (Data.expiresAt !== null && Data.expiresAt < currentTime) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Paste Not Found</title></head>
                <body><h1>Paste not found</h1></body>
                </html>
            `)
        }

        // Case 3: View limit exceeded
        if (Data.max_views !== null && Data.viewCount >= Data.max_views) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Paste Not Found</title></head>
                <body><h1>Paste not found</h1></body>
                </html>
            `)
        }

        // Increment view count atomically (only if viewCount < max_views or max_views is null)
        const updateCondition = Data.max_views !== null ? {
            id: id,
            viewCount: {
                $lt: Data.max_views
            }
        } : {
            id: id
        };

        const updatedData = await Paste.findOneAndUpdate(updateCondition, {
            $inc: {
                viewCount: 1
            }
        }, {new: true});

        // If update failed (max views reached between check and update), return 404
        if (!updatedData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Paste Not Found</title></head>
                <body><h1>Paste not found</h1></body>
                </html>
            `)
        }

        // Escape HTML to prevent XSS attacks
        const safeContent = escapeHtml(updatedData.content);

        // Return HTML with safely rendered content
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Paste - ${escapeHtml(id)}</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    pre {
                        background-color: #ffffff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 15px;
                        overflow-x: auto;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                <pre>${safeContent}</pre>
            </body>
            </html>
        `)
    } catch (error) {
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Error</title></head>
            <body><h1>Internal server error</h1></body>
            </html>
        `)
    }
}
