import {createRouter} from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

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

apiRoute.post((req: any, res: NextApiResponse) => {
  res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Deaktiviert Body-Parsing für Datei-Uploads
  },
};
