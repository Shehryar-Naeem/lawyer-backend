import multer from "multer";

const  storage  = multer.memoryStorage();
const multerUpload = multer({ storage });

const singleAvatar = multerUpload.single("avatar");

const attachmentsMulter = multerUpload.array("files", 5);

export { singleAvatar, attachmentsMulter };
