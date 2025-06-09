import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '../../../prisma/generated/prisma-client';
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Ensure `id` is a valid number if provided
  const bonsaiId = id ? parseInt(id as string, 10) : null;
  if (id && (isNaN(bonsaiId) || bonsaiId <= 0)) {
    console.error("Invalid ID received:", id);
    return res.status(400).json({ error: "Ungültige ID. Die ID muss eine positive Zahl sein." });
  }

  switch (req.method) {
    case "GET":
      if (!bonsaiId) {
        return res.status(400).json({ error: "ID ist erforderlich für GET-Anfragen." });
      }
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
      if (!bonsaiId) {
        return res.status(400).json({ error: "ID ist erforderlich für PATCH-Anfragen." });
      }
      const { name, location, species, age, notes, images } = req.body;

      try {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (location) updateData.location = location;
        if (species) updateData.species = species;
        if (age) updateData.age = age;
        if (notes) updateData.notes = notes;
        if (images && Array.isArray(images)) {
          updateData.images = images.map((image: string) => {
            if (!image.startsWith("data:image/")) {
              throw new Error("Ungültiges Bildformat.");
            }
            return image; // Store as-is or process further if needed
          });
        }

        const updatedBonsai = await prisma.bonsai.update({
          where: { id: bonsaiId },
          data: updateData,
        });

        res.status(200).json(updatedBonsai);
      } catch (error) {
        console.error("Error updating Bonsai:", error);
        res.status(500).json({ error: "Fehler beim Aktualisieren des Bonsais." });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method Not Allowed`);
  }
}
