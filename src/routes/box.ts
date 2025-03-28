import express, { Router } from "express";
import { createbox, showBoxByUserId, updateVaultPin } from "../controllers/boxController";
import { verificarToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/createbox", verificarToken, createbox);
router.get("/find-box/:id", showBoxByUserId);
router.put("/box/update-pin", verificarToken, updateVaultPin);

export default router;