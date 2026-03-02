import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploads";

export function validateImageFile(file: { mimetype: string; size: number }): { ok: true } | { ok: false; code: string; message: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "Es sind nur JPEG-, PNG- oder WEBP-Dateien erlaubt." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, code: "PAYLOAD_TOO_LARGE", message: "Dateien dürfen maximal 5 MB groß sein." };
  }
  return { ok: true };
}
