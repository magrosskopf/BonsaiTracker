import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export function isManagedMediaPath(src: string | null | undefined): src is string {
  return typeof src === "string" && src.startsWith("/api/media/supabase/");
}

export default function AuthenticatedImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const source = typeof src === "string" ? src : "";

  useEffect(() => {
    if (!isManagedMediaPath(source)) {
      setObjectUrl(null);
      return;
    }

    let revoked = false;
    let nextObjectUrl: string | null = null;
    void (async () => {
      const response = await apiFetch(source);
      if (!response.ok) {
        return;
      }
      const blob = await response.blob();
      if (revoked) {
        return;
      }
      nextObjectUrl = URL.createObjectURL(blob);
      setObjectUrl(nextObjectUrl);
    })();

    return () => {
      revoked = true;
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [source]);

  if (!isManagedMediaPath(source)) {
    return <img src={source} alt={alt} {...props} />;
  }

  if (!objectUrl) {
    return <div aria-label={alt} className={props.className} />;
  }

  return <img src={objectUrl} alt={alt} {...props} />;
}
