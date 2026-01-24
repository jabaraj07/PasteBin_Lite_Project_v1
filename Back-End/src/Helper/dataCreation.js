import { nanoid } from "nanoid";
import Paste from "../model/pasteSchema.js";

export const createPasteData = async (content, ttlSeconds, maxViews) => {
    const id = nanoid(10); // Generate short unique ID
    const createdAt = Date.now();
    
    const expiresAt = ttlSeconds 
      ? createdAt + (ttlSeconds * 1000) 
      : null;
    
    const paste = await Paste.create({
      id,
      content,
      createdAt,
      ttl_Seconds: ttlSeconds || null,
      max_views: maxViews || null,
      viewCount: 0,
      expiresAt
    });
    
    return paste;
  };    