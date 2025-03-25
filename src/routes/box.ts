import express, {Router} from "express";
import {createbox, showBoxByUserId} from "../controllers/boxController";
import {verificarToken} from "../middlewares/verifyToken";
const router: Router = express.Router();

router.post("/createbox", verificarToken,createbox)
router.get("/find-box/:id", showBoxByUserId)

export default router;