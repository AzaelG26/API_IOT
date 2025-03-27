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

    const newBox = await db.insert(vaults).values({
      nickname: nickname,
      status: true,
      userId: userId,
    }).returning();

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
    const data = JSON.parse(message.toString());
    const { tag_id: tagId, pin } = data;

    console.log("Mensaje recibido vía MQTT:", data);

    try {
      let isValid = false;

      // Validar tag_id si está presente
      if (tagId) {
        const existingNfc = await db
          .select({ id: nfc_keys.id })
          .from(nfc_keys)
          .where(eq(nfc_keys.tagId, tagId))
          .limit(1);

        if (existingNfc.length > 0) {
          console.log("Tag ID válido:", tagId);
          isValid = true;
        } else {
          // Opcional: Insertar nuevo tag_id si no existe
          const nfcResult = await db
            .insert(nfc_keys)
            .values({ tagId })
            .returning({ id: nfc_keys.id });
          console.log("Nuevo Tag ID insertado con ID:", nfcResult[0].id);
        }
      }

      // Validar pin si está presente
      if (pin) {
        const config = await db
          .select({ pin: vaults_configurations.pin })
          .from(vaults_configurations)
          .where(eq(vaults_configurations.pin, parseInt(pin)))
          .limit(1);

        if (config.length > 0) {
          console.log("PIN válido:", pin);
          isValid = true;
        }
      }

      // Enviar respuesta según la validación
      if (isValid) {
        mqttClient.publish("vault/response", "VALID", (err) => {
          if (err) console.error("Error al enviar VALID:", err);
          else console.log("Respuesta VALID enviada");
        });
      } else {
        mqttClient.publish("vault/response", "INVALID", (err) => {
          if (err) console.error("Error al enviar INVALID:", err);
          else console.log("Respuesta INVALID enviada");
        });
      }
    } catch (err) {
      console.error("Error al procesar mensaje MQTT:", err);
      mqttClient.publish("vault/response", "INVALID", (err) => {
        if (err) console.error("Error al enviar INVALID:", err);
      });
    }
  }
};

export { createbox, showBoxByUserId, handleMqttMessage };