import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        const { bonsaiId } = req.query;
        if (!bonsaiId) {
          return res.status(400).json({ error: "Bonsai-ID ist erforderlich." });
        }
        const subEntries = await prisma.subEntry.findMany({
          where: { bonsaiId: Number(bonsaiId) },
        });
        res.status(200).json(subEntries);
        break;
      case "POST":
        const { date, notes, images, bonsaiId: bonsaiIdPost } = req.body;
        if (!date || !bonsaiIdPost) {
          return res.status(400).json({ error: "Datum und Bonsai-ID sind erforderlich." });
        }
        const newSubEntry = await prisma.subEntry.create({
          data: { date: new Date(date), notes, images, bonsaiId: Number(bonsaiIdPost) },
        });
        res.status(201).json(newSubEntry);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler." });
  }
}
