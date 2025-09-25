import express from "express";
import usersController from "../controllers/users-controller.js";
import { check } from "express-validator";
import fileUpload from '../middleware/file-upload.js';
const router = express.Router();

router.get("/", usersController.getUsers);
router.post(
  "/signup",
	fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
	usersController.signup,
);
router.post("/login", usersController.login);

export default router;
