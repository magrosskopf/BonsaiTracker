import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        const bonsais = await prisma.bonsai.findMany();
        res.status(200).json(bonsais);
        break;
      case "POST":
        const { name, location, species, age, ownedSince, notes, userId } = req.body;
        if (!name || !location || !species || !age || !ownedSince || !userId) {
          return res.status(400).json({ error: "Alle Felder sind erforderlich." });
        }
        const newBonsai = await prisma.bonsai.create({
          data: { name, location, species, age, ownedSince, notes, userId },
        });
        res.status(201).json(newBonsai);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler." });
  }
}
