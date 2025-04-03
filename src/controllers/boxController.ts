import { Request, Response } from "express";
import { db } from "../database";
import { vaults, nfc_keys, vaults_configurations } from "../database/schemas";
import { eq } from "drizzle-orm";
import { mqttClient } from "../../app";

const createbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname } = req.body;
    const userId = req.userId;

    if (!nickname) {
      res.status(400).json({ msg: "nickname is required" });
      return;
    }
    if (!userId) {
      res.status(400).json({ msg: "userId is required" });
      return;
    }

    console.log("req.userId:", req.userId);

    const newBox = await db
      .insert(vaults)
      .values({
        nickname: nickname,
        status: true,
        userId: userId,
      })
      .returning();

    if (!newBox) {
      res.status(401).json({ msg: "Error creating box" });
      return;
    }

    res.status(200).json({
      msg: "Box created successfully",
      box: newBox,
    });
    console.log("Box created successfully");
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const showBoxByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ msg: "id is required" });
      return;
    }
    const findBoxById = await db.query.vaults.findFirst({
      where: (vaults, { eq }) => eq(vaults.userId, id),
    });

    if (!findBoxById) {
      res.status(404).json({ msg: "Box not found" });
      return;
    }
    res.status(200).json({
      msg: "Box found",
      box: findBoxById,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
    console.log(err);
  }
};

const handleMqttMessage = async (topic: string, message: Buffer): Promise<void> => {
  if (topic === "vault/nfc/register") {
    console.log(`Procesando mensaje en ${topic} a las ${Date.now()}ms`);
    let data;
    try {
      data = JSON.parse(message.toString());
      console.log("Mensaje recibido vía MQTT:", data);
    } catch (err) {
      console.error("Error al parsear el mensaje JSON:", err);
      mqttClient.publish("vault/response", "INVALID", (err) => {
        if (err) console.error("Error al enviar INVALID:", err);
        else console.log("Respuesta INVALID enviada por error de parsing a las " + Date.now() + "ms");
      });
      return; // Salir de la función si el parsing falla
    }

    const { tag_id: tagId, pin } = data;

    try {
      let isValid = false;

      // Validar tag_id si está presente
      if (tagId) {
        const existingNfc = await db
          .select({ id: nfc_keys.id })
          .from(nfc_keys)
          .where(eq(nfc_keys.tagId, tagId))
          .limit(1);
        console.log("Resultado consulta NFC:", existingNfc);
        if (existingNfc.length > 0) {
          console.log("Tag ID válido:", tagId);
          isValid = true;
        } else {
          const nfcResult = await db
            .insert(nfc_keys)
            .values({ tagId })
            .returning({ id: nfc_keys.id });
          console.log("Nuevo Tag ID insertado con ID:", nfcResult[0].id);
        }
      }

      // Validar pin si está presente
      if (pin) {
        const parsedPin = parseInt(pin); // Convertir a entero para coincidir con DB
        console.log("Buscando PIN en DB:", pin, "como entero:", parsedPin);
        const config = await db
          .select({ pin: vaults_configurations.pin })
          .from(vaults_configurations)
          .where(eq(vaults_configurations.pin, parsedPin))
          .limit(1);
        console.log("Resultado consulta PIN:", config);
        if (config.length > 0) {
          console.log("PIN válido:", pin);
          isValid = true;
        } else {
          console.log("PIN no encontrado en DB");
        }
      }

      // Enviar una única respuesta
      const response = isValid ? "VALID" : "INVALID";
      console.log("Resultado final de isValid:", isValid);
      mqttClient.publish("vault/response", response, (err) => {
        if (err) console.error(`Error al enviar ${response}:`, err);
        else console.log(`Respuesta ${response} enviada a las ${Date.now()}ms`);
      });
    } catch (err) {
      console.error("Error al procesar mensaje MQTT:", err);
      mqttClient.publish("vault/response", "INVALID", (err) => {
        if (err) console.error("Error al enviar INVALID:", err);
        else console.log("Respuesta INVALID enviada por error a las " + Date.now() + "ms");
      });
    }
  }
};
export { createbox, showBoxByUserId, handleMqttMessage };