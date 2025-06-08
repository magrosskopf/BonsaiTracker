import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma"; // Adjust the path if necessary
import multer from "multer";
import { createRouter } from "next-connect";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/subentries",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Nur JPEG- und PNG-Dateien sind erlaubt."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Maximal 5 MB
});

const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

apiRoute.use(upload.array("images", 5)); // Allow up to 5 images per subentry

apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const bonsaiId = Number(req.query.bonsaiId);
  if (isNaN(bonsaiId)) {
    console.error("Invalid bonsaiId received in query:", req.query.bonsaiId);
    return res.status(400).json({ error: "Ungültige Bonsai-ID." });
  }

  try {
    console.log("Fetching subentries for bonsaiId:", bonsaiId);
    const subEntries = await prisma.subEntry.findMany({
      where: { bonsaiId },
    });
    console.log("Subentries fetched successfully:", subEntries);
    return res.status(200).json(subEntries);
  } catch (error) {
    console.error("Error fetching subentries for bonsaiId:", bonsaiId, error);
    return res.status(500).json({ error: "Fehler beim Abrufen der Sub-Einträge." });
  }
});

apiRoute.post(async (req: any, res: NextApiResponse) => {
  const { bonsaiId, date, notes } = req.body;

  if (!bonsaiId || isNaN(Number(bonsaiId))) {
    console.error("Invalid bonsaiId received in body:", bonsaiId);
    return res.status(400).json({ error: "Ungültige Bonsai-ID." });
  }

  if (!date) {
    console.error("Missing date in request body.");
    return res.status(400).json({ error: "Datum ist erforderlich." });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    console.error("Invalid date format:", date);
    return res.status(400).json({ error: "Ungültiges Datumsformat." });
  }

  const year = parsedDate.getUTCFullYear();
  if (year < 1900 || year > 2200) {
    console.error("Date out of range:", date);
    return res.status(400).json({ error: "Datum muss zwischen 1900 und 2100 liegen." });
  }

  if (notes && notes.length > 500) {
    console.error("Notes exceed maximum length:", notes.length);
    return res.status(400).json({ error: "Notizen dürfen maximal 500 Zeichen lang sein." });
  }

  const imagePaths = req.files?.map((file: any) => `/uploads/subentries/${file.filename}`) || [];

  try {
    console.log("Creating new subentry for bonsaiId:", bonsaiId, {
      date,
      notes,
      images: imagePaths,
    });
    const newSubEntry = await prisma.subEntry.create({
      data: {
        date: parsedDate,
        notes,
        images: imagePaths,
        bonsaiId: Number(bonsaiId),
      },
    });
    console.log("Subentry created successfully:", newSubEntry);
    return res.status(201).json(newSubEntry);
  } catch (error) {
    console.error("Error creating subentry for bonsaiId:", bonsaiId, error);
    return res.status(500).json({ error: "Fehler beim Erstellen des Sub-Eintrags." });
  }
});

export default apiRoute.handler();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};
