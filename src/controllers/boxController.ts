import { Request, Response } from "express";
import { db } from "../database";
import {users, vaults} from "../database/schemas";

const createbox = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nickname } = req.body;
        const  userId  = req.userId;

        if (!nickname) {
            res.status(400).json({ msg: "nickname is required" });
            return;
        }
        if (!userId) {
            res.status(400).json({ msg: "userId is required" });
            return;
        }

        console.log("req.userId:", req.userId);

        const newBox = await db.insert(vaults).values({
            nickname: nickname,
            status: true,
            userId: userId
        }).returning();

        if (!newBox) {
            res.status(401).json({ msg: "Error creating box" });
            return;
        }

        res.status(200).json({
            msg: "Box created successfully",
            box: newBox
        });
        console.log("Box created successfully");
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

    const showBoxByUserId = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;
            if (!id) {
                res.status(400).json({msg: "id is required"});
                return;
            }
            const findBoxById = await db.query.vaults.findFirst({
                where: (vaults, {eq}) => eq(vaults.userId, id)
            });

            if (!findBoxById) {
                res.status(404).json({msg: "Box not found"});
                return;
            }
            res.status(200).json({
                msg: "Box found",
                box: findBoxById
            });
        }catch(err) {
            res.status(500).json({ msg: "Server Error", err });
            console.log(err);
        }
    }
export { createbox, showBoxByUserId };