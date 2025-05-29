import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      const bonsai = await prisma.bonsai.findUnique({
        where: { id: Number(id) },
      });
      if (!bonsai) {
        res.status(404).json({ error: "Bonsai nicht gefunden" });
      } else {
        res.status(200).json(bonsai);
      }
      break;
    case "PATCH":
      const { images } = req.body;
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Bilder müssen ein Array sein." });
      }
      const updatedBonsai = await prisma.bonsai.update({
        where: { id: Number(id) },
        data: { images },
      });
      res.status(200).json(updatedBonsai);
      break;
    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method Not Allowed`);
  }
}
