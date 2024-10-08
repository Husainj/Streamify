import multer from "multer"

// Use memory storage to handle files in memory
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Limit to 50 MB
      }
 });
