import express, {Router} from "express";
import {createbox} from "../controllers/boxController";
import {verificarToken} from "../middlewares/verifyToken";
const router: Router = express.Router();

router.post("/createbox", verificarToken,createbox)

export default router;