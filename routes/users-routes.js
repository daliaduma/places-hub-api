import express from "express";
import usersController from "../controllers/users-controller.js";
import { check } from "express-validator";
const router = express.Router();

router.get("/", usersController.getUsers);
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
	  check("image").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
	usersController.signup,
);
router.post("/login", usersController.login);

export default router;
