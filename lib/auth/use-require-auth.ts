import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export function useRequireAuth(): { status: "loading" | "authenticated" | "unauthenticated" } {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace("/");
    }
  }, [router, status]);

  return { status };
}
