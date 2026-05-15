/* eslint-disable no-useless-escape */
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";


const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {

    // 🔥 VALIDATION START

    // File size validation handled by multer (we'll add below)

    // Validate file type
    // if (file.fieldname === "company_logo") {
    //   const allowedLogoTypes = ["image/png", "image/jpeg", "image/jpg"];

    //   if (!allowedLogoTypes.includes(file.mimetype)) {
    //     throw new Error("Company logo must be PNG or JPEG");
    //   }
    // }

    // if (file.fieldname === "media") {
    //   const allowedMediaTypes = ["image/png", "image/jpeg", "image/jpg"];

    //   if (!allowedMediaTypes.includes(file.mimetype)) {
    //     throw new Error("Media must be image files only");
    //   }
    // }

    // 🔥 VALIDATION END

    return {
      public_id: generateFileName(file),

      // optional but recommended 👇
      folder:
        file.fieldname === "company_logo"
          ? "service/logo"
          : "service/media",
    };
  },
});

const generateFileName = (file: Express.Multer.File) => {
  // Remove extension from original filename first
  const nameWithoutExt = file.originalname
    .toLowerCase()
    .replace(/\.[^/.]+$/, ""); // Remove extension using regex

  const fileName = nameWithoutExt
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const uniqueFileName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileName;

  // Return without extension - let Cloudinary add it automatically
  return uniqueFileName;
};

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 10MB
  },
});