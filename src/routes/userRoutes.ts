import express, { Router } from "express";
import { updateUserProfileController } from "../controllers/usercontroller";
import { verificarToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.put("/user/profile", verificarToken, updateUserProfileController);

export default router;