import multer from "multer";

// const  storage  = multer.memoryStorage();
// const multerUpload = multer({ storage });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const multerUpload = multer({ storage: storage });
const singleAvatar = multerUpload.single("files");

const attachmentsMulter = multerUpload.array("files", 5);

export { singleAvatar, attachmentsMulter };

