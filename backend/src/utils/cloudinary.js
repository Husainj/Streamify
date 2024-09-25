import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file buffer to Cloudinary
const uploadOnCloudinary = async (fileBuffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'user_avatars', public_id: fileName, resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write buffer to stream
      uploadStream.end(fileBuffer);
    });

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary };
