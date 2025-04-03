import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mqtt from "mqtt";
import auth from "./src/routes/auth";
import box from "./src/routes/box";
import { handleMqttMessage } from "./src/controllers/boxController"; 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/box", box);

// Conexión MQTT
const mqttClient = mqtt.connect({
  host: "18.117.12.2",
  port: 1883,
  username: "admin",
  password: "password123",
});

mqttClient.on("connect", () => {
  console.log("Conectado al broker MQTT");

  // Limpiar mensajes retenidos en vault/response
  mqttClient.publish("vault/response", "", { retain: true }, (err) => {
    if (err) console.error("Error al limpiar mensaje retenido en vault/response:", err);
    else console.log("Mensaje retenido en vault/response limpiado");
  });

  mqttClient.subscribe("vault/nfc/register", { qos: 1 }, (err) => {
    if (!err) console.log("Suscrito al tópico vault/nfc/register");
    else console.error("Error al suscribirse a vault/nfc/register:", err);
  });

  mqttClient.subscribe("sensor/dht11/data", { qos: 1 }, (err) => {
    if (!err) console.log("Suscrito al tópico sensor/dht11/data");
    else console.error("Error al suscribirse a sensor/dht11/data:", err);
  });

  mqttClient.subscribe("sensor/ultrasonic/object_in", { qos: 1 }, (err) => {
    if (!err) console.log("Suscrito al tópico sensor/ultrasonic/object_in");
    else console.error("Error al suscribirse a sensor/ultrasonic/object_in:", err);
  });

  mqttClient.subscribe("sensor/ultrasonic/object_out", { qos: 1 }, (err) => {
    if (!err) console.log("Suscrito al tópico sensor/ultrasonic/object_out");
    else console.error("Error al suscribirse a sensor/ultrasonic/object_out:", err);
  });
});

// Limpiar manejadores previos y registrar el manejador una sola vez
mqttClient.removeAllListeners("message");
mqttClient.on("message", (topic, message) => {
  handleMqttMessage(topic, message);

  if (topic === "sensor/dht11/data") {
    try {
      const data = JSON.parse(message.toString());
      console.log("Datos del sensor recibidos:", {
        temperatura: data.temperatura,
        humedad: data.humedad,
      });
    } catch (error) {
      console.error("Error al procesar los datos del sensor:", error);
    }
  }

  if (topic === "sensor/ultrasonic/object_in") {
    try {
      const data = JSON.parse(message.toString());
      console.log("Mensaje del sensor ultrasónico (entrada):", data.estado);
    } catch (error) {
      console.error("Error al procesar el mensaje de sensor/ultrasonic/object_in:", error);
    }
  }

  if (topic === "sensor/ultrasonic/object_out") {
    try {
      const data = JSON.parse(message.toString());
      console.log("Mensaje del sensor ultrasónico (salida):", data.estado);
    } catch (error) {
      console.error("Error al procesar el mensaje de sensor/ultrasonic/object_out:", error);
    }
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export { mqttClient };