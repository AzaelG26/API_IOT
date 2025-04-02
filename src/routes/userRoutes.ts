import express, { Router } from "express";
import {getUserController, updateUserProfileController} from "../controllers/usercontroller";
import { verificarToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.put("/user/profile", verificarToken, updateUserProfileController);
router.get("/user/:id", getUserController);
export default router;