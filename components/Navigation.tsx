import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/feed", label: "Feed" },
  { href: "/reminders", label: "Reminder" },
  { href: "/create-bonsai", label: "Anlegen" },
  { href: "/profile", label: "Profil" },
];

export default function Navigation() {
  const router = useRouter();
  const { status } = useSession();

  if (status !== "authenticated" || router.pathname === "/") {
    return null;
  }

  return (
    <nav className="bonsai-dock dock border-t backdrop-blur">
      {items.map((item) => {
        const active = router.pathname === item.href || router.asPath.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={active ? "dock-active text-primary" : "text-base-content/70"}>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
