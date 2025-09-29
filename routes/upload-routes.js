import express from "express";
import uploadController from "../controllers/upload-controller.js";
import fileUpload from "../middleware/file-upload.js";

const router = express.Router();

router.post("/", fileUpload.single("image"), uploadController.upload);

export default router;
