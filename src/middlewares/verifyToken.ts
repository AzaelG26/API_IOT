import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    console.log("Token recibido:", token); // Depura el token recibido

    if (!token) {
        res.status(401).json({ msg: "Token no proporcionado" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        console.log("Token decodificado:", decoded); // Depura el payload
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log("Error en verificación:", error); // Depura el error
        if (error instanceof jwt.TokenExpiredError) {
             res.status(401).json({ msg: "Token expirado. Por favor, inicie sesión de nuevo." });
             return;
        }
        res.status(403).json({ msg: "Token inválido o expirado" });
        return;

    }
};

declare module "express" {
    interface Request {
        userId?: string;
    }
}