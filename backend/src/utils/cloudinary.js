import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path"; // In case you want to use absolute paths

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    console.log("File uploaded successfully:", response.url);

    // Remove the file asynchronously and handle errors
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${localFilePath}`, err);
      } else {
        console.log(`Local file deleted: ${localFilePath}`);
      }
    });

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Remove the file asynchronously even if the upload fails
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(`Error removing file after failed upload: ${localFilePath}`, err);
      }
    });

    return null;
  }
};

export { uploadOnCloudinary };
