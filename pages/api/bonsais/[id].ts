import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '../../../prisma/generated/prisma-client';
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Ensure `id` is a valid number
  const bonsaiId = parseInt(id as string, 10);
  if (isNaN(bonsaiId) || bonsaiId <= 0) {
    console.error("Invalid ID received:", id);
    return res.status(400).json({ error: "Ungültige ID. Die ID muss eine positive Zahl sein." });
  }

  switch (req.method) {
    case "GET":
      try {
        const bonsai = await prisma.bonsai.findUnique({
          where: { id: bonsaiId },
          include: { subEntries: true }, // Include subEntries in the response
        });
        if (!bonsai) {
          console.error("Bonsai not found for ID:", bonsaiId);
          return res.status(404).json({ error: "Bonsai nicht gefunden" });
        }
        res.status(200).json(bonsai);
      } catch (error) {
        console.error("Error fetching Bonsai:", error);
        res.status(500).json({ error: "Interner Serverfehler." });
      }
      break;
    case "PATCH":
      const { images } = req.body;
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Bilder müssen ein Array sein." });
      }

      try {
        // Validate and process images (e.g., base64 strings)
        const processedImages = images.map((image: string) => {
          if (!image.startsWith("data:image/")) {
            throw new Error("Ungültiges Bildformat.");
          }
          return image; // Store as-is or process further if needed
        });

        // Update bonsai with image data
        const updatedBonsai = await prisma.bonsai.update({
          where: { id: bonsaiId },
          data: { images: processedImages },
        });

        res.status(200).json(updatedBonsai);
      } catch (error) {
        res.status(500).json({ error: "Fehler beim Speichern der Bilder." });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method Not Allowed`);
  }
}
