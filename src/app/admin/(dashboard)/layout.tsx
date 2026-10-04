import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const links = [
  { href: "/admin", label: "Inbox" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/education", label: "Education & certs" },
  { href: "/", label: "View site" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="container-page flex flex-col gap-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">Admin</p>
            <h1 className="text-lg font-semibold">Portfolio control</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
