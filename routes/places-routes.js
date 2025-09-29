import express from 'express';
import {check} from "express-validator";
import placesController from "../controllers/places-controller.js";
import checkAuth from "../middleware/check-auth.js";

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
	  check("image").not().isEmpty(),
  ],
	placesController.createPlace,
);

router.patch(
  "/:pid",
  [
		check("title").not().isEmpty(),
	  check("description").isLength({ min: 5 })
  ],
	placesController.updatePlace,
);

router.delete("/:pid", placesController.deletePlace);

export default router;
