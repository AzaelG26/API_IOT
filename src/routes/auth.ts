import express, {Router} from "express";
import {loginController, registerController} from "../controllers/authController";

const router: Router = express.Router();
router.post("/login", loginController)
router.post("/register", registerController)

export default router;
