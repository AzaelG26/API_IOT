import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mqtt from "mqtt";
import auth from "./src/routes/auth";
import box from "./src/routes/box";
import userRoutes from "./src/routes/userRoutes";
import { handleMqttMessage } from "./src/controllers/boxController"; 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/box", box);
app.use("/api/user", userRoutes);

const mqttClient = mqtt.connect({
    host: "3.12.151.30", // IP del broker MQTT
    port: 1883,
    username: "admin", // Opcional
    password: "password123", // Opcional
});

mqttClient.on("connect", () => {
    console.log("Conectado al broker MQTT");
    mqttClient.subscribe("vault/nfc/register", (err) => {
        if (!err) {
            console.log("Suscrito al tópico vault/nfc/register");
        } else {
            console.error("Error al suscribirse:", err);
        }
    });
});

mqttClient.on("message", (topic, message) => {
    handleMqttMessage(topic, message); // Delegar al controlador
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

export { mqttClient };