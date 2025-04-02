import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db, } from "../database";
import { users } from "../database/schemas/schema";
import { eq } from "drizzle-orm"; 

const updateUserProfileController = async (req: Request, res: Response) => {
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

const getUserController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        res.status(401).json({ message: "UserId is required " });
        return;
    }

    const user = await db.query.users.findFirst({
        where: (users, {eq}) => eq(users.id, id)
    })

    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    res.status(200).json( user);
}

export { updateUserProfileController, getUserController };