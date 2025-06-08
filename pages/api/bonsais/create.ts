import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '../../../prisma/generated/prisma-client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getSession } from "next-auth/react"; // Import for session handling
import { getServerSession } from "next-auth";

const prisma = new PrismaClient().$extends(withAccelerate());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method Not Allowed`);
  }

  const session = await getServerSession(req, res, { 
    callbacks: {}, 
    secret: process.env.NEXTAUTH_SECRET 
  }); // Get the authenticated session
  console.log("Session retrieved in API route:", session); // Debugging: Log the session

  if (!session || !session.user || !session.user.email) {
    console.error("Authentication failed. Session:", session);
    return res.status(401).json({ error: "Nicht authentifiziert." });
  }

  const { name, species, location, age, style, ownedSince } = req.body; // Removed height

  if (!name || !species || !location || !age || !style || !ownedSince) {
    return res.status(400).json({ error: "Alle Felder sind erforderlich." });
  }

  try {
    const parsedOwnedSince = new Date(ownedSince); // Parse the date string
    if (isNaN(parsedOwnedSince.getTime())) {
      return res.status(400).json({ error: "Ungültiges Datum für 'Owned Since'." });
    }

    const newBonsai = await prisma.bonsai.create({
      data: {
        name,
        species,
        location,
        age,
        notes: "",
        images: [],
        user: { connect: { email: session.user.email } }, // Associate bonsai with the user
      },
    });

    res.status(201).json({ id: newBonsai.id, message: "Bonsai erfolgreich erstellt." });
  } catch (error) {
    console.error("Fehler beim Erstellen des Bonsais:", error);
    res.status(500).json({ error: "Interner Serverfehler." });
  }
}
