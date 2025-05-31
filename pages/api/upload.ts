import { createRouter } from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma"; // Adjust the path if needed

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
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
apiRoute.handler({
  onError(error, req: NextApiRequest, res: NextApiResponse) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    res.status(500).json({ error: `Fehler: ${errorMessage}` });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Methode ${req.method} nicht erlaubt.` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req: any, res: NextApiResponse) => {
  const filePath = `/uploads/${req.file?.filename}`;
  const { bonsaiId } = req.body; // Expecting bonsaiId in the request body
    console.log("Received file:", req.file, bonsaiId);
  if (!req.file) {
    return res.status(400).json({ error: "Keine Datei hochgeladen." });
  }

  if (!bonsaiId) {
    console.error("No file uploaded.");

    return res.status(400).json({ error: "Bonsai-ID fehlt." });
  }

  try {
    // Validate bonsaiId format (e.g., UUID)
    

    const updatedBonsai = await prisma.bonsai.update({
      where: { id: Number(bonsaiId) }, // Match the bonsai by its ID
      data: { images: { push: filePath } }, // Add the file path to the images array
    });
    console.log("Bonsai updated successfully:", updatedBonsai);
    return res.status(200).json({ filePath, message: "Bonsai erfolgreich aktualisiert.", bonsai: updatedBonsai });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma-specific error for "Record not found"
      return res.status(404).json({ error: "Bonsai nicht gefunden." });
    }
    console.error("Error updating bonsai:", error);
    return res.status(500).json({ error: "Fehler beim Aktualisieren des Bonsais." });
  }
});

export default apiRoute.handler();

export const config = {
  api: {
    bodyParser: false, // Deaktiviert Body-Parsing für Datei-Uploads
  },
};
