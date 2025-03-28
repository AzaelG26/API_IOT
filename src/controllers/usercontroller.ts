import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db, } from "../database";
import { users } from "../database/schemas/schema"; 
import { eq } from "drizzle-orm"; 

export const updateUserProfileController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return; 
        }

        const { name, password } = req.body;
        const updateData: any = {};
        if (name) updateData.username = name;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        res.json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error actualizando perfil", error });
    }
};