import express, {Router} from "express";
import {loginController, registerController} from "../controllers/authController";
import {createbox} from "../controllers/boxController";
import {verificarToken} from "../middlewares/verifyToken";

const router: Router = express.Router();
router.post("/login", loginController)
router.post("/register", registerController)
router.post("/createbox", verificarToken, createbox) 

export default router;