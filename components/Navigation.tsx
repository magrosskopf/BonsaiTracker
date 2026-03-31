import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/feed", label: "Feed" },
  { href: "/reminders", label: "Reminder" },
  { href: "/create-bonsai", label: "Anlegen" },
  { href: "/profile", label: "Profil" },
];

export const hiddenRoutes = new Set(["/", "/waitlist"]);

type NavigationSessionStatus = "authenticated" | "loading" | "unauthenticated";

export function shouldHideNavigation(pathname: string, status: NavigationSessionStatus): boolean {
  return status !== "authenticated" || hiddenRoutes.has(pathname);
}

export function getNavigationItemClassName(active: boolean): string {
  return active ? "bonsai-dock__item bonsai-dock__item--active" : "bonsai-dock__item";
}

export default function Navigation() {
  const router = useRouter();
  const { status } = useSession();

  if (shouldHideNavigation(router.pathname, status)) {
    return null;
  }

  return (
    <nav aria-label="Primäre Navigation" className="bonsai-dock">
      {navigationItems.map((item) => {
        const active = router.pathname === item.href || router.asPath.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={getNavigationItemClassName(active)}>
            <span className="bonsai-dock__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
