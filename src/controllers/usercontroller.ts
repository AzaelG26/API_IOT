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
        const {username, phone, email, password, passwordConfirmation} = req.body;

        const updateData: Record<string, any> = {};

        if (username) updateData.username = username;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (password || passwordConfirmation){
            if (!password || !passwordConfirmation){
                res.status(400).json({msg: "Both password and password confirmation are required"})
                return;
            }
            if (password != passwordConfirmation){
                res.status(400).json({msg: "Password don't match"})
                return;
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ msg: "Data not provided" });
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        res.json({ msg: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error actualizando perfil", error });
    }
};

const getUserController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        res.status(401).json({ msg: "UserId is required " });
        return;
    }

    const user = await db.query.users.findFirst({
        where: (users, {eq}) => eq(users.id, id)
    })

    if (!user) {
        res.status(401).json({ msg: "User not found" });
        return;
    }

    res.status(200).json( user);
}

export { updateUserProfileController, getUserController };