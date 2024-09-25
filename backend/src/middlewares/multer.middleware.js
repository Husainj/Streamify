import multer from 'multer';

// Use memory storage to handle files in memory
const storage = multer.memoryStorage();

export const upload = multer({ storage });
