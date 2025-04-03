import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mqtt from "mqtt";
import auth from "./src/routes/auth";
import box from "./src/routes/box";
import user from "./src/routes/userRoutes"
import { handleMqttMessage } from "./src/controllers/boxController";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/box", box);
app.use("/api/user", user)

// Conexión MQTT
const mqttClient = mqtt.connect({
    host: "18.117.12.2", // IP del broker MQTT
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

    // Suscripción para el sensor DHT11
    mqttClient.subscribe("sensor/dht11/data", (err) => {
        if (!err) {
            console.log("Suscrito al tópico sensor/dht11/data");
        } else {
            console.error("Error al suscribirse:", err);
        }
    });

    // Suscripción para el sensor ultrasónico de entrada
    mqttClient.subscribe("sensor/ultrasonic/object_in", (err) => {
        if (!err) {
            console.log("Suscrito al tópico sensor/ultrasonic/object_in");
        } else {
            console.error("Error al suscribirse:", err);
        }
    });

    // Suscripción para el sensor ultrasónico de salida
    mqttClient.subscribe("sensor/ultrasonic/object_out", (err) => {
        if (!err) {
            console.log("Suscrito al tópico sensor/ultrasonic/object_out");
        } else {
            console.error("Error al suscribirse:", err);
        }
    });
});

let latestDht11Data = { temperatura: null, humedad: null };

mqttClient.on("message", (topic, message) => {
    handleMqttMessage(topic, message); // Delegar al controlador original

    // Manejo del tópico para el sensor DHT11
    mqttClient.on("message", (topic, message) => {
        if (topic === "sensor/dht11/data") {
            try {
                const data = JSON.parse(message.toString());
                latestDht11Data = { temperatura: data.temperatura, humedad: data.humedad };
                console.log("Últimos datos del sensor actualizados:", latestDht11Data);
            } catch (error) {
                console.error("Error al procesar los datos del sensor:", error);
            }
        }
    });

    // Manejo del tópico para el sensor ultrasónico de entrada
    if (topic === "sensor/ultrasonic/object_in") {
        try {
            const data = JSON.parse(message.toString());
            console.log("Mensaje del sensor ultrasónico (entrada):", data.estado);
        } catch (error) {
            console.error("Error al procesar el mensaje de sensor/ultrasonic/object_in:", error);
        }
    }

    // Manejo del tópico para el sensor ultrasónico de salida
    if (topic === "sensor/ultrasonic/object_out") {
        try {
            const data = JSON.parse(message.toString());
            console.log("Mensaje del sensor ultrasónico (salida):", data.estado);
        } catch (error) {
            console.error("Error al procesar el mensaje de sensor/ultrasonic/object_out:", error);
        }
    }
});

app.get("/api/sensor/dht11", (req, res) => {
    if (latestDht11Data.temperatura !== null && latestDht11Data.humedad !== null) {
        res.json(latestDht11Data);
    } else {
        res.status(404).json({ msg: "No hay datos disponibles aún" });
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

export { mqttClient };