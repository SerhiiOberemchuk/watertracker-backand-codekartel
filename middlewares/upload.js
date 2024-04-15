import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { _id } = req.user;
    let folder = "misc";

    if (file.fieldname === "avatar") {
      folder = "avatars";
    } else if (file.fieldname === "documents") {
      folder = "documents";
    }

    return {
      folder,
      allowed_formats: ["jpg", "png", "webp"],
      public_id: _id,
      transformation: [
        { width: 350, height: 350 },
        { width: 700, height: 700 },
      ],
    };
  },
});

const upload = multer({ storage });

export default upload;
