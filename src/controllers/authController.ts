import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import {db} from "../database";
import {users} from "../database/schemas";
dotenv.config();


const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;
        if (!email) {
            res.status(400).json({msg: "email is required"});
            return;
        }
        if (!password) {
            res.status(400).json({msg: "password is required"});
            return;
        }
        const user = await db.query.users.findFirst({
            where: (users, {eq}) => eq(users.email, email),
        })

        if (!user) {
            res.status(401).json({msg: "User not found"});
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({msg: "Invalid email or password"});
            return;
        }
        const token = jwt.sign({
            id: user.id,
            email: user.username
        }, process.env.JWT_SECRET as string, {expiresIn: '10s'});

        res.status(200).json({
            msg: "User authenticated successfully",
            tkn: token
        });
    }catch(err){
        res.status(401).json({msg: "Server Error"});
        console.log(`error: ${err}`)
    }
}

const registerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const {username, phone, email, password} = req.body;
        if (!username) {
            res.status(400).json({msg: "username is required"});
            return;
        }
        if (!phone) {
            res.status(400).json({msg: "phone is required"});
            return;
        }
        if (!email) {
            res.status(400).json({msg: "email is required"});
            return;
        }
        if (!password) {
            res.status(400).json({msg: "password is required"});
            return;
        }

        const existingUser = await db.query.users.findFirst({
            where: (users, {eq}) => eq(users.email, email),
        });

        if (existingUser) {
            res.status(400).json({msg: "User already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await db.insert(users).values({
            username: username,
            phone: phone,
            email: email,
            password: hashedPassword,
            status: true
        }).returning();

        if (!newUser) {
            res.status(401).json({msg: "Error creating user"});
            return;
        }

        res.status(200).json({
            msg: "User registered successfully",
            usr: {
                id: newUser.id,
                username: newUser.username,
                phone: newUser.phone,
                email: newUser.email,
                status: newUser.status
            }
        });
        console.log("User registered successfully")
    }catch(err){
        res.status(401).json({msg: "Server Error"});
        console.log(`error: ${err}`)
    }
}

export {
    loginController,
    registerController
};