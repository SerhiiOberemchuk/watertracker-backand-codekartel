import multer from "multer";
import path from "path";
import HttpError from "../helpers/HttpError.js";

const tempDir = path.resolve("tmp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename(reg, file, cb) {
    const prefixName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${prefixName}_${file.originalname}`;
    cb(null, fileName);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split(".").pop();
  if (extension === "exe") {
    return cb(HttpError(400, ".exe not valid extension "));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multerConfig,
  limits,
  fileFilter,
});

export default upload;
