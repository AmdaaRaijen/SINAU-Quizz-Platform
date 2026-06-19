import multer from "multer";

const maxMegabytes = Number(process.env.MAX_PDF_SIZE_MB || 10);

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: maxMegabytes * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Hanya menerima file berformat PDF"));
    }
  }
});
